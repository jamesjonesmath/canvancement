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
 * $schema_overrides_file is a JSON file that contains overrides to the schema
 */
$schema_overrides_file = 'overrides.json';

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
 * enumerated_boolean: simulated boolean types with ENUM('false','true')
 * import_table: create _import table to hold information about schema
 */
$options = array (
  'drop_schema' => TRUE,
  'comments' => TRUE,
  'enumerated_boolean' => TRUE,
  'add_indices' => TRUE,
  'import_table' => FALSE
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

if (isset( $config_file ) && file_exists( $config_file )) {}

$schema = NULL;
$overrides = NULL;
$json_schema = NULL;
if (file_exists( $schema_file )) {
  $contents = file_get_contents( $schema_file );
  if ($contents !== FALSE) {
    $schema = json_decode( $contents, TRUE );
  }
}
if (!isset( $schema )) {
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

if (!isset( $schema ) || !is_array( $schema )) {
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

if (isset( $schema_overrides_file ) && file_exists( $schema_overrides_file )) {
  $contents = file_get_contents( $schema_overrides_file );
  if ($contents !== FALSE) {
    $overrides = json_decode( $contents, TRUE );
  }
}

$sql = create_mysql_schema( $schema, $schema_name, $options );

if (!empty( $output_filename )) {
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
  $add_comments = !isset( $opts['comments'] ) || $opts['comments'] ? TRUE : FALSE;
  $enumerated_boolean = !isset( $opts['enumerated_boolean'] ) || $opts['enumerated_boolean'] ? TRUE : FALSE;
  $mysql_engine = isset( $opts['engine'] ) ? $opts['engine'] : 'InnoDB';
  $import_table = isset( $opts['import_table'] ) ? $opts['import_table'] : TRUE;
  if ($enumerated_boolean) {
    $type_overrides['boolean'] = 'enumbool';
  }
  
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
  $table_info = array ();
  foreach ( $cdschema['schema'] as $key => $table ) {
    $table_name = isset( $table['tableName'] ) ? $table['tableName'] : $key;
    $table = table_overrides( $table, $table_name );
    if (empty( $table )) {
      continue;
    }
    $incremental = isset( $table['incremental'] ) ? $table['incremental'] : FALSE;
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
        if (preg_match( '/Possible values(.*?)(\.|$)/', $comment, $commatch )) {
          $comment = preg_replace( '/, i\.e\. /', '', $comment );
          $comment = preg_replace( '/unpublished, published and deleted/', "'unpublished', 'published' and 'deleted'", $comment );
          $coltype = 'enum';
        } else {
          $coltype .= sprintf( '(%d)', $column['length'] );
        }
      }
      if ($coltype == 'enum') {
        preg_match_all( '/\'(.*?)\'/', $comment, $matches );
        if (empty( $matches[0] )) {
          print ("$comment\n") ;
          print_r( $column );
          die( "Invalid match in enumerated field for $key.$colname" );
        }
        $enumitems = array ();
        foreach ( $matches[0] as $enumitem ) {
          if (!in_array( $enumitem, $enumitems )) {
            $enumitems[] = $enumitem;
          }
        }
        $comment = preg_replace( '/\s*Possible values.*?(\.|$)/', '', $comment );
        $comment = trim( $comment );
        $enumvalues = join( ', ', $enumitems );
        $colextra .= sprintf( '(%s)', $enumvalues );
      }
      if ($coltype == 'enumbool') {
        $coltype = 'ENUM';
        $colextra = "('false','true')";
      }
      if (isset( $column['extra'] )) {
        $colextra .= $column['extra'];
      }
      $columndef = sprintf( '  `%s` %s', $colname, strtoupper( $coltype ) );
      if (!empty( $colextra )) {
        $colextra = trim( $colextra );
        if (!preg_match( '/^\(/', $colextra )) {
          $columndef .= ' ';
        }
        $columndef .= $colextra;
      }
      if ($add_comments && !empty( $comment )) {
        $comment = preg_replace( '/\n/', ' ', $comment );
        $comment = preg_replace( '/\s+/', ' ', $comment );
        $columndef .= sprintf( " COMMENT '%s'", addslashes( trim( $comment ) ) );
      }
      $columns[] = $columndef;
    }
    $sort_order = '';
    if (count( $columns ) > 0) {
      if (!isset( $table['KEYS'] ) || !isset( $table['KEYS']['primary'] )) {
        printf( "## NO PRIMARY KEY for %s\n", $table_name );
      }
      if (isset( $table['KEYS'] )) {
        foreach ( $table['KEYS'] as $keytype => $keyinfo ) {
          switch ($keytype) {
            case 'primary' :
              $columns[] = sprintf( 'PRIMARY KEY (%s)', $keyinfo );
              $pkeys = explode( ',', $keyinfo );
              foreach ( $pkeys as $pkey ) {
                $colno = 0;
                foreach ( $table['columns'] as $colkey => $column ) {
                  $colno++;
                  if (strtolower( $column['name'] ) == $pkey) {
                    $sort_order .= sprintf( '-k %d,%d ', $colno, $colno );
                    break;
                  }
                }
              }
              $sort_order = trim( $sort_order );
              break;
            case 'unique' :
              foreach ( $keyinfo as $keyname => $keyfields ) {
                $columns[] = sprintf( 'UNIQUE KEY %s (%s)', $keyname, $keyfields );
              }
              break;
            case 'index' :
              foreach ( $keyinfo as $keyname => $keyfields ) {
                if (!isset( $table['KEYS']['primary'] ) || $keyfields != $table['KEYS']['primary']) {
                  // Make sure this is not already a primary key;
                  $columns[] = sprintf( 'INDEX %s (%s)', $keyname, $keyfields );
                }
              }
              break;
            default :
              break;
          }
        }
      }
      $table_info[] = array (
        'table_name' => $table_name,
        'enabled' => 1,
        'sort_keys' => $sort_order,
        'incremental' => $incremental
      );
      if ($incremental) {
        $t .= c( 'DROP TABLE IF EXISTS %s', $table_name );
      }
      $create = l( 'CREATE TABLE IF NOT EXISTS %s (', $table_name );
      $create .= join( ",\n", $columns ) . "\n";
      $create .= ')';
      if ($add_comments && !empty( $table['description'] )) {
        $comment = preg_replace( '/\n/', ' ', $table['description'] );
        $comment = preg_replace( '/\s+/', ' ', $comment );
        $create .= sprintf( " COMMENT = '%s'", addslashes( trim( $comment ) ) );
      }
      $t .= c( $create );
    }
  }
  if ($import_table) {
    $import = c( 'DROP TABLE IF EXISTS _import' );
    $import .= l( 'CREATE TABLE IF NOT EXISTS _import (' );
    $import .= l( '  `table_name` VARCHAR(127) PRIMARY KEY NOT NULL%s,', $add_comments ? " COMMENT 'Name of Canvas Data table'" : '' );
    $import .= l( '  `enabled` TINYINT DEFAULT 1%s,', $add_comments ? " COMMENT 'Should this table be loaded?'" : '' );
    $import .= l( '  `sort_keys` VARCHAR(21) NOT NULL DEFAULT ""%s,', $add_comments ? " COMMENT 'Key specification for sort command'" : '' );
    $import .= l( '  `incremental` TINYINT DEFAULT NULL%s,', $add_comments ? " COMMENT 'Incremental (1) or complete (0)?'" : '' );
    $import .= l( '  `last_import` DATETIME%s', $add_comments ? " COMMENT 'Timestamp of last load'" : '' );
    $import .= ')' . ($add_comments ? " COMMENT 'Used by import script'" : '');
    $t .= c( $import );
    $impdata = "INSERT INTO _import (table_name, enabled, sort_keys, incremental) VALUES";
    $add_comma = FALSE;
    foreach ( $table_info as $tinfo ) {
      if ($add_comma) {
        $impdata .= ',';
      } else {
        $add_comma = TRUE;
      }
      $impdata .= "\n";
      $impdata .= sprintf( "('%s',%d,'%s',%d)", $tinfo['table_name'], $tinfo['enabled'], $tinfo['sort_keys'], $tinfo['incremental'] );
    }
    $t .= c( $impdata );
  }
  return $t;
}

function table_overrides($T = NULL, $table_name = NULL) {
  if (empty( $T )) {
    return;
  }
  if (!isset( $table_name )) {
    $table_name = $T['tableName'] || '';
  }
  global $overrides;
  if (isset( $overrides[$table_name] )) {
    $ov = $overrides[$table_name];
    if (is_string( $ov ) && $ov == 'DEPRECATED') {
      return;
    }
    foreach ( $T['columns'] as $key => $data ) {
      $name = $data['name'];
      if (!isset( $ov[$name] )) {
        continue;
      }
      $parms = $ov[$name];
      $action = array_shift( $parms );
      switch ($action) {
        case 'type' :
          $T['columns'][$key]['type'] = $parms[0];
          break;
        case 'rename' :
          $T['columns'][$key]['name'] = $parms[0];
          break;
        case 'enum' :
          $t = '';
          for($i = 0; $i < count( $parms ); $i++) {
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
  if (preg_match( '/^(.*)_(dim|fact)$/', $table_name, $matches )) {
    $keys = isset( $T['KEYS'] ) ? $T['KEYS'] : array ();
    $basetable = $matches[1];
    $colno = 0;
    foreach ( $T['columns'] as $colkey => $col ) {
      $colname = $col['name'];
      $is_id = preg_match( '/^(.*)_id$/', $colname, $colmatch );
      $type = NULL;
      switch ($T['dw_type']) {
        case 'fact' :
          if ($colname == $basetable . '_id') {
            $keys['primary'] = $basetable . '_id';
          } else {
            if ($is_id) {
              $type = 'index';
            }
          }
          break;
        case 'dimension' :
          if ($colno == 0) {
            if ($colname == 'id') {
              $keys['primary'] = 'id';
            }
          } elseif ($is_id) {
            if ($colname == 'canvas_id') {
              $type = 'unique';
            } else {
              $type = 'index';
            }
          } else {
            if ($colname == 'workflow_state') {
              $type = 'index';
            }
          }
          break;
      }
      if (isset( $type )) {
        if (!isset( $keys[$type] )) {
          $keys[$type] = array ();
        }
        $keys[$type][$colname] = $colname;
      }
      $colno++;
    }
    if (!empty( $keys )) {
      $T['KEYS'] = $keys;
    }
  }
  return $T;
}
