# Show all grades for a single student
This is a user script that will show all grades for a single student. It does not show all grades for all students.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [all-grades.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/grades/all-grades.user.js) file

## About
A common request in the [Canvas Community](https://community.canvaslms.com) was for the abilty to show all grades for a student. This information is available within Canvas by visiting the  `/users/*/grades`

This script will add a **View All Grades of Student** button to any page ending in `/users/[0-9]+`. The button takes the user to the corresponding `/users/*/grades` page.

Known places where this button will appear include:
* From the Course > People navigation link. Click on any student's name. The path is `/courses/*/users/*`
* From the Course > People navigation link. Click on any student's name and then click on User Account Details. The path is `/users/*`
* From the Manage Accounts > User Search. Search for a user and then select their name. The path is `/accounts/*/users/*`

The username is not displayed on the page. In higher education, this is a good thing to help avoid FERPA violations. If you would like to add the user's name to the page, then see the [Add a student's name to their Grades page][] user script.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [Accessing all student grades](https://community.canvaslms.com/message/14314) from the Canvas Community. 
  * Chris Long pointed out that you can use `/users/*/grades` to get the Grades for all students. 
  * Chris Odom wrote some Javascript to add a link to the page. 
  * James Jones took what Chris Odom had done and cleaned it up / converted it to a user script.

# Add a student's name to their Grades page
This is a user script that will add a user's name and student ID number to their grades page.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [names-grades.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/grades/name-grades.user.js) file

## About
The page that displays grades for all of a user's courses does not display their name. In higher education, this might be a privacy concern if the student left it lying around or even a FERPA violation if the teacher left it where others could see it.

However, some people want the name there so they can print the page and then distribute the grades to the student or their parents.

The closest thing to a name that the page displays is a breadcrumb, but it contains the **name of the person viewing the page**, not the name of the person whose grades are displayed. When a student views their grades, this is expected, but when an administrator visits the page, it shows the administrator's name. As part of the breadcrumb, it doesn't print with the page, so what it says doesn't really help anyway.

This script changes the **Courses I'm Taking** header on the page to contain the student's name and optionally their student ID number.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

There are also two additional configuration variables that you can set.
* **includeSisId** determines whether or not to include the student's SIS ID in the heading. Set ``includeSisId = false`` to disable displaying the student's ID number. The script will add the student ID in parentheses if ``includeSisId = true`` and it can find it in the user record.
* **nameOrder** is an array that allows you to specify your preference for displaying names. It scans the list and uses the first one returned by the Canvas User API. The default order is ``['short_name', 'name', 'sortable_name']``. If you want to display the names in "Last, First" form, then use ``sortable_name``. The other options should still be included, though, in case the form you want to use is missing.

## References
* [Accessing all student grades](https://community.canvaslms.com/message/14314) from the Canvas Community. 
  * Chris Long pointed out that the user name is not displayed on the grades page.
  * Chris Odom wrote some Javascript to add the user name's to the grades page.
  * James Jones took what Chris Odom had done and cleaned it up / converted it to a user script.
