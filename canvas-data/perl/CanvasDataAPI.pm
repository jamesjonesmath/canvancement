#!/usr/bin/perl;
package CanvasDataAPI;

use strict;
use warnings;
use diagnostics;
use Carp;

use LWP::UserAgent;
use HTTP::Date;
use URI;
use Digest::SHA qw{hmac_sha256_base64};
use JSON qw{decode_json};

1;

sub new {
  my $class = shift;
  my $opts  = [@_];
  my $self  = {
    '_api_key'    => undef,
    '_api_secret' => undef,
    '_account_id' => 'self',
    '_api_host'   => 'portal.inshosteddata.com',
  };
  bless $self, $class;
  $self->_initialize($opts);
  return $self;
}

sub _initialize {
  my $self     = shift;
  my $opts     = shift || return;
  my $opt_list = {
    'key'     => '_api_key',
    'secret'  => '_api_secret',
    'account' => '_account_id',
    'host'    => '_api_host'
  };
  if ( 'ARRAY' eq ref($opts) ) {
    my $order = [qw/key secret account host/];
    foreach my $i ( 0 .. @{$opts} - 1 ) {
      my $key = $order->[$i];
      $self->{ $opt_list->{$key} } = $opts->[$i];
    }
  }
  elsif ( 'HASH' eq ref($opts) ) {
    foreach my $key ( keys( %{$opt_list} ) ) {
      if ( defined( $opts->{$key} ) ) {
        $self->{ $opt_list->{$key} } = $opts->{$key};
      }
    }
  }
  return;
}

sub _getset {
  my $self = shift;
  my $key  = shift;
  my $opt  = shift;
  my $value;
  if ( exists( $self->{$key} ) ) {
    if ( defined($opt) ) {
      $self->{$key} = $opt;
    }
    else {
      $value = $self->{$key};
    }
  }
  return $value;
}

sub api_key {
  my $self = shift;
  my $opt  = shift;
  return $self->_getset( '_api_key', $opt );
}

sub api_secret {
  my $self = shift;
  my $opt  = shift;
  return $self->_getset( '_api_secret', $opt );
}

sub api_host {
  my $self = shift;
  my $opt  = shift;
  return $self->_getset( '_api_host', $opt );
}

sub account_id {
  my $self = shift;
  my $opt  = shift;
  return $self->_getset( '_account_id', $opt );
}

sub _check_init {
  my $self     = shift;
  my $opt_list = {
    'account' => '_account_id',
    'key'     => '_api_key',
    'secret'  => '_api_secret',
    'host'    => '_api_host'
  };
  my $valid = 1;
  foreach my $key ( keys( %{$opt_list} ) ) {
    if ( !defined( $self->{ $opt_list->{$key} } ) ) {
      printf( "API not initialized. Missing %s\n", $key );
      $valid = 0;
    }
  }
  if ( !$valid ) {
    croak('Must initialize settings before attempting to use them');
  }
  return $valid;
}

sub _split_route {
  my $self = shift;
  my $route = shift || '';
  my $method;
  my $path;
  if ( $route =~ m{\A (GET|PUT|DELETE|POST|HEAD)\s+(.*) \z}xmsi ) {
    $method = uc($1);
    $path   = $2;
    $path =~ s{\s+}{}xmsg;
  }
  return ( $method, $path );
}

sub _substitute {
  my $self  = shift;
  my $route = shift;
  my $vars  = shift;
  if ( !defined($route) || $route eq '' ) {
    return $route;
  }
  my ( $method, $path ) = $self->_split_route($route);
  if ( !defined($method) || !defined($path) ) {
    return $route;
  }
  my $src = [ split( '/', $path ) ];
  my $dst = [];
  foreach my $token ( @{$src} ) {
    if ( $token eq '(:accountId|self)' ) {
      if ( defined( $vars->{'accountId'} ) ) {
        $token = $vars->{'accountId'};
      }
      elsif ( defined( $self->{'_account_id'} ) ) {
        $token = $self->{'_account_id'};
      }
      else {
        $token = 'self';
      }
    }
    elsif ( $token =~ m{\A [:](.*) \z}xms ) {
      my $tokenname = $1;
      if ( defined( $vars->{$tokenname} ) ) {
        $token = $vars->{$tokenname};
      }
      else {
        croak( 'Missing token: ' . $token );
      }
    }
    push( @{$dst}, $token );
  }
  $route = sprintf( '%s %s', $method, join( '/', @{$dst} ) );
  return $route;
}

