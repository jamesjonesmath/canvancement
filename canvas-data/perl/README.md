# Canvas Data PERL Code
## HMAC Signature
The [hmac_signature.pl](hmac_signature.pl) file is a code snippet that will compute the signature needed for the Canvas Data API calls. 

This code is meant for demonstration purposes and you would want to take and incorporate it into your code rather than use it as a standalone package.

It is a slimmed down version of the example shown by Canvas as all of the requests (so far) are GET and ContentType and ContentMD5 are not used.

## CanvasData Module
[CanvasDataAPI.pm](CanvasDataAPI.pm) is a PERL module that adds object oriented access to the Canvas API. 

There are methods for each of the API endpoints. The JSON object returned from the API is converted to a PERL data structure and returned to user as a reference

To use it, invoke code like this.
```perl
# Use the module
use CanvasDataAPI;
# Replace API_KEY and API_SECRET by their values
my $CD = CanvasDataAPI->new(API_KEY, API_SECRET);
# To make a call, invoke the method. Optional parameters are included as a hash.
my $dumps = $CD->get_dump({'limit' => 100});
my $latest = $CD->get_file_latest();
my $schema = $CD->get_schema_latest();
```
