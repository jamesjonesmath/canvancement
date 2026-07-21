# Max Rubrics
Canvas has removed the classic SpeedGrader experience and replaced it with the new Performance and Usability Upgrades for SpeedGrader.
This transition has broken several of my older Canvancements. This is a replacement for some of those written for the new SpeedGrader.
It is a combination of the functionality of Max Ratings and the SpeedGrader portion of QuizWiz.

**This is BETA software**. I need to get it out there for people to use but realize that it is in active development.

## Quick Install
Remember this is incomplete beta software and things will change. Be sure to go through and look at the configuration before you use it.
1. Install and enable the [Tampermonkey](http://tampermonkey.net/) browser extension. 
2. Install the [max-rubrics.users.js](https://github.com/jamesjonesmath/canvancement/raw/master/rubrics/max-rubrics/max-rubrics.user.js) file

## About
The old Max Ratings allowed you to assign maximum points to a rubric. The new Max Rubrics allows you to add customizable functions to a rubric.
You can 
* assign maximum points, minimum points, or clear an entire rubric. You can even assign it to do this to specific criteria (for example, my wife grades criteria 1 and 2 of her discussions after the initial post and then 3 and 4 after the discussion ends. She can now assign the max to just rows 1 and 2).
* save the rubric, jump to the submission comments, or advance to the next student (only if you save).
* In development are copy/paste functionality.

A button can do multiple actions. For example, you can assign maximum points, save the rubric, and then jump to the comment sections. I've set the title on the button to contain a list of what actions it takes.

Some SpeedGrader optimizations / annoyances can be changed as well. Most of these are for the traditional layout right now.
* suppress the annoying 7 second alert that hides the student's name and the previous student link when a rubric is saved. This is triggered by using a button with a save or advance action. If there is a failure, the alert remains and the rubric does not advance.
* One of my wife's main complaints were that the rubrics were so long and she knew what they said but there was no way to shrink them down.
  * For those who don't use the criteria-specific comments, you can hide the toggle button.
  * You can hide the words "Criterion Score" and remove the "pts" at the end of "/5 pts".
  * Those last two allow you to shrink the size of the rows when you have no long descriptions in the ratings.
  * You can also reduce the hide or blank the long description text
  * You can set a maximum height for the criteria row
* In development (no promises):
  * Shade the background on the selected ratings instead of just the border
  * Hide the comment library for those who don't use them.
  * Duplicate the point values at the bottom of the rubric so people can see it when leaving comments
  * Duplicate the advance functionality at the bottom of the rubric.
  * Create a UI so that people can customize this without having to edit the code

So far, this has only been tested with Tampermonkey using Chrome, but I haven't done any browser-specific hacks, so it should work with others.
