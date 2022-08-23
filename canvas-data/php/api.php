<?php
class CanvasDataAPI {
  private $_api_key = NULL;
  private $_api_secret = NULL;
  private $_api_host = 'portal.inshosteddata.com';
  private $_account_id = 'self';
  private $_return_json = false;

  public function __construct($apikey = NULL, $apisecret = NULL, $accountid = NULL, $apihost = NULL) {
    $opt_list = array ( 
        'key' => '_api_key', 
        'secret' => '_api_secret', 
        'account' => '_account_id', 
        'host' => '_api_host' 
    );
    if (empty( $apikey )) {
      return;
    }
    if (is_array( $apikey )) {
      $opts = $apikey;
      $i = 0;
      foreach ( $opt_list as $key => $field ) {
        if (isset( $opts[$key] )) {
          $this->{$field} = $opts[$key];
        } elseif (isset( $opts[$i] )) {
          $this->{$field} = $opts[$i];
        }
        $i ++;
      }
    } else {
      $this->_api_key = $apikey;
      $this->_api_secret = $apisecret;
      $this->_account_id = empty( $accountid ) ? 'self' : $accountid;
      $this->_api_host = empty( $apihost ) ? 'portal.inshosteddata.com' : $apihost;
    }
  }

  protected function _getset($key = NULL, $opt = NULL) {
    $value = NULL;
    if (isset( $this->{$key} )) {
      if (isset( $opt )) {
        $this->{$key} = $opt;
      } else {
        $value = $this->{$key};
      }
    }
    return $value;
  }

  protected function _check_init() {
    $opt_list = array ( 
        'key' => '_api_key', 
        'secret' => '_api_secret', 
        'account' => '_account_id', 
        'host' => '_api_host' 
    );
    $valid = TRUE;
    foreach ( $opt_list as $key => $field ) {
      if (empty( $this->{$field} )) {
        printf( "API not initialized. Missing %s\n", $key );
        $valid = FALSE;
      }
    }
    if (! $valid) {
      throw new Exception( 'Must initialize settings before attempting to use them' );
    }
    return $valid;
  }

  protected function substitute($route = NULL, $vars = NULL) {
    if (empty( $route )) {
      return $route;
    }
    if (preg_match( '/^(GET|PUT|DELETE|POST|HEAD)\s+(.*)$/xms', $route, $route_matches )) {
      $method = strtoupper( $route_matches[1] );
      $path = $route_matches[2];
    } else {
      throw new Exception( 'Invalid route specified: ' . $route );
    }
    $src = explode( '/', $path );
    $dst = array ();
    foreach ( $src as $token ) {
      if ($token == '(:accountId|self)') {
        if (isset( $vars['accountId'] )) {
          $token = $vars['accountId'];
        } elseif (isset( $this->_account_id )) {
          $token = $this->_account_id;
        } else {
          $token = 'self';
        }
      } elseif (preg_match( '/^[:](.*)$/xms', $token, $token_matches )) {
        $varname = $token_matches[1];
        if (isset( $vars[$varname] )) {
          $token = $vars[$varname];
        } else {
          throw new Exception( 'Missing token: ' . $token );
        }
      }
      $dst[] = $token;
    }
    $route = sprintf( '%s %s', $method, implode( '/', $dst ) );
    return $route;
  }

  protected function hmac_signature($timestamp = NULL, $url = NULL, $opts = array()) {
    if (empty( $timestamp ) || empty( $url )) {
      throw new Exception( 'Cannot compute signature with an empty message.' );
    }
    $u = parse_url( $url );
    if ($u === FALSE) {
      throw new Exception( 'Cannot parse URL: ' . $url );
    }
    $host = ! empty( $opts['host'] ) ? $opts['host'] : (! empty( $u['host'] ) ? $u['host'] : $this->_api_host);
    $path = $u['path'];
    $query = '';
    if (! empty( $u['query'] )) {
      $parms = explode( '&', $u['query'] );
      sort( $parms );
      $query = implode( '&', $parms );
    }
    $parts = array ( 
        isset( $opts['method'] ) ? $opts['method'] : 'GET', 
        $host, 
        isset( $opts['contentType'] ) ? $opts['contentType'] : '', 
        isset( $opts['contentMD5'] ) ? $opts['contentMD5'] : '', 
        $path, 
        $query, 
        $timestamp, 
        $this->_api_secret 
    );
    $message = implode( "\n", $parts );
    return base64_encode( hash_hmac( 'sha256', $message, $this->_api_secret, TRUE ) );
  }

