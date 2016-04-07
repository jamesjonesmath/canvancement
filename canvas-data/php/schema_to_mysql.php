<?php
/*
 * This program will generate a MySQL script that can be used to create
 * a Canvas Data schema
 */

// START OF CONFIGURATION

/*
 * $schema_name is the name of the database you want to use for your
 * Canvas Data. If you don't specify one, it uses 'canvas_data'
 */
$schema_name = 'canvas_data';

/*
 * $schema_file is the path and filename of the schema file from the CLI tool
 * If you are not using the CLI tool, then be sure to define the
 * Canvas Data API key and secret so it can download one. You will
 * also need to make sure the api.php file is in the same directory
 * as this script
 */
$schema_file = 'schema.json';

/*
 * If you do not use the Canvas Data Command Line Interface tool
 * and do not have a schema.json file available to you, then you
 * this script will attempt to download the latest version, but it
 * needs your Canvas Data API Key and Secret to do it. You may
 * specify it in the environment variables cd_api_key and cd_api_secret
 * or you may hard-code it into this file.
 *
 * You can leave this part blank point $schema_file to the proper file
 */
$cd_api_key = getenv( 'CD_API_KEY' ) !== FALSE ? getenv( 'CD_API_KEY' ) : 'ENTER CANVAS DATA API KEY HERE';
$cd_api_secret = getenv( 'CD_API_SECRET' ) !== FALSE ? getenv( 'CD_API_SECRET' ) : 'ENTER CANVAS DATA API SECRET HERE';

/*
 * $options sets values for the SQL file
 * drop: include a command to drop the database before creating the new one
 * comments: include the comments and descriptions in the SQL statements
 */
$options = array ( 
    'drop_schema' => TRUE, 
    'comments' => TRUE 
);

/*
 * Set $output_filename to the name of a file if you wish to save the output
 * Otherwise it will print to STDOUT and you can redirect or pipe it into
 * a file or application. If you want an extension (like .sql) make sure
 * you include it.
 * No sanity checking is done on the filename, so make sure you don't clobber
 * something important.
 */
// $output_filename = 'create_canvas_data.sql';

// END OF CONFIGURATION

$schema = NULL;
if (file_exists( $schema_file )) {
  $contents = file_get_contents( $schema_file );
  if ($contents !== FALSE) {
    $schema = json_decode( $contents, TRUE );
  }
} else {
  if (empty( $cd_api_key ) || empty( $cd_api_secret )) {
    die( 'Must specify Canvas Data API and Secret before running' );
  }
  require (__DIR__ . '/api.php');
  $CDAPI = new CanvasDataAPI( $cd_api_key, $cd_api_secret );
  $schema = $CDAPI->get_schema_latest();
}

if (! isset( $schema )) {
  die( 'Unable to obtain a Canvas Data schema' );
}

$sql = create_mysql_schema( $schema, $schema_name, $options );

if (! empty( $output_filename )) {
  $fh = fopen( $output_filename, 'w' );
  if ($fh === FALSE) {
    die( 'Unable to open output ' . $output_filename . ' for writing' );
  }
  fwrite( $fh, $sql );
  fclose( $fh );
} else {
  print ($sql) ;
}

function c() {
  $args = func_get_args();
  $t = line( $args );
  return empty( $t ) ? '' : $t . ";\n";
}

function l() {
  $args = func_get_args();
  $t = line( $args );
  return empty( $t ) ? '' : $t . "\n";
}

function line($args) {
  $t = NULL;
  if (count( $args ) == 1) {
    $t = $args[0];
  } else {
    $fmt = array_shift( $args );
    $t = vsprintf( $fmt, $args );
  }
  return $t;
}

function create_mysql_schema($cdschema = NULL, $schema_name = 'canvas_data', $opts = NULL) {
  if (empty( $cdschema )) {
    return;
  }
  
  $type_overrides = array ( 
      'int' => 'integer unsigned', 
      'integer' => 'integer unsigned', 
      'double precision' => 'double', 
      'text' => 'longtext', 
      'guid' => 'varchar(36)', 
      'timestamp' => 'timestamp null' 
  );
  $drop_schema = isset( $opts['drop_schema'] ) && $opts['drop_schema'] ? TRUE : FALSE;
  $add_comments = ! isset( $opts['comments'] ) || $opts['comments'] ? TRUE : FALSE;
  
  $t = '';
  $t .= l( '# MySQL script to create database for Canvas Data schema version %s', $cdschema['version'] );
  if ($drop_schema) {
    $t .= c( 'DROP DATABASE IF EXISTS %s', $schema_name );
  }
  $t .= c( 'CREATE DATABASE IF NOT EXISTS %s', $schema_name );
  $t .= c( 'USE %s', $schema_name );
  $t .= c( 'SET NAMES utf8' );
  foreach ( $cdschema['schema'] as $key => $table ) {
    $table_name = isset( $table['tableName'] ) ? $table['tableName'] : $key;
    $columns = array ();
    foreach ( $table['columns'] as $colkey => $column ) {
      $colname = strtolower( $column['name'] );
      $coltype = strtolower( $column['type'] );
      $colextra = '';
      $comment = empty( $column['description'] ) ? '' : $column['description'];
      if (isset( $type_overrides[$coltype] )) {
        $coltype = $type_overrides[$coltype];
      }
      if ($coltype == 'varchar') {
        $coltype .= sprintf( '(%d)', $column['length'] );
      }
      if ($coltype == 'enum') {
        preg_match_all( '/\'(.*?)\'/', $comment, $matches );
        if (empty( $matches )) {
          die( "Invalid match in enumerated field for $key.$colname" );
        }
        $comment = preg_replace( '/\s*Possible values.*?(\.|$)/', '', $comment );
        $comment = trim( $comment );
        $enumvalues = join( ', ', $matches[0] );
        $colextra .= sprintf( '(%s)', $enumvalues );
      }
      $columndef = sprintf( '  `%s` %s', $column['name'], strtoupper( $coltype ) );
      if (! empty( $colextra )) {
        $columndef .= $colextra;
      }
      if (isset( $table['dw_type'] ) && $table['dw_type'] == 'dimension' && $colname == 'id') {
        $columndef .= ' PRIMARY KEY';
      }
      if ($add_comments && ! empty( $comment )) {
        $columndef .= sprintf( " COMMENT '%s'", addslashes( $comment ) );
      }
      $columns[] = $columndef;
    }
    if (count( $columns ) > 0) {
      if (! isset( $table['incremental'] ) || $table['incremental'] == FALSE) {
        $t .= c( 'DROP TABLE IF EXISTS %s', $table_name );
      }
      $create = l( 'CREATE TABLE IF NOT EXISTS %s (', $table_name );
      $create .= join( ",\n", $columns ) . "\n";
      $create .= ') ENGINE = MyISAM DEFAULT CHARSET=utf8';
      if ($add_comments && ! empty( $table['description'] )) {
        $create .= sprintf( ' COMMENT = "%s"', addslashes( $table['description'] ) );
      }
      $t .= c( $create );
    }
  }
  return $t;
}
