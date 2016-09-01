# Admin User Search Details
This is a user script that add a user's Login ID and SIS User ID to the Account > Users search page in Canvas.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [user-search-details.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/users/admin-search/user-search-details.user.js) file
 
This script has been tested with Firefox and Chrome on Windows and Safari on a Mac.

## About
The User search feature in Canvas doesn't provide an easy way to distinguish between users with the same name. 

This is a script that I hope quickly becomes obsolete. As of March 7, 2016, Canvas is in the Code Review phase of the process and hopes that they will have something within a few release cycles for us. At that point, you should be able to disable this script.

This script runs on the Account > Users search results page.

It works with Firefox, Chrome, and Safari.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

You can also specify which columns are added to the search.

## References
* [Advanced Admin Search & Sort](https://community.canvaslms.com/ideas/1126) is a feature request originally made on April 14, 2015.
* [Adding Login and SIS IDs to Admin User Search](https://community.canvaslms.com/groups/admins/blog/2016/03/14/adding-login-and-sis-ids-to-admin-user-search) is the blog post announcing this in the Canvas Community.

## Updates
### Version 4 - September 1, 2016
* Added a Grades link to show all grades for the user
* The order of the links is configured in the config.features array. Change the order or remove features you don't want

### Version 3 - September 1, 2016
* Canvas reworked their layout to be two rows instead of 1, so I dropped the column approach and went with the name on one row and the login and SIS ID on the second.
* There are now labels on the Login and SIS IDs. These are configurable through the config variable
* There is now a Become button that will allow you to masquerade from the user search. This is configurable.
* Added a config.features array to the configuration. Right now, it only supports 'masquerade', but it opens it up for other quick user links in the future.