  public function api_key($opt = NULL) {
    return $this->_getset( '_api_key', $opt );
  }

  public function api_secret($opt = NULL) {
    return $this->_getset( '_api_secret', $opt );
  }

  public function api_host($opt = NULL) {
    return $this->_getset( '_api_host', $opt );
  }

  public function account($opt = NULL) {
    return $this->_getset( '_account_id', $opt );
  }

  public function return_json($opt = NULL) {
    return $this->_getset( '_return_json', $opt );
  }

  public function execute($config = array(), $opts = array()) {
    $json = NULL;
    try {
      $this->_check_init();
      if (! is_array( $config )) {
        $config = array ( 
            'route' => $config 
        );
      }
      $route = $this->substitute( $config['route'], $opts );
      if (empty( $route )) {
        throw new Exception( 'Malformed command, no route specified' );
      }
      $method = NULL;
      $path = NULL;
      if (preg_match( '/^(GET|PUT|DELETE|POST|HEAD)\s+(.*)$/xms', $route, $route_matches )) {
        $method = strtoupper( $route_matches[1] );
        $path = $route_matches[2];
      } else {
        throw new Exception( 'Invalid route' );
      }
      $url = 'https://' . $this->_api_host . $path;
      $parms = array ();
      $query = '';
      if (isset( $config['allow'] )) {
        foreach ( $config['allow'] as $key ) {
          if (isset( $opts[$key] )) {
            $parms[$key] = $opts[$key];
          }
        }
        if (isset( $parms )) {
          ksort( $parms, SORT_LOCALE_STRING );
          if ($method == 'GET') {
            $query = http_build_query( $parms );
            if (! empty( $query )) {
              $url .= '?' . $query;
            }
          }
        }
      }
      $timestamp = gmdate( 'D, d M Y H:i:s T' );
      $opts['method'] = $method;
      $hmac = $this->hmac_signature( $timestamp, $url, $opts );
      $http_headers = array ( 
          'Authorization: HMACAuth ' . $this->_api_key . ':' . $hmac, 
          'Date: ' . $timestamp 
      );
      $ch = curl_init( $url );
      curl_setopt_array( $ch, array ( 
          CURLOPT_HTTPHEADER => $http_headers, 
          CURLOPT_RETURNTRANSFER => TRUE, 
          CURLOPT_VERBOSE => FALSE, 
          CURLOPT_HEADER => TRUE 
      ) );
      $response = curl_exec( $ch );
      if ($response !== FALSE) {
        $header_size = curl_getinfo( $ch, CURLINFO_HEADER_SIZE );
        $header = substr( $response, 0, $header_size );
        $body = substr( $response, $header_size );
        $json = $this->_return_json ? $body : json_decode( $body, TRUE );
      }
      curl_close( $ch );
    } catch ( Exception $e ) {
      printf( "%s\n", $e->getMessage() );
    }
    return $json;
  }

  public function get_dump($opts = array()) {
    $config = array ( 
        'route' => 'GET /api/account/(:accountId|self)/dump', 
        'allow' => array ( 
            'after', 
            'limit' 
        ) 
    );
    return $this->execute( $config, $opts );
  }

  public function get_file_latest($opts = array()) {
    return $this->execute( 'GET /api/account/(:accountId|self)/file/latest', $opts );
  }

  public function get_file_by_dump($opts = array()) {
    return $this->execute( 'GET /api/account/(:accountId|self)/file/byDump/:dumpId', $opts );
  }

  public function get_file_by_table($opts = array()) {
    $config = array ( 
        'route' => 'GET /api/account/(:accountId|self)/file/byTable/:tableName', 
        'allow' => array ( 
            'after', 
            'limit' 
        ) 
    );
    return $this->execute( $config, $opts );
  }

  public function get_file_sync($opts = array()) {
    $config = array ( 
        'route' => 'GET /api/account/(:accountId|self)/file/sync' 
    );
    return $this->execute( $config, $opts );
  }

  public function get_schema($opts = array()) {
    return $this->execute( 'GET /api/schema', $opts );
  }

  public function get_schema_latest($opts = array()) {
    return $this->execute( 'GET /api/schema/latest', $opts );
  }

  public function get_schema_version($opts = array()) {
    return $this->execute( 'GET /api/schema/:version', $opts );
  }
}
