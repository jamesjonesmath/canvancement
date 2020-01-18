# Color Course Border
This is a user script that will add a colored border when inside a course. 
The color of the border will match the custom color specified on the dashboard or calendar.

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [color-course-border.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/courses/color-border/color-course-border.user.js) file

## About
Canvas uses custom colors on the dashboard and calendar to help identify the course. When you go into the course, there is no color indicator.

A student asked about [changing the color inside the course](https://community.canvaslms.com/thread/43117-change-inside-course-colors)
and the standard answer was it cannot be done. 
When describing the process that would be required, I realized that I could write the code fairly quickly and so I did.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @match` line to refer to your site.
