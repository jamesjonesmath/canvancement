# Grade By Question
This folder contains some snippets that will alter the "Grade by Question" or grade one question at a time navigation links in Canvas.

You must have a user script manager loaded to use these.

## Highlight Wrong Short Answer Questions
This script will highlight the navigation links for the questions that are not correct. As the program comes, it uses a dark red background for missed questions.

By default, it will check for Fill in the Blank and Multiple Fill in the Blank questions, although this is configurable in the checkQuestionTypes array.

This script was inspired by the [Speedgrader - mark incorrect answers red (at top)](https://community.canvaslms.com/ideas/3221) feature request in the Canvas Community.

* Install: [highlight_short_answer.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/grade_by_question/highlight_short_answer.user.js)
* Type: [user script](../../USERSCRIPTS.md)
* Browsers: Firefox, Chrome, Safari

## Remove Text Questions
When a quiz has text-only questions, Canvas includes them in the navigation links at the top but does not include them in the "Question #" within the quiz. This means that you might have to click on 7 to get to "Question 5".

This script removes the text-only questions from the navigation links and renumbers the links to match the question numbers.

* Install: [remove_text_questions.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/grade_by_question/remove_text_questions.user.js)
* Type: [user script](../../USERSCRIPTS.md)
* Browsers: Firefox, Chrome, Safari
