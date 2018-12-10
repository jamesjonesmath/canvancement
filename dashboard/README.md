# Sort the Dashboard Course Cards
This is a user script that will allow the user to drag and drop the course cards on the dashboard into a new position.

## No Longer Necessary!
With the December 8, 2018, production release, Canvas now offers a native solution and this script is not needed. The script appears to continue to work, but you should remove it from your system and just use the Canvas solution.

Removing this script will cause the dashboard course card order to reset to the default, but you can now set it using the Canvas solution.

I'm leaving it here for people who might be using a self-hosted version who have not yet updated.

## Quick Install - Individuals
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [dashcard_sorter.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/dashboard/dashcard_sorter.user.js) file

This installation approach should work for Firefox, Chrome, and Safari.

## Site-wide Installation
This script has also been tested for inclusion in a site's custom JavaScript file. This eliminates the need for individual users to install the script on their machines and people should not do both.

Canvas Admins can add the code from [dashcard_sorter.user.js](/dashboard/dashcard_sorter.user.js) file into your global JavaScript file. The metadata comments at the top should not be included. You may also need to include it in your mobile JavaScript file, I'm not sure.

This approach has been tested with Firefox, Chrome, Safari (Mac and iPhone), Internet Explorer 11, and Edge.

## About
The Canvas Dashboard shows a course card (rectangle) for each course. It contains the course name, the course nickname, and possibly some quicklinks to areas within the course. It is color coded to match the calendar.

The order in which the cards are displayed is not ideal. Sometimes it appears alphabetical, sometimes the term of a course seems to matter. 

Some people would like to organize *their* dashboard in *their* order, and this script gives them the ability to do so.cu

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

If you install it as part of your global JavaScript file, there is no need to modify the code.

## References
* [Sorting Dashboard Course Cards](https://community.canvaslms.com/docs/DOC-8328) -- this is the announcement in the Canvas Community
* [Reorder Dashboard Boxes](https://community.canvaslms.com/ideas/5371)
* [Drag Courses on Dashboard](https://community.canvaslms.com/ideas/3450)
* [Reorder Class List](https://community.canvaslms.com/ideas/4716)
* [Being able to move the courses around](https://community.canvaslms.com/ideas/5576)
* [How do I reorder the course tabs on my Dashboard?](https://community.canvaslms.com/thread/7302)
