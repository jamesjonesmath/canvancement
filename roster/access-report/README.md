# Access Report Data

This program adds a button to the Roster page that will gather the Access Report data for all students in the course and export it as a .CSV file. You may then create a Pivot Table in a spreadsheet to analyze the data.

This script has been tested in Firefox, Chrome, and Safari.
Mac users may need to save the download (Cmd-S) and then open it.

## Quick Install

1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [access-report.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/roster/access-report/access-report.user.js) file

## About

An Access Report is what you get when you (1) click on the People navigation link in Canvas, (2) click on the student's avatar, and (3) click on Access Report. For step (2), if you click on the student's name in the roster, then you need to click on their name again in the flyout. The access report shows the number of times the student has viewed content or participated in the course.

The native interface allows you to return the access report for only one student at a time. Three (or four) clicks for each student. This gives you a paginated report with no way to export the data.

This enhancement allows you to obtain the access report data for all students in the course and export as a .CSV file. You will need to manipulate the data to obtain anything useful from it.

Note that the report may take a while to run, depending on the size of your class. A dialog shows the progress while it runs, first while it fetches the enrollments and then while it fetches each student's access report. Click _Cancel_ or press Esc to stop it.

Text that begins with `=`, `+`, `-`, or `@`, such as a page title, has an apostrophe added in front of it so that a spreadsheet will not treat it as a formula. When the data has characters outside plain ASCII, such as an accented name, the file starts with a byte order mark so that Excel reads it as UTF-8.

## Customization

This script will automatically run on any Canvas instance hosted at `*.instructure.com`. If you have a custom domain, then you will need to modify the `// @match` line to refer to your site.

The configuration variables are at the top of the file.

- **showViewStudent** will show when students view the profile pages for students in the course when set to true. This is disabled by default and views of student profiles will not be included in the data. This was confusing to faculty who wondered why there were a bunch of items titled with the student names. When disabled or false, the script removes any item with an asset_category of 'roster' and an asset_class_name of 'student_enrollment' before downloading the data.
- **quizParticipation** subtracts a quiz's participations from its views, the way the Canvas access report does. The default is true.
- **enrollmentStates** lists which enrollment states to include. The default is active and completed.
- **analytics** includes the last activity and total activity time (`'activity'`) and the course score and grade (`'grades'`). The default includes both.
- **disableMissing** hides columns that have no data when set to true, which is the default.
- **headingSpaces** replaces the spaces in the headings. This will turn headings like `User ID` into `UserID` when set to `''` or `User_ID` when set to `'_'`. Some users reported problems working with the data in R when there were spaces in the headings. The default is to leave spaces in the headings.
- **multipleSections** controls students in more than one section: 1 gives a row for each section, 2 gives one row with the first section, and anything else lists the sections separated by that text. The default is `', '`.
- **csvFields** is the list of columns and their order. Set `disabled: true` on a column to omit it from the export.

The advanced settings, **minTime**, **maxConcurrent**, and **debug**, control how quickly the requests are made to Canvas.

## Anonymized Data

There is also a version of this script that will [anonymize the user data](https://github.com/jamesjonesmath/canvancement/raw/master/roster/access-report/access-report-anonymous.user.js). This is useful if you want to make demonstration videos and not worry about FERPA violations. Note that the anonymizer routine will refuse to run if you have more students than anonymous names provided (currently 123). It has the **headingSpaces** and **showViewStudent** settings at the top of that file, which work the same way as above. Teachers who wish to analyze their classes will want to use the non-anonymized version.

When anonymization is used, the Canvas ID, login, Name, SIS ID, and SIS Login are anonymized. Views to student profiles, if enabled, have the name of the student who was viewed replaced by the anonymized name. Values in the asset_group_code field are not anonymized.
