# All Courses Sort
This is a user script that will add the ability to sort or filter each column in the All Courses list

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [all-courses-sort.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/courses/all-courses/all-courses-sort.user.js) file

## About
This script uses the functionality of the [Mottie Tablesorter](https://mottie.github.io/tablesorter/docs/) to add sorting capability to the tables on the All Courses page. This jQuery plugin is pretty powerful and you can do a lot with it, including custom parsers for sorting, but I've just added the bare minimum.

You can click at the top of any column to sort by the column. You can sort on multiple columns by holding odwn the shift key when you click on additional columns.

Many people have created feature requests in the Canvas Community to make the all courses list sortable. [New UI: Add option to group courses in all course list by term](https://community.canvaslms.com/ideas/3666-new-ui-add-option-to-group-courses-in-all-course-list-by-term) and  [Make the course list sortable](https://community.canvaslms.com/ideas/10886-make-the-course-list-sortable) were active when this project began.

During InstructureCon 2019, David Theriault came up to me before the last session of Wednesday and asked about this feature. I told him to look me up at hack night. I then confirmed which page he was talking about and reiterated to look me up at hack night. After the session, I had about 1.5 hours before supper, so I walked back to the room and wrote the script to do this.
## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

This script automatically adds filtering capabilities so that you can type in a string. If you do not want this, then comment out the line about widgets.

The ``sortList`` line allows you to set an initial sort order. Uncommenting this line will make it sort by term in descending order, but you can change the sort column and order if you like.

It loads the default CSS from the Mottie Tablesorter. This doesn't really fit in with Canvas, but I wanted to get something out there quickly for people. You can comment out or remove the section about adding the CSS if you want it to look like Canvas. If someone isolates what needs done to make it look like Canvas with the arrows, let me know.

## Additional Information
For more information, see the [Sorting the All Courses list](https://community.canvaslms.com/people/james@richland.edu/blog/2019/07/14/sorting-the-all-courses-list) blog post in the Canvas Community.
