# QuizWiz
QuizWiz is a user script that adds regrading and speed enhancements to grading quizzes in Canvas. It runs on the SpeedGrader quiz pages and on the quiz moderation pages within Canvas.

## Quick Install
1. Install a browser add-on: [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome/Safari.
2. Choose one of the [QuizWiz Installation Scripts](install/)

For most people, those two steps are all that should be needed. If you wish to change the settings or your Canvas instance uses a custom domain, then you will need to edit the user script.

## Features
There are two major types of improvements that QuizWiz adds to Canvas quizzes. These are speed enhancements, which improve the worflow process and reduce needless mouse movement, and regrading methods, which add options for grading Canvas quizzes differently than what Canvas does.

### Speed Improvements
* Duplicates the Final Score, Fudge Points, and Update Scores at the top of SpeedGrader when the user is not using Grade By Question mode
* Duplicates the question headers at the bottom of the questions
* Automatically expands comment boxes when you start typing in them
* Can assign 0 to any unanswered file upload questions or essay questions
* Can assign full points to any essay question that is answered

### Regrading Features
* Can regrade multiple answers (multiple select) questions as an all or nothing (no partial credit), based off the percent of correct responses, the difference between the number right and the number wrong, the Canvas method, or the best of any of these methods.
* Can regrade multiple fill-in-the-blank questions as all or nothing (no partial credit)
* Can regrade multiple drop-down questions as all or nothing (no partial credit)
* Can automatically run any of these methods for you when the page is loaded
* Each method has a button with the count of the number of items that would be affected by running that process.
* Buttons are disabled after running, but left visible on the screen so you can see how many questions were affected.

# References
This script was developed by James Jones and Avi Naiman following some discussion in the Canvas Community. 
The original intent was to have a system that would speed up the process of manually grading mathematics homework by reducing the number of clicks needed in Speedgrader. From there, it grew to include some other requests that had been made in the Community.
* [Understanding Multiple Answers Questions](https://community.canvaslms.com/docs/DOC-6674) is required reading for anyone who doesn't understand how or why Canvas grades the Multiple Answers questions the way it does.
* [How do you use Canvas for math homework assignments?](https://community.canvaslms.com/message/33657)
* [How can you hand-grade a Quiz REALLY quickly in Canvas?](https://community.canvaslms.com/message/33481)
* [Multiple Answer quiz question - partial points without penalty](https://community.canvaslms.com/ideas/2443)
* [All or No Points on Multiple Answer Questions](https://community.canvaslms.com/ideas/1241)
