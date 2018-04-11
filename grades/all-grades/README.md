# Show all grades for a single student
This is a user script that will show all grades for a single student. It does not show all grades for all students.

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [all-grades.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/grades/all-grades/all-grades.user.js) file

## About
A common request in the [Canvas Community](https://community.canvaslms.com) was for the abilty to show all grades for a student. This information is available within Canvas by visiting the  `/users/*/grades`

This script will add a **View All Grades of Student** button to any page ending in `/users/[0-9]+`. The button takes the user to the corresponding `/users/*/grades` page.

Known places where this button will appear include:
* From the Course > People navigation link. Click on any student's name. The path is `/courses/*/users/*`
* From the Course > People navigation link. Click on any student's name and then click on User Account Details. The path is `/users/*`
* From the Manage Accounts > User Search. Search for a user and then select their name. The path is `/accounts/*/users/*`

The username is not displayed on the page. In higher education, this is a good thing to help avoid FERPA violations. If you would like to add the user's name to the page, then see the [Add a student's name to their Grades page](../name-grades/) user script.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [Accessing all student grades](https://community.canvaslms.com/message/14314) from the Canvas Community. 
  * Chris Long pointed out that you can use `/users/*/grades` to get the Grades for all students. 
  * Chris Odom wrote some Javascript to add a link to the page. 
  * James Jones took what Chris Odom had done and cleaned it up / converted it to a user script.
