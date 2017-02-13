# Import a Rubric
This is a user script that will allow users to copy/paste a rubric from a spreadsheet into Canvas.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [import-rubric.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/rubrics/import-rubric/import-rubric.user.js) file

## About
Rubrics are one area of Canvas that is not as refined as most. Creating an assignment rubric needs to be done through the web interface as their is no API support.

This script will add the ability to create a rubric inside a spreadsheet and then copy/paste a tab-delimited rubric into a form inside Canvas. The information is then sent off to the Canvas server where the rubric is created.

You may want to use this script in combination with the [Rubric Sorter](../sort-rubric) script so that you can move rows around in an already-created rubric.

It runs on pages matching ``/courses/*/rubrics`` or ``/accounts/*/rubrics``

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [Importing Rubrics from a Spreadsheet](https://community.canvaslms.com/docs/DOC-8844) contains the documentation for this script as well as videos showing how it works.
* [Sorting Rubrics Made Easy](https://community.canvaslms.com/groups/designers/blog/2015/08/25/sorting-rubrics-made-easy) was my second attempt 8 days after the first. I had learned about user scripts, but I hadn't learned how to have them automatically install and I was still hard-coding my Canvas instance into it. It required copy/paste and edit before you could run it. So *easy* was really *easier* but not *easiest*.
