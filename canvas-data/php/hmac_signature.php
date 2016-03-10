<?php
// This is a code snippet

// Minimal information needed to generate signature
$timestamp = gmdate( 'D, d M Y H:i:s T' );
$url = 'https://portal.inshosteddata.com/api/account/self/dump?limit=3';
$api_secret = 'YOUR SUPER SECRET API SECRET GOES HERE';

// Generate signature
$hmac = hmac_signature( $timestamp, $url, $api_secret );
printf( "HMAC signature: %s\n", $hmac );

// Headers to add to request
$api_key = 'YOUR API KEY GOES HERE';
$http_headers = array ( 'Authorization: HMACAuth ' . $api_key . ':' . $hmac, 
    'Date: ' . $timestamp );

// This version is slimmed down to only include what is needed for the current API
function hmac_signature($timestamp = NULL, $url = NULL, $secret = NULL) {
  if (empty( $timestamp ) || empty( $url ) || empty( $secret )) {
    return;
  }
  $u = parse_url( $url );
  if ($u === FALSE) {
    return;
  }
  $host = ! empty( $u['host'] ) ? $u['host'] : 'portal.inshosteddata.com';
  $path = $u['path'];
  $query = '';
  if (! empty( $u['query'] )) {
    $parms = explode( '&', $u['query'] );
    sort( $parms );
    $query = join( '&', $parms );
  }
  $parts = array ( 'GET', $host, '', '', $path, $query, $timestamp, $secret );
  $message = join( "\n", $parts );
  return base64_encode( hash_hmac( 'sha256', $message, $secret, TRUE ) );
}
