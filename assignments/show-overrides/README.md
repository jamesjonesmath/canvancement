# Show Override Names
This script will show the names of the students who have received assignment overrides.

This script has been tested in Firefox, Chrome, and Safari. It works with Assignments, Quizzes, or Discussions that have multiple due dates.

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [show-overrides.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/assignments/show-overrides/show-overrides.user.js) file

## About
Canvas allows for differentiated assignments where different sections or individual students can have different due and availability dates. This feature is available for assignments, quizzes, and discussions.

When Canvas shows the due dates on these pages, it shows a very generic "1 student" or "2 students" rather than the name of the students. This user script will replace the generic count of students by the names of the students. If a sortable name is available, it will use it to list the students in alphabetical order based on the last name. 

Assignment overrides are available for assignments. When you have a discussion or a quiz, you need to look up the associated assignment and then get the overrides for that. Technically, that information is contained on the original page inside of a link to the speed grader, but I didn't want to risk it so I went ahead and made a call.

## Customization
This script will attempt to detect the date using your locale. It has been tested with the "en" locale (English).

However, I was unable to determine the word for "student" or "students" from the included I18n internationalization (this is performed on the Canvas servers, not on the browser), so it looks for "student". If your language uses a different word, then there is a studentRegex variable near the top of the file that you can change to match your language.

If you would rather have it alphabetically by the student's first name, then modify the overrideNames() function at the end to use _name_ instead of _sortable_name_.

This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [Show names of students associated with different due dates](https://community.canvaslms.com/ideas/4963) was a feature request by Elena Zaurova that sparked the idea for this.
