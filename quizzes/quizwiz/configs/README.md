# QuizWiz Configuration Files
These are some preset configurations that you can use to quickly get up and going with [QuizWiz](../). 

These scripts should change very infrequently, which will allow you to keep your configuration once you have the system configured. You can also use them as a starting point for your own configuration.

However, they are unlikely to be updated when there are new features added to QuizWiz, so if you want to stay up to date, you may want to use the [generic configuration file](../quizwiz.user.js) instead. Note that you will need to reconfigure this file when new features are added.

## Math Whiz
[qw-math_whiz.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/configs/qw-math_whiz.user.js) is the original configuration used by Dr. Avi Naiman in his courses to quickly grade math homework submitted through Canvas. He, as many math instructors do, grades by subtracting points from the total possible, rather than adding up points awarded.

* Automatically assign 0 to any unanswered essay or file upload questions that have not been graded.
* Automatically assign full points to any answered essay or file upload questions that have not been graded.
* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question

## All or Nothing
[qw-all_or_nothing.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/configs/qw-all_or_nothing.user.js) is for those people who like to grade without any partial credit.

* Adds a button to regrade Multiple Answers questions as all or nothing without partial credit.
* Adds a button to regrade Fill in Multiple Blanks questions as all or nothing without partial credit.
* Adds a button to regrade Multiple Dropdowns questions as all or nothing without partial credit.
* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question
 
## Partial Credit based on Percentage Correctly Answered
[qw-ma_correct.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/configs/qw-ma_correct.user.js) is for those people who want each item in a Multiple Answers question to be counted equally and partial credit based on the number of items that are correctly answered. Fill in Multiple Blanks and Multiple Dropdowns questions are already assigned partial credit using this approach. This script extends it to the Multiple Answers questions as well.

* Adds a button to regrade Multiple Answers questions using partial credit based on the percentage of items that are correctly answered.
* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question

## Generic Configuration
[quizwiz.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/quizzes/quizwiz/quizwiz.user.js) is the starting point for those who want to configure their own system. Those installing this script will not see much happening until the script is configured.

Also note that when new features are added to the system, they will be added to this configuration file as well, which means that you will probably need to go back and edit the script when those changes are made. This sounds more intrusive than it probably is as changes to the configuration file should only need made when there are new methods or features added to the software.
