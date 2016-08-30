# Admin People Link
This is a user script that adds a link to the course People page from the Admin course listings.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [people_link.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/users/admin-people-link/people_link.user.js) file
 
## About
When searching for courses from the Canvas admin pages, quick links to the Settings, Statistics, and Homepage are returned.

Some institutionts add people through the web interface rather than using SIS imports and thought it would be nice to have a link to the People page there as well. This script adds that link for them.

This script runs on the main Account page as well as course search pages.
That is, administrative pages who path looks like /account/1234 or /account/1234/courses

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [Add "People" at the Courses page under Admin level](https://community.canvaslms.com/ideas/6480) is a feature request made on August 28, 2016.
