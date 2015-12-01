#!/usr/bin/perl

# This is a code snippet

# Standard modules

use strict;
use warnings;
use diagnostics;
use Carp;

# Specific modules required for signature

use URI;
use HTTP::Date;
use Digest::SHA qw{hmac_sha256_base64};

# Minimal information needed to generate signature

my $timestamp = time2str();
my $url    = 'https://portal.inshosteddata.com/api/account/self/dump?limit=100';
my $api_secret = 'YOUR SUPER SECRET API SECRET GOES HERE';

# Generate signature

my $hmac = hmac_signature( $timestamp, $url, $api_secret );
printf("HMAC signature: %s\n", $hmac);

# Headers to add to request

my $api_key = 'YOUR API KEY GOES HERE';
my $headers = {
  'Authorization' => 'HMACAuth ' . $api_key . ':' . $hmac,
  'Date'          => $timestamp,
};

1;

# Subroutine to generate the proper signature
# This is a whittled down version from what Canvas suggested. 
# Currently, the Content-type and Content-MD5 are not used

sub hmac_signature {
  my $timestamp = shift || return;
  my $url       = shift || return;
  my $secret    = shift || return;
  my $uri       = URI->new($url);
  my $host = defined( $uri->host ) ? $uri->host : 'portal.inshosteddata.com';
  my $query = $uri->query || '';
  if ( $query ne '' ) {
    $query = join( '&', sort( split( '&', $query ) ) );
  }
  my $parts =
    [ 'GET', $host, '', '', $uri->path, $query, $timestamp, $secret, ];
  my $message = join( "\n", @{$parts} );
  my $hmac = hmac_sha256_base64( $message, $secret );

  # The HMAC implementation doesn't enforce the proper length.
  # Pad the end with = signs until the length is a multiple of 4
  while ( length($hmac) % 4 ) {
    $hmac .= '=';
  }
  return $hmac;
}
