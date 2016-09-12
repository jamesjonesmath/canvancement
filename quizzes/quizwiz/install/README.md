# QuizWiz Installation Scripts
Choose an installation script from the list below that most closely matches how you wish to use QuizWiz. 

The fastest way to install a QuizWiz flavor is to click on the filename from the description below. If you click on the filename from the list at the top, you can view the code, but then you will need to click the Raw button to install it.

## Speed Enhancements only
[qw-speed.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/install/qw-speed.user.js) includes the speed enhancements without any of the regrade features. This is a good place to start for those who wish to choose their own features.

* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question.
* Duplicates the final score, fudge points, and update scores button at the top unless running Speedgrader in grade by question mode. 

## Auto Advance
[qw-auto_advance.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/install/qw-auto_advance.user.js) includes the speed enhancements including auto advance without any of the regrade features. 

* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question.
* Duplicates the final score, fudge points, and update scores button at the top unless running Speedgrader in grade by question mode.
* Adds a button next to the "Update Scores" link in quizzes to update scores and advance to the next user.
* Adds a button next to the "Submit" comment button to submit the comment and advance to the next user.
* Adds a button next to the "Save" in the rubric to save the rubric and advance to the next user. There is an option to enable re-opening the rubric for the next user, but this is not enabled by default.

## Rubrics
[qw-rubrics.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/install/qw-rubrics.user.js) includes the speed enhancements including auto advance without any of the regrade features. 

* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question.
* Duplicates the final score, fudge points, and update scores button at the top unless running Speedgrader in grade by question mode.
* Automatically assigns 0 points to any unanswered essay or file-upload question
* Adds a button next to the "Update Scores" link in quizzes to update scores and advance to the next user.
* Adds a button next to the "Submit" comment button to submit the comment and advance to the next user.
* Adds a button next to the "Save" in the rubric to save the rubric and advance to the next user.
* Automatically reopens a rubric when clicking on the "Save Rubric and Advance" button.

## All or Nothing
[qw-all_or_nothing.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/install/qw-all_or_nothing.user.js) is for those people who like to grade without any partial credit.

* Adds a button to regrade Multiple Answers questions as all or nothing without partial credit.
* Adds a button to regrade Fill in Multiple Blanks questions as all or nothing without partial credit.
* Adds a button to regrade Multiple Dropdowns questions as all or nothing without partial credit.
* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question.
* Duplicates the final score, fudge points, and update scores button at the top unless running Speedgrader in grade by question mode.
 
## Partial Credit based on percentage of items correctly answered
[qw-partial_credit.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/install/qw-partial_credit.user.js) is for those people who want each item in a Multiple Answers question to be counted equally and partial credit based on the number of items that are correctly answered. Fill in Multiple Blanks and Multiple Dropdowns questions are already assigned partial credit using this approach. This script extends it to the Multiple Answers questions as well.

* Adds a button to regrade Multiple Answers questions using partial credit based on the percentage of items that are correctly answered.
* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question.
* Duplicates the final score, fudge points, and update scores button at the top unless running Speedgrader in grade by question mode.

## Math Whiz
[qw-math_whiz.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/install/qw-math_whiz.user.js) is the original configuration used by Dr. Avi Naiman in his courses to quickly grade math homework submitted through Canvas. He, as many math instructors do, grades by subtracting points from the total possible, rather than adding up points awarded.

* Automatically assign 0 to any unanswered essay or file upload questions that have not been graded.
* Automatically assign full points to any answered essay or file upload questions that have not been graded.
* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question.
* Duplicates the final score, fudge points, and update scores button at the top unless running Speedgrader in grade by question mode.

## Custom Installation
[qw-custom.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/install/qw-custom.user.js) is a custom configuration file with everything disabled. The user is expected to go through and customize the configuration options before using the script.

This installation script may change if new features are added to QuizWiz. Since the user scripts automatically update your scripts, your configuration may be lost. For most people, it is better to start with one of the other installation scripts, change settings as desired, and then watch for announcements of new features.
