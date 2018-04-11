# Needs Grading Count
This is a user script that will replace the 9+ in the To-Do list with the actual number of assignments needed grading.

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [needs-grading.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/needs-grading/needs-grading.user.js) file
 
This script has been tested with Firefox and Chrome on Windows and Safari on a Mac.

## About
On February 20, 2016, Canvas replaced the number of assignments needing graded with a 9+ indicator. When masses of people complained in the community, they indicated we should file a help ticket.

This is a quick script that I hope quickly becomes obsolete. It will replace the 9+ with the actual number of assignments needing graded.

This script runs on the Course homepage (course activity stream, pages front page, course modules, and assignments list) and on the Activity Stream (the page you get when you first log into Canvas). It works with Firefox, Chrome, and Safari.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [Canvas Production Release Notes (2016-02-20)](https://community.canvaslms.com/docs/DOC-6092)
* [Request to submit a support ticket](https://community.canvaslms.com/docs/DOC-6092#comment-39747)
