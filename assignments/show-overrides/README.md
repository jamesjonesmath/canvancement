# Show Override Names
Canvas allows for differentiated assignments where different sections or individual students can have different due and availability dates.

When Canvas shows these dates on the assignments page, it shows a very generic "1 student" or "2 students" rather than the name of the students. This user script will replace the generic count of students by the names of the students.

This script has been tested in Firefox and Chrome.

## Quick Install
1. Make sure [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome or Safari is installed and enabled
2. Install the [show-overrides.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/assignments/show-overrides/show-overrides.user.js) file

## About

## Customization
This script will attempt to detect the date using your locale. It has been tested with the "en" locale (English).

However, I was unable to determine the word for "student" or "students" from the included I18n internationalization (this is performed on the Canvas servers, not on the browser), so it looks for "student". If your language uses a different word, then there is a studentRegex variable near the top of the file that you can change to match your language.

This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [Show names of students associated with different due dates](https://community.canvaslms.com/ideas/4963) was a feature request by Elena Zaurova that sparked the idea for this.
