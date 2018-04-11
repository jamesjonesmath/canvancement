# Sort a Rubric
This is a user script that will allow users to rearrange the rows of a rubric.

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [sort-rubric.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/rubrics/sort-rubric/sort-rubric.user.js) file

## About
Rubrics are one area of Canvas that is not as refined as most. Creating an assignment rubric needs to be done through the web interface as their is no API support. When you discover that you accidentally left out a row or that you swapped two rows, your only alternative was to go through and start over and recreate the entire rubric.

This script will add the ability to rearrange the order of rows in a rubric using the drag and drop feature. You must first click the Edit Rubric button before this functionality is applied.

It runs on pages matching ``/courses/*/rubrics/*``

Creation of this script was complicated by the necessary elements not existing on the page when it is first loaded.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [How to Reorder Rubric Criteria](https://community.canvaslms.com/groups/designers/blog/2015/08/16/how-to-reorder-rubric-criteria) was my first attempt at this before I had discovered User Scripts. I talked about how *easy* it was to type two lines of JavaScript code and enable rubric sorting.
* [Sorting Rubrics Made Easy](https://community.canvaslms.com/groups/designers/blog/2015/08/25/sorting-rubrics-made-easy) was my second attempt 8 days after the first. I had learned about user scripts, but I hadn't learned how to have them automatically install and I was still hard-coding my Canvas instance into it. It required copy/paste and edit before you could run it. So *easy* was really *easier* but not *easiest*.

## Major Updates
* **2015-09-27**: When I moved the user script to [Canvancement](https://github.com/jamesjonesmath/canvancement), I made some other changes.
  * I renamed it so it automatically recognized by the user script Manager.
  * I used the wildcard *.instructure.com instead of my canvas instance
  * I used the jQuery UI sortable plugin and now the drag & drop is better supported without the occasional weirdness of the rowSorter.js library.
