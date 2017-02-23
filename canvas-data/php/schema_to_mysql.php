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
 * specify it in the environment variables CD_API_KEY and CD_API_SECRET
 * or you may hard-code it into this file.
 *
 * You can leave this part blank if you point $schema_file to the proper file.
 * Otherwise, replace the constant at the end of each line with the appropriate value.
 */
$cd_api_key = getenv( 'CD_API_KEY' ) !== FALSE ? getenv( 'CD_API_KEY' ) : 'ENTER CANVAS DATA API KEY HERE';
$cd_api_secret = getenv( 'CD_API_SECRET' ) !== FALSE ? getenv( 'CD_API_SECRET' ) : 'ENTER CANVAS DATA API SECRET HERE';

/*
 * $options sets values for the SQL file
 * drop: include a command to drop the database before creating the new one
 * comments: include the comments and descriptions in the SQL statements
 * engine: override the default MySQL engine, which is InnoDB
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

if (isset( $config_file ) && file_exists( $config_file )) {
}

$schema = NULL;
$json_schema = NULL;
if (file_exists( $schema_file )) {
  $contents = file_get_contents( $schema_file );
  if ($contents !== FALSE) {
    $schema = json_decode( $contents, TRUE );
  }
}
if (! isset( $schema )) {
  if (empty( $cd_api_key ) || empty( $cd_api_secret )) {
    die( 'Must specify Canvas Data API and Secret before running' );
  }
  require (__DIR__ . '/api.php');
  $CDAPI = new CanvasDataAPI( $cd_api_key, $cd_api_secret );
  $CDAPI->return_json( TRUE );
  $json_schema = $CDAPI->get_schema_latest();
  if (isset( $json_schema )) {
    $schema = json_decode( $json_schema, TRUE );
  }
}

if (! isset( $schema ) || ! is_array( $schema )) {
  die( 'Unable to obtain a Canvas Data schema' );
}

if (isset( $schema['error'] )) {
  die( $schema['message'] );
}

// Write the json_schema file if we had to download it
if (isset( $json_schema ) && isset( $schema_file )) {
  $fh = fopen( $schema_file, 'w' );
  if ($fh !== FALSE) {
    fwrite( $fh, $json_schema );
    fclose( $fh );
  }
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
      'timestamp' => 'datetime' 
  );
  $drop_schema = isset( $opts['drop_schema'] ) && $opts['drop_schema'] ? TRUE : FALSE;
  $add_comments = ! isset( $opts['comments'] ) || $opts['comments'] ? TRUE : FALSE;
  $mysql_engine = isset( $opts['engine'] ) ? $opts['engine'] : 'InnoDB';
  
  $t = '';
  $t .= l( '# MySQL script to create database for Canvas Data schema version %s', $cdschema['version'] );
  $t .= c( 'SET default_storage_engine=%s', $mysql_engine );
  if ($mysql_engine == 'InnoDB') {
    $t .= c( 'SET GLOBAL innodb_file_per_table=1' );
  }
  if ($drop_schema) {
    $t .= c( 'DROP DATABASE IF EXISTS %s', $schema_name );
  }
  $t .= c( 'CREATE DATABASE IF NOT EXISTS %s DEFAULT CHARACTER SET utf8mb4', $schema_name );
  $t .= c( 'USE %s', $schema_name );
  $t .= c( 'SET NAMES utf8mb4' );
  $table_types = array ();
  foreach ( $cdschema['schema'] as $key => $table ) {
    $table_name = isset( $table['tableName'] ) ? $table['tableName'] : $key;
    $table = table_overrides( $table, $table_name );
    $table_types[$table_name] = isset( $table['incremental'] ) ? $table['incremental'] : FALSE;
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
      if (isset( $column['extra'] )) {
        $colextra .= $column['extra'];
      }
      $columndef = sprintf( '  `%s` %s', $column['name'], strtoupper( $coltype ) );
      if (! empty( $colextra )) {
        $colextra = trim( $colextra );
        if (! preg_match( '/^\(/', $colextra )) {
          $columndef .= ' ';
        }
        $columndef .= $colextra;
      }
      if ($add_comments && ! empty( $comment )) {
        $comment = preg_replace( '/\n/', ' ', $comment );
        $comment = preg_replace( '/\s+/', ' ', $comment );
        $columndef .= sprintf( " COMMENT '%s'", addslashes( trim( $comment ) ) );
      }
      $columns[] = $columndef;
    }
    if (count( $columns ) > 0) {
      if (isset( $table['KEYS'] )) {
        foreach ( $table['KEYS'] as $keytype => $keyinfo ) {
          switch ($keytype) {
            case 'primary' :
              $columns[] = sprintf( 'PRIMARY KEY (%s)', $keyinfo );
              break;
            case 'unique' :
              foreach ( $keyinfo as $keyname => $keyfields ) {
                $columns[] = sprintf( 'UNIQUE KEY %s (%s)', $keyname, $keyfields );
              }
              break;
            case 'index' :
              foreach ( $keyinfo as $keyname => $keyfields ) {
                $columns[] = sprintf( 'INDEX %s (%s)', $keyname, $keyfields );
              }
              break;
            default :
              break;
          }
        }
      }
      if (! isset( $table['incremental'] ) || $table['incremental'] == FALSE) {
        $t .= c( 'DROP TABLE IF EXISTS %s', $table_name );
      }
      $create = l( 'CREATE TABLE IF NOT EXISTS %s (', $table_name );
      $create .= join( ",\n", $columns ) . "\n";
      $create .= ')';
      if ($add_comments && ! empty( $table['description'] )) {
        $comment = preg_replace( '/\n/', ' ', $table['description'] );
        $comment = preg_replace( '/\s+/', ' ', $comment );
        $create .= sprintf( ' COMMENT = "%s"', addslashes( trim( $comment ) ) );
      }
      $t .= c( $create );
    }
  }
  $t .= c( 'DROP TABLE IF EXISTS versions' );
  $create = l( 'CREATE TABLE IF NOT EXISTS versions (' );
  $create .= l( '  table_name VARCHAR(127) PRIMARY KEY NOT NULL%s,', $add_comments ? " COMMENT 'Name of Canvas Data table'" : '' );
  $create .= l( '  version BIGINT DEFAULT NULL%s,', $add_comments ? " COMMENT 'Latest version downloaded'" : '' );
  $create .= l( '  incremental TINYINT DEFAULT NULL%s', $add_comments ? " COMMENT 'Incremental (1) or complete (0)?'" : '' );
  $create .= ')';
  $create .= $add_comments ? ' COMMENT = "Used by import script"' : '';
  $t .= c( $create );
  $version_code = explode( '.', $cdschema['version'] );
  $version = 0;
  foreach ( $version_code as $version_part ) {
    $version = $version * 100 + $version_part;
  }
  $versions = "INSERT INTO versions (table_name, incremental, version) VALUES\n";
  foreach ( $table_types as $table_name => $incremental ) {
    $versions .= sprintf( "  ('%s',%d,%s),\n", $table_name, $incremental ? 1 : 0, 'NULL' );
  }
  $versions .= sprintf( "  ('%s',%d,%d)", 'schema', - 1, $version );
  $t .= c( $versions );
  
  return $t;
}

function table_overrides($T = NULL, $table_name = NULL) {
  if (empty( $T )) {
    return;
  }
  if (! isset( $table_name )) {
    $table_name = $T['tableName'] || '';
  }
  $overrides = array ( 
      'requests' => array ( 
          'web_applicaiton_action' => array ( 
              'rename', 
              'web_application_action' 
          ) 
      ), 
      'quiz_question_answer_dim' => array ( 
          'KEYS' => array ( 
              'unique' => array ( 
                  'id' => 'id,quiz_question_id' 
              ) 
          ) 
      ), 
      'module_item_dim' => array ( 
          'workflow_state' => array ( 
              'enum', 
              'active', 
              'unpublished', 
              'deleted' 
          ) 
      ), 
      'module_progression_dim' => array ( 
          'collapsed' => array ( 
              'enum', 
              'collapsed', 
              'not_collapsed', 
              'unspecified' 
          ), 
          'is_current' => array ( 
              'enum', 
              'current', 
              'not_current', 
              'unspecified' 
          ), 
          'workflow_state' => array ( 
              'enum', 
              'locked', 
              'completed', 
              'unlocked', 
              'started' 
          ) 
      ), 
      'module_completion_requirement_dim' => array ( 
          'requirement_type' => array ( 
              'enum', 
              'must_view', 
              'must_mark_done', 
              'min_score', 
              'must_submit' 
          ) 
      ), 
      'module_progression_completion_requirement_dim' => array ( 
          'requirement_type' => array ( 
              'enum', 
              'must_view', 
              'must_mark_done', 
              'min_score', 
              'must_submit' 
          ) 
      ) 
  );
  if (isset( $overrides[$table_name] )) {
    $ov = $overrides[$table_name];
    foreach ( $T['columns'] as $key => $data ) {
      $name = $data['name'];
      if (! isset( $ov[$name] )) {
        continue;
      }
      $parms = $ov[$name];
      $action = array_shift( $parms );
      switch ($action) {
        case 'rename' :
          $T['columns'][$key]['name'] = $parms[0];
          break;
        case 'enum' :
          $t = '';
          for($i = 0; $i < count( $parms ); $i ++) {
            if ($i > 0) {
              if ($i < count( $parms ) - 1) {
                $t .= ', ';
              } else {
                $t .= ' and ';
              }
            }
            $t .= sprintf( "'%s'", $parms[$i] );
          }
          $T['columns'][$key]['description'] .= ' Possible values are ' . $t;
      }
    }
    foreach ( $ov as $action => $info ) {
      switch ($action) {
        case 'NEW' :
          foreach ( $info as $newfield ) {
            $T['columns'][] = $newfield;
          }
          break;
        case 'KEYS' :
          $T['KEYS'] = $info;
          break;
        default :
          break;
      }
    }
  }
  if (! isset( $T['KEYS'] ) && preg_match( '/_dim$/', $table_name ) && $T['columns'][0]['name'] == 'id') {
    $T['KEYS'] = array ( 
        'unique' => array ( 
            'id' => 'id' 
        ) 
    );
  }
  return $T;
}
