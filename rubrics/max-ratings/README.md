# Max Ratings
This is a user script that will allow you to quickly fill in all non-scored ratings in a rubric with the maximum point values for that rating.

## Quick Install
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension
2. Install the [max-ratings.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/rubrics/max-ratings/max-ratings.user.js) file

## About
If you love rubrics with lots of criteria but hate clicking on each one, especially when students normally get the full points, then this script can help.

It adds a Max button to the rubric in SpeedGrader after the Pts label in the header. Clicking that button will take any criterion that does not have a score and automatically
assign the maximum score.

If a rating already has points entered for it, then it will skip that rating and honor the points already entered.

Two common-use scenarios are:
* Click the Max button at the start and then change any ratings that do not get the maximum points
* Select some rubric items and then click Max to fill in the rest

This is useful with the [QuizWiz](../quizzes/quizwiz) Canvancement that allows you to save the rubric, advance to the next student, and then re-open the rubric so you can continue quickly.

## Customization
This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @include` line to refer to your site.

## References
* [Autofill Maximum Rubric Ratings](https://community.canvaslms.com/t5/Higher-Ed-Canvas-Users/Autofill-Maximum-Rubric-Ratings/ba-p/518278) is the blog post in the Canvas Community and where you can get support
* [Default Score on Rubric in SpeedGrader](https://community.canvaslms.com/t5/Idea-Conversations/Default-Score-on-Rubric-in-SpeedGrader/idc-p/518215) is a feature request for this functionality.
* [When SpeedGrading an assignment, initialize points to rubric's max pts](https://community.canvaslms.com/t5/Canvas-Question-Forum/When-SpeedGrading-an-assignment-initialize-points-to-rubric-s/m-p/182850) was where Phil and I discussed the problem and found the work around.
* [Is there a way to automatically choose all the highest values on a rubric?](https://community.canvaslms.com/t5/Canvas-Question-Forum/Is-there-a-way-to-automatically-choose-all-the-highest-values-on/m-p/143618) was a question about whether this was possible.
