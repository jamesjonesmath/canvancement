#!/bin/bash

# START OF CONFIGURATION

# dbname is the name of the Canvas Data database
dbname=canvas_data

# basedir is the directory containing the data files.
# These may be from the CLI tool or files you've manually downloaded
# The names of the files do not depend on the structure of the CLI tool
# It may be a relative path to the current directory or an absolute path
basedir=dataFiles

# checksequence queries the database before importing data to see if
# this sequence has already been imported. It mostly applies to
# incremental files like the requests table. It allows you to leave your
# files on the disk without having to extract them or truncate your tables
# It can also be used to pick back up where you left off, although if the
# sequence bombs in the middle, you may need to truncate the offended table
# Note that this relies on a versions table that was created using the
# accompanying SQL script
checksequence=1

# incrementaltables is a comma separated list of the tables that are partial
# and should not have their tables truncated before importing
# If you are using checksequence=1, then it will try to figure this out from
# the database
incrementaltables=requests

# leaveasgzip temporarily extracts the compressed gzip file for importing
# but then removes the uncompressed version after the import
# This is an attempt to save file space
leaveasgzip=1

# MYSQL is the mysql command that is needed to execute mysql
# You can put items like username and password here, but it is recommended
# that you configure the ~/.my.cnf file instead
MYSQL=mysql

# verbosity controls the logging of messages
# 0 = no logging of messages
# 1 = minimal logging of 1 per file
# 2 = log importing of data into database
# 3 = more verbose logging including decompressing file and truncating tables
# 4 = log little things that probably don't need logged
verbosity=1

# END OF CONFIGURATION


# Create a temporary file to hold all of the files to be considered
# Store only the directory and basenames to allow for both the compressed
# and uncompressed versions to exist
# This file will be created in your systems $TMPDIR folder,
# which is often /tmp or /var/tmp
# The file will be removed if the process successfully completes, but will
# be orphaned if it aborts
tmpfile="$(mktemp)"
find "${basedir}" -type f -regextype posix-egrep -regex '.*/([0-9]+_)?[a-z_]+-[0-9]{5}-[0-9a-f]{8}(\.gz)?$' -printf '%h/' -exec basename {} .gz \; | sort -u > "${tmpfile}"


if [ ${checksequence} -eq 1 ]
then
  # Try to fetch the list of incremental tables from the database
  tables=$( ${MYSQL} ${dbname} -sse "SELECT CONCAT_WS(',', table_name) FROM versions WHERE incremental=1" )
  if [ "${tables}" != "" ]
  then
    incrementaltables="${tables}"
  fi
fi

# Initialize some variables
oldtable=""
oldseq=""
hasprocessed=0

# Iterate through the files
for pathname in $(cat "${tmpfile}")
do

  if [ ${verbosity} -gt 0 ]
  then
    echo "Processing ${pathname}"
  fi

  # Split the filename into parts
  dirname=$(dirname "${pathname}")
  filename=$(basename "${pathname}")
  firstpart=$(echo "${filename}" | cut -f1 -d-)
  tablepart=$(echo "${firstpart}" | sed -r "s/^[0-9]+_//")
  seqpart=$(echo "${firstpart}" | grep -Eo "^[0-9]+")
  numidpart=$(echo "${filename}" | cut -f2- -d-)

  # Check to see if the previous table has been processed, if so then update the database
  if [ ${hasprocessed} -eq 1 -a ${checksequence} -eq 1 -a "${oldtable}" != "${tablepart}" -a "$oldseq" != "" ]
  then

    if [ ${verbosity} -ge 4 ]
    then
      echo "Updating sequence number for ${oldtable} to ${oldseq}"
    fi

    $( ${MYSQL} ${dbname} -sqe "UPDATE versions SET version = ${oldseq} WHERE table_name = '${oldtable}'" )
    hasprocessed=0
  fi

  process=1

  # Get the last version imported
  if [ ${checksequence} -eq 1 -a "$seqpart" != ""  ]
  then

    if [ ${verbosity} -ge 4 ]
    then
      echo "Checking for previously saved version of ${tablepart}"
    fi

    extseq=$( ${MYSQL} ${dbname} -sse "SELECT IFNULL(version,0) FROM versions WHERE table_name='${tablepart}'" )
    if [ "${extseq}" == "" -o ${extseq} -ge $seqpart ]
    then
      process=0
    fi
  fi

  # Process this file
  if [ ${process} -eq 1 ]
  then
    removefile=0
    datafile="${dirname}/${filename}"
    if [ ! -f "${datafile}" ]
    then
      # There is no already-extracted file
      if [ -f "${datafile}.gz" ]
      then
        # There is a gzipped version

        if [ ${verbosity} -ge 3 ]
        then
          echo "Uncompressing ${filename}"
        fi

        if [ ${leaveasgzip} -eq 1 ]
        then
          # Extract it, but plan on removing it later
          gzip -dc "${datafile}.gz" > "${datafile}"
          removefile=1
        else
          # Extract it and leave it extracted
          gzip -d "${datafile}.gz"
        fi
      fi
    fi

    # Check to see if this is an incremental table
    partial=0
    if [ "${incrementaltables/$tablepart}" != "${incrementaltables}" ]
    then
      partial=1
    fi

    # If it is incremental or the previous file used the same table,
    # then don't truncate it first, but do an append instead
    if [ ${partial} -eq 0 -o "${oldtable}" != "${tablepart}" ]
    then

      if [ ${verbosity} -ge 3 ]
      then
        echo "Truncating ${tablepart}"
      fi

      ${MYSQL} ${dbname} -sqe "TRUNCATE ${tablepart}"

    fi
    # Load the data into the table

    if [ ${verbosity} -ge 2 ]
    then
      echo "Loading ${filename} into ${tablepart}"
    fi

    ${MYSQL} ${dbname} -sqe "LOAD DATA LOCAL INFILE '${datafile}' INTO TABLE ${tablepart}"

    hasprocessed=1
    # Remove the uncompressed version if needed
    if [ ${removefile} -eq 1 ]
    then

      if [ ${verbosity} -ge 4 ]
      then
        echo "Removing uncompressed version of ${datafile}"
      fi

      rm "${datafile}"
    fi

  fi

  # Update the previous table and sequence data
  oldtable=${tablepart}
  oldseq=${seqpart}

done

# Update the sequence on the final file if necessary
if [ ${hasprocessed} -eq 1 -a ${checksequence} -eq 1 -a "${oldtable}" != "" -a "$oldseq" != "" ]
then

  if [ ${verbosity} -ge 4 ]
  then
    echo "Updating sequence number for ${oldtable} to ${oldseq}"
  fi

  $( ${MYSQL} ${dbname} -sqe "UPDATE versions SET version = ${oldseq} WHERE table_name = '${oldtable}'" )
fi

# Remove the list of files
rm "${tmpfile}"
