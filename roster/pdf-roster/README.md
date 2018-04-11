# Print a PDF Roster
This is a user script that adds a **Download Roster as PDF** button to the Course Roster Page. In addition, it adds the sorting functionality of the [Sort a Roster](../sort-roster/) script to the Roster Page.

** DEPRECATED ** This script does not currently work. Do not install it.

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [pdf-roster.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/roster/pdf-roster/pdf-roster.user.js) file

## About
A course Roster is what you get when you click on the People Navigation link in Canvas. 
### PDF Roster
This script adds a button to the right-side navigation menu to download the roster in PDF form.

The PDF is rudimentary, but it strips out all of the links in the printout, so it looks nicer.

The PDF generates a list of what is displayed on the screen, so you can use the filtering capability built-into Canvas and the sorting capability included with this script to improve the Roster.
### Roster Sorting
By default, the roster is sorted alphabetically by the student's last name.

This enhancement allows you to click on any of the headings to do a sort. Clicking a second time will reverse the sort. Clicking a third time will return that column to its original order.

This script was complicated by dynamic content loading and pagination. Canvas only loads the first 50 users users in a course. If you scroll down, it will load an additional 50, until the full list is finally loaded. There is no warning given if you haven't loaded all names in the roster, but if you scroll down, those new names will be added to the sort.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

There is a lot of additional configuration that can be done. The script determines the content of a column by looking at its heading. This is because different columns appear depending on your permissions and roles. If you are not using English, those words change. Rather than hard-coding the names, there is a variable at the top of the file called ``rosterColumns`` that contains the ``text`` to look for when identifying the column. The ``heading`` attribute specifies the name used in the PDF roster. There is extra information available because I used the same configuration for two other scripts [Sort a Roster](../sort-roster/) and [Photo Roster](../photo-roster/).

## References
* [Course Roster Enhancements](https://community.canvaslms.com/groups/higher-ed/blog/2015/09/03/roster-enhancements) was my first user script after figuring out that you could give them the extension .user.js. It was also the first one to handle pagination of data using MutationObservers. Unfortunately the script I chose to wait for the table to appear turned out to be incompatible with Chrome.
