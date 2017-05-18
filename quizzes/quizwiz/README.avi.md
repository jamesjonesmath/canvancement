# QuizWiz
QuizWiz is a user script that adds regrading and speed enhancements to grading quizzes in Canvas. It runs on the SpeedGrader quiz pages and on the quiz moderation pages within Canvas.

## Quick Install
1. Install a browser add-on: [Greasemonkey](https://addons.mozilla.org/en-us/firefox/addon/greasemonkey/) for Firefox or [Tampermonkey](http://tampermonkey.net/) for Chrome/Safari.
2. Choose one of the [QuizWiz Installation Scripts](install/)

For most people, those two steps are all that should be needed. If you wish to change the settings or your Canvas instance uses a custom domain, then you will need to edit the user script.

## Features
There are two major types of improvements that QuizWiz adds to Canvas quizzes: *regrading features*, which add options for grading multi-part questions differently from Canvas's method, and *speed enhancements*, which improve the worflow process and reduce the amount of interaction needed for manually-graded questions.

Each method has a button showing the number of questions that would be affected by running that method.  Buttons are disabled after being run, but left visible on the screen so that you can see how many questions were affected.  Methods can be configured to run automatically when the page is loaded.


### Regrading Features
* Can regrade *Multiple-Answers* (aka multiple-select) questions using (see example below): 
  * *All or Nothing* (no partial credit); 
  * *Partial Credit* based off the percent of correct responses; or 
  * the *Difference* between the number of parts answered correctly and the number answered incorrectly (aka *Right minus Wrong*).
* Can regrade *Fill-in-Multiple-Blanks* questions using *All or Nothing* (no partial credit).
* Can regrade *Multiple-Dropdowns* questions using *All or Nothing* (no partial credit).

### Speed Enhancements
* Can assign 0 to any unanswered *Essay* or *File Upload* question, obviating the need to enter 0's manually.
* Can assign a question's full points to any answered *Essay* question, permitting a workflow of *deducting* points from the maximum for that question, rather than increasing the assigned points from 0.
* Duplicates the *Final Score*, *Fudge Points* and *Update Scores* buttons at the top of the page when the user is not using SpeedGrader's *Grade by Question* mode.
* Duplicates each *Essay* question's header at the bottom of the answer, to permit grading without the need to scroll back to the beginning of the question.
* Automatically expands an *Additional Comments* box when you start typing in it.

## *Multiple-Answers* Regrading Example
Which of the following are planets?  (15 Points)
- [ ] Mars
- [ ] Sun
- [ ] Earth
- [ ] Moon
- [ ] Saturn

Mars | Sun | Earth | Moon | Saturn | Canvas | All or Nothing | Partial Credit | Difference
:---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---:
x | x | | | | 0 | 0 | 6 | 0
x | | x | | | 10 | 0 | 12 | 9
x | x | x | | | 5 | 0 | 9 | 3
 
# References
This script was developed by James Jones and Avi Naiman following some discussion in the Canvas Community. 
The original intent was to have a system that would speed up the process of manually grading mathematics homework by reducing the number of clicks needed in SpeedGrader. From there, it grew to include some other requests that had been made in the Community.
* [Understanding Multiple Answers Questions](https://community.canvaslms.com/docs/DOC-6674) is required reading for anyone who doesn't understand how or why Canvas grades the Multiple Answers questions the way it does.
* [How do you use Canvas for math homework assignments?](https://community.canvaslms.com/message/33657)
* [How can you hand-grade a Quiz REALLY quickly in Canvas?](https://community.canvaslms.com/message/33481)
* [Multiple Answer quiz question - partial points without penalty](https://community.canvaslms.com/ideas/2443)
* [All or No Points on Multiple Answer Questions](https://community.canvaslms.com/ideas/1241)
