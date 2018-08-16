# Admin Course Links
This is a user script that will modify the administrative course search page and add course-specific links for each course.

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [admin-course-links.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/courses/admin-course-links/course-admin-links.user.js) file

## About
A long time ago, someone had asked about adding a direct link to the course search to the course roster within a course. 
The [Add "People" at the Courses page under Admin level](https://community.canvaslms.com/ideas/6480) is now archived and the corresponding
script [Add People Link](https://github.com/jamesjonesmath/canvancement/tree/master/users/admin-people-link) no longer functions because
of changes that Canvas made to the Admin course search page.

In May 2018, Mike Hower put a feature request into the Community called [Custom JavaScript for Admin/Courses Page](https://community.canvaslms.com/thread/23634-custom-javascript-for-admincourses-page)
and Robert Carroll supplied a solution for the old account search. Then in August, Mike had moved to the new course search and the thread became
active again with a request to make it work with the new course search.

Robert once again came to the rescue and we had a productive code-review session. During that code review, I thought instead of just offering suggestions,
I would also show what I would have done. I took the work of Robert and rewrote it as a user script instead of something that has to be ran from the global JavaScript for Canvas.
Along the way, I completely refactored it doing it the way I would have done it. This led to an extremely beneficial back and forth
where we looked at each other's code, made suggestions for improvements, and even held a live chat where we put the finishing touches
on everything, talking about defaults and best ways to handle things. Overall, it was one of the best experiences I've had developing a script -- especially considering I didn't set out to develop one.

I'm making the user script version I wrote available here and I will link to Robert's version once it becomes available.
Both provide the same solution and the user should be able to run either one.

Mine is developed as a user script so that a user can run it without installing it into the global JavaScript. It should run without modification if placed into the custom JavaScript, although I have not tested this.
Robert's version is designed to be run in the custom global JavaScript, but it should run as a user script if someone adds the Tampermonkey headers to it.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

There are some variables that you can customize within the code if you like.

### Links to Add
There is a configuration object at the top that lists which items should appear in the list. By default, it includes links to the People, Grades, and Settings page.
There are also links for Analytics, Announcements, Assignments, Discussions, Files, Modules, Outcomes, Pages, Quizzes, and the Syllabus that can be enabled by uncommenting the lines.
You can reoder each line to change the order the items appear in.

### Wrapper CSS
Since this is designed to be ran as a user script, I wanted to get some formatting into the list so it looks good.
The contents of the wrapperCSS variable are added to a stylesheet for the document. They are prefixed with a class of the wrapper, which defaults to jj_course_links.

If you want to include this in the global custom JavaScript and you already load a custom CSS file, you can completely remove this CSS variable and put the code into your own CSS file.
