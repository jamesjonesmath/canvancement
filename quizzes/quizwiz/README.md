# QuizWiz
QuizWiz is a user script developed by James Jones​ and Avi Naiman that adds speed enhancements to quizzes, assignments, and discussions within SpeedGrader. It also provides alternative scoring methods for certain types of quiz questions. It runs in SpeedGrader and on the quiz moderation pages.

## Quick Install
1. Install a browser add-on: [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome/Safari.
2. Choose one of the [QuizWiz Installation Scripts](install/)

For most people, those two steps are all that should be needed. If you wish to change the settings or your Canvas instance uses a custom domain, then you will need to edit the user script.

## Features
QuizWiz adds two major types of improvements to Canvas: *speed enhancements*, which improve the worflow process, and *regrading methods*, which provide alternative methods of grading quiz questions.

### Speed Improvements
Some of the speed improvements are specific to quizzes and will work from either SpeedGrader or the Quiz Moderation page. Other enhancements are specific to SpeedGrader, but will work for quizzes, assignments, and discussions.
* Can assign zero points to any unanswered *Essay* or *File Upload* quiz questions.
* Can assign full points to any answered, but ungraded, *Essay* or *File Upload* quiz questions.
* Duplicates the *Final Score*, *Fudge Points* input, and *Update Scores* button at the top of a quiz page when the user is not using SpeedGrader's *Grade by Question* mode.
* Duplicates the question header of question number and point values at the bottom of each quiz question.
* Automatically expands a quiz question's *Additional Comments* textbox when you start typing in it.
* Adds a button next to the *Update Scores* button quizzes that will update scores and automatically advance to the next user.
* Adds a button next to a submission comment's *Submit* button that will submit the submission comment and automatically advance to the next user.
* Adds a button next to a rubric's *Save* button that will save the rubric and automatically advance to the next user.
* Automatically expands a rubric when you advance to the next user. This feature depends on the *Save Rubric and Advance* feature.

### Regrading Features
These features are specific to quizzes as they provide alternative methods of grading quiz questions.

Each of these methods adds a button at the top of the quiz to invoke the method. Each button contains the number of questions on the student's quiz that would be affected by clicking the button and buttons will not show if they would not make any changes to the quiz. Buttons are disabled after being run, but left visible on the screen so that you can see how many questions were affected. Any of these methods can be configured to automatically execute once the quiz has loaded.
* Can regrade *Multiple-Answers* questions, which are also known as multiple-select questions, using different approaches then Canvas. Only one of the following can be enabled at a time.
    * *All or Nothing* provides the ability to grade questions without any partial credit -- all of the parts must be correct to receive any points.
    * *Partial Credit* based off the percentage of items that are correctly answered. An item is correctly answered when the student selects a correct response or does not select an incorrect response.
    * The *Difference* between the number of items correctly answered and the number of items incorrectly answered. This is sometimes called *right minus wrong* method and is similar to Canvas' method except Canvas assigns the points based on the number of correct responses and this method bases it on the total number of available responses.
* Can regrade *Fill-in-Multiple-Blanks* questions using the *All or Nothing* technique of no partial credit. Canvas currently grades these questions based on the percentage of item that are correctly answered.
* Can regrade *Multiple-Dropdowns" questions usingthe *All or Nothing* technique of no partial credit. Canvas currently grades these questions based on the percentage of item that are correctly answered.
* Can assign zero points to any unanswered *Essay* or *File Upload* quiz questions. Although this was listed as a speed enhancement, it still changes the default grading of Canvas and so it is listed here as well.
* Can assign full points to any answered, but ungraded, *Essay* or *File Upload* quiz questions. This is another speed enhancement that provides an alternative to the Canvas default and is invoked via a button.

# References
This script was developed by James Jones and Avi Naiman following some discussion in the Canvas Community.

The original intent was to have a system that would speed up the process of manually grading mathematics homework by reducing the number of clicks needed in Speedgrader. From there, it grew to include some other requests that had been made in the Community.
* [Understanding Multiple Answers Questions](https://community.canvaslms.com/docs/DOC-6674) is required reading for anyone who doesn't understand how or why Canvas grades the Multiple Answers questions the way it does.
* [How do you use Canvas for math homework assignments?](https://community.canvaslms.com/message/33657)
* [How can you hand-grade a Quiz REALLY quickly in Canvas?](https://community.canvaslms.com/message/33481)
* [Multiple Answer quiz question - partial points without penalty](https://community.canvaslms.com/ideas/2443)
* [All or No Points on Multiple Answer Questions](https://community.canvaslms.com/ideas/1241)
* [Update Scores and Next](https://community.canvaslms.com/ideas/1321)
* [Speedgrader - auto advance to next student (after score is entered)](https://community.canvaslms.com/ideas/5625)
* [In Speedgrader, the "advance to next student" button should be closer to grading box](https://community.canvaslms.com/ideas/3289)
* [Auto advance to next student in SpeedGrader when number grade is entered and Enter key is hit](https://community.canvaslms.com/ideas/2653) is not currently implemented by QuizWiz.
* [Design/add "next" button nearer to "Submit Comment" in SpeedGrader](https://community.canvaslms.com/ideas/2896)

Canvas marked many of the *advance to next user* requests as deployed with the [2016-08-06 production release](https://community.canvaslms.com/docs/DOC-7881), referred to as SpeedGrader 1.25 in [Canvas Studio: Speedgrader™ Facelift](https://community.canvaslms.com/docs/DOC-7207), but that was just a redesign of SpeedGrader and doesn't actually advance to the next user.
