# QuizWhiz
This script was developed by Avi Naiman and James Jones. It adds some functionality to Speedgrader to make it even speedier.

It runs on the SpeedGrader quiz pages and on the quiz moderation pages.

## Features
* Duplicates the Final Score, Fudge Points, and Update Scores at the top of SpeedGrader when the user is not using Grade By Question mode
* Duplicates the question headers at the bottom of the questions
* Automatically expands comment boxes when you start typing in them
* Can assign 0 to any unanswered file upload questions or essay questions
* Can assign full points to any essay question that is answered
* Can regrade multiple answers (multiple select) questions as an all or nothing (no partial credit), based off the percent of correct responses, the difference between the number right and the number wrong, the Canvas method, or the best of any of these methods.
* Can regrade multiple fill-in-the-blank questions as all or nothing (no partial credit)
* Can regrade multiple drop-down questions as all or nothing (no partial credit)
* Can automatically run any of these methods for you when the page is loaded
* Each method has a button with the count of the number of items that would be affected by running that process.
* Buttons are disabled after running, but left visible on the screen so you can see how many questions were affected.

## Installation

* Install: [quizwhiz.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwhiz/quizwhiz.user.js)
* Type: [user script](../../USERSCRIPTS.md)
* Browsers: Firefox, Chrome, Safari