sub hmac {
  my $self      = shift;
  my $timestamp = shift;
  my $url       = shift;
  my $opts      = shift;
  $self->_check_init();
  my $uri = URI->new($url);
  my $host = defined($uri->host) ? $uri->host : $self->{'_api_host'};
  if (defined($opts->{'host'})) {
    $host = $opts->{'host'};
  }
  my $query = $uri->query || '';
  if ( $query ne '' ) {
    $query = join( '&', sort( split( '&', $query ) ) );
  }
  my $parts = [
    defined( $opts->{'method'} )      ? $opts->{'method'}      : 'GET',
    $host,
    defined( $opts->{'contentType'} ) ? $opts->{'contentType'} : '',
    defined( $opts->{'contentMD5'} )  ? $opts->{'contentMD5'}  : '',
    $uri->path(),
    $query,
    $timestamp,
    $self->{'_api_secret'},
  ];
  my $message = join( "\n", @{$parts} );
  my $hmac = hmac_sha256_base64( $message, $self->{'_api_secret'} );
  while ( length($hmac) % 4 ) {
    $hmac .= '=';
  }
  return $hmac;
}

sub execute {
  my $self   = shift;
  my $config = shift;
  my $opts   = shift;
  my $json;
  if ( 'HASH' ne ref($config) ) {
    $config = { 'route' => $config };
  }
  my $route = $self->_substitute( $config->{'route'}, $opts );
  if ( !defined($route) || $route eq '' ) {
    croak('Malformed command, no route specified');
  }
  my ( $method, $path ) = $self->_split_route($route);
  if ( !defined($method) || !defined($path) ) {
    croak( 'Malformed command, unrecognizable route: ' . $route );
  }
  $self->_check_init();
  my $url = 'https://' . $self->{'_api_host'} . $path;
  my $uri = URI->new($url);
  my $parms;
  if ( defined( $config->{'allow'} ) && 'ARRAY' eq ref( $config->{'allow'} ) ) {
    foreach my $key ( @{ $config->{'allow'} } ) {
      if ( defined( $opts->{$key} ) ) {
        $parms->{$key} = $opts->{$key};
      }
    }
    if ( defined($parms) ) {
      $uri->query_form($parms);
    }
  }
  my $timestamp = time2str();
  $opts->{'method'} = $method;
  my $hmac = $self->hmac( $timestamp, $uri, $opts );
  my $ua;
  if ( !defined($ua) ) {
    $ua = LWP::UserAgent->new;
  }
  my $headers = HTTP::Headers->new(
    'Authorization' => 'HMACAuth ' . $self->{'_api_key'} . ':' . $hmac,
    'Date'          => $timestamp,
  );
  my $request = HTTP::Request->new( $method, $uri, $headers );
  my $response = $ua->request($request);
  if ( $response->is_success ) {
    print( $response->decoded_content . "\n" );
    $json = decode_json( $response->decoded_content );
  }
  else {
    print( STDERR $response->status_line() );
  }
  return $json;
}

sub get_dump {
  my $self = shift;
  my $opts = shift;
  return $self->execute(
    {
      'route' => 'GET /api/account/(:accountId|self)/dump',
      'allow' => [qw/after limit/]
    },
    $opts,
  );
}

sub get_file_latest {
  my $self = shift;
  return $self->execute('GET /api/account/(:accountId|self)/file/latest');
}

sub get_file_by_dump {
  my $self = shift;
  my $opts = shift;
  return $self->execute(
    'GET /api/account/(:accountId|self)/file/byDump/:dumpId', $opts, );
}

sub get_file_by_table {
  my $self = shift;
  my $opts = shift;
  return $self->execute(
    {
      'route' => 'GET /api/account/(:accountId|self)/file/byTable/:tableName',
      'allow' => [qw/after limit/],
    },
    $opts,
  );
}

sub get_schema {
  my $self = shift;
  return $self->execute('GET /api/schema');
}

sub get_schema_latest {
  my $self = shift;
  return $self->execute('GET /api/schema/latest');
}

sub get_schema_version {
  my $self = shift;
  my $opts = shift;
  return $self->execute('GET /api/schema/:version');
}
