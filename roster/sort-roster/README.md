# Sort a Roster
This is a user script that will allow users to sort a Course Roster from the People page by clicking on the heading at the top of any column.

This script has been tested in Firefox and Chrome.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [sort-roster.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/roster/sort-roster/sort-roster.user.js) file

## About
A course Roster is what you get when you click on the People Navigation link in Canvas. By default, it is sorted alphabetically by the student's last name.

This enhancement allows you to click on any of the headings to do a sort. Clicking a second time will reverse the sort. Clicking a third time will return that column to its original order.

This script was complicated by dynamic content loading and pagination. Canvas only loads the first 50 users users in a course. If you scroll down, it will load an additional 50, until the full list is finally loaded. There is no warning given if you haven't loaded all names in the roster, but if you scroll down, those new names will be added to the sort.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

There is a lot of additional configuration that can be done. The script determines the content of a column by looking at its heading. This is because different columns appear depending on your permissions and roles. If you are not using English, those words change. Rather than hard-coding the names, there is a variable at the top of the file called ``rosterColumns`` that contains the ``text`` to look for when identifying the column. There is extra information available because I used the same configuration for two other scripts [Roster PDF download](../pdf-roster/) and [Photo Roster](../photo-roster/).

## References
* [Course Roster Enhancements](https://community.canvaslms.com/groups/higher-ed/blog/2015/09/03/roster-enhancements) was my first user script after figuring out that you could give them the extension .user.js. It was also the first one to handle pagination of data using MutationObservers. Unfortunately the script I chose to wait for the table to appear turned out to be incompatible with Chrome.

## Major Updates
* **2015-09-27**: I changed the library used to detect when the roster table was available so this script now works with Chrome. 
