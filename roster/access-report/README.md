# Access Report Data
This program adds a button to the Roster page that will gather the Access Report data for all students in the course and export it as a .CSV file. You may then create a Pivot Table in a spreadsheet to analyze the data.

This script has been tested in Firefox and Chrome.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [sort-roster.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/roster/access-report/access-report.user.js) file

## About
An Access Report is what you get when you click on the People Navigation link in Canvas, followed by a student's name, and finally click on Access Report. It shows the number of times the student has viewed content or participated in the course. You can only return the access report for one student at a time.

This enhancement allows you to obtain the raw data for all students in the course. You will need to manipulate the data to obtain anything useful from it.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.
