# Show all grades for a student
## Information
A common request in the Canvas Community was for the abilty to show all grades for a student. This information is available within Canvas by visiting the  `/users/*/grades`

This script will add a **View All Grades of Student** button to any page ending in `/users/[0-9]+`. The button takes the user to the corresponding `/users/*/grades` page.

Known places where this button will appear include:
* From the Course > People navigation link. Click on any student's name. The path is `/courses/*/users/*`
* From the Course > People navigation link. Click on any student's name and then click on User Account Details. The path is `/users/*`
* From the Manage Accounts > User Search. Search for a user and then select their name. The path is `/accounts/*/users/*`

** This script will NOT show all grades for all students. It shows all grades for a single student. **
## Installation
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Download the [all-grades.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/grades/all-grades.user.js) file 

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.
