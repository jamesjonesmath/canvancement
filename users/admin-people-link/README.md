# Admin People Link
This is a script that adds a link to the course People page from the Admin course listings.

## Installation

The script comes in two varieties.

### User Script
A user script is code that an individual user can add to their browser. This version of the script allows users that want this functionality to add it on their own without modifying the global JavaScript file for the entire institution.

1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [people_link.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/users/admin-people-link/people_link.user.js) file

This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.
 
### Global Custom JavaScript
You can also insert this code into your global custom JavaScript file. This means that it will run on every page for every user, looking for a admin course search. Also make sure that you test any code that you put into your global custom JavaScript file in your test or beta environment before installing it on the production site.

I generally recommend against putting files there as this is more of a personal preference, which is what *user* scripts are all about.

[people_link.js](people_link.js) is the code that you would install in the global custom JavaScript file for a site. Notice there is no *user* in this filename.

## About
When searching for courses from the Canvas admin pages, quick links to the Settings, Statistics, and Homepage are returned.

Some institutions add people through the web interface rather than using SIS imports and thought it would be nice to have a link to the People page there as well. This script adds that link for them.

This script runs on the main Account page as well as course search pages. Those pages look like /accounts/1234, /accounts/1234/, or /accounts/1234/courses

## References
* [Add "People" at the Courses page under Admin level](https://community.canvaslms.com/ideas/6480) is a feature request made on August 28, 2016.
