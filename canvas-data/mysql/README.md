# MySQL Scripts for Canvas Data
These scripts are automatically generated from the Canvas Data schema file using the php script [schema_to_mysql.php](/canvas-data/php/schema_to_mysql.php)

The scripts should be considered as a starter to get your data from Canvas Data quickly into a MySQL database. 
There is a lot of tweaking that could happen to them and indexes that could be added to speed things up.

## Create Canvas Data
There are two versions of this file, one with SQL comments and one without SQL comments. Otherwise, the files are same.

The files include one table that is not part of Canvas Data. This is the *versions* table that contains the latest version of the table
that has been loaded. It is used by the import script to make sure that only new information is loaded instead of blindly loading everything.
You can set the *versions.version* to a really large value to skip loading a table. 
This may be useful if you don't want to load the requests table, which is quite large.

## Import Script
This is a BASH script that will import the data into the MySQL database. You can configure the settings, but as it comes, 
it should be executed from a folder containing a subfolder *dataFiles* that contains the data downloaded from Canvas Data.

This script tries to import **all** of the Canvas Data, which may not be what you really want once you get into it and start playing around. It requires that you created the database using the scripts above to work.

If you wish to skip the *requests* table due to the size (or any table really), you can set the value of *versions.version* to a number bigger than the largest sequence number

```sql
USE canvas_data;
UPDATE versions SET version = 1000 WHERE table_name = 'requests';
```

You can also set the sequence number lower to load just a few days of the *requests* table. It will load any files with a sequence number greater than the corresponding *versions.version* value, so look in your *requests* folder and see what sequence numbers you have and then set the value accordingly.
