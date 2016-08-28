# QuizWiz Configuration Files
These are some preset configurations that you can use to quickly get up and going with [QuizWiz](./). 

These scripts should change very infrequently, which will allow you to keep your configuration once you have the system configured. You can also use them as a starting point for your own configuration.

However, they are unlikely to be updated when there are new features added to QuizWiz, so if you want to stay up to date, you may want to use the [generic configuration file](../quizwiz.user.js) instead. Note that you will need to reconfigure this file when new features are added.

## Math Whiz
[qw-math_whiz.user.js](./configs/qw-math_whiz.user.js) is the original configuration used by Dr. Avi Naiman in his courses to quickly grade math homework submitted through Canvas. He, as many math instructors do, grades by subtraction points from the total possible, rather than adding up points awarded.

* Automatically assign 0 to any unanswered essay or file upload questions that have not been graded.
* Automatically assign full points to any answered essay or file upload questions that have not been graded.
* Automatically expands any comment boxes when the instructor begins typing in them.
* Duplicates the question header at the bottom of the question
