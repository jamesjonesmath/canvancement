# Access Report Data
This program adds a button to the Roster page that will gather the Access Report data for all students in the course and export it as a .CSV file. You may then create a Pivot Table in a spreadsheet to analyze the data.

This script has been tested in Firefox, Chrome, and Safari.
Mac users may need to save the download (Cmd-S) and then open it.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [access-report.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/roster/access-report/access-report.user.js) file

## About
An Access Report is what you get when you click on the People Navigation link in Canvas, followed by a student's name, and finally click on Access Report. It shows the number of times the student has viewed content or participated in the course. You can only return the access report for one student at a time.

This enhancement allows you to obtain the raw data for all students in the course. You will need to manipulate the data to obtain anything useful from it.

Note that the report may take a while to run, depending on the size of your class. The _Access Report Data_ button is disabled while it is running.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

There are two configuration variables in the file
* **headingNoSpaces** will remove spaces from the headings when set to true. This will turn headings like "User ID" into "UserID". Some users reported problems working with the data in R when there were spaces in the headings. The default is to leave spaces in the headings.
* **showViewStudent** will show when students view the profile pages for students in the course when set to true. This is disabled by default and views of student profiles will not be included in the data. This was confusing to faculty who wondered why there were a bunch of items titled with the student names. When disabled or false, the script removes any item with an asset_category of 'roster' and an asset_class_name of 'student_enrollment' before downloading the data.

## Anonymized Data
There is also a version of this script that will [anonymize the user data](https://github.com/jamesjonesmath/canvancement/raw/master/roster/access-report/access-report-anonymous.user.js). This is useful if you want to make demonstration videos and not worry about FERPA violations. Note that the anonymizer routine will fail if you have more students than anonymous names provided (currently 123). Teachers who wish to analyze their classes will want to use the non-anonymized version.

When anonymization is used, the Canvas ID, login, Name, SIS ID, and SIS Login are anonymized. Views to student profiles, if enabled, have the name of the student who was viewed replaced by the anonymized name. Values in the asset_group_code field are not anonymized.
