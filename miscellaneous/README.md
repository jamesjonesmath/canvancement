# Miscellaneous
These files don't really fit in or aren't fully developed and may contain code snippets rather than working products.

## Remove Max Width
Most pages within Canvas are shown with a lot of white-space on the right-hand side when viewed on a wide-screen monitor. 
For my 1920x1080 monitor, the width gets limited to 1366px, so there is about 29% of the screen that's wasted.
This user script overrides the max-width restriction Canvas puts on pages within a course.

This tweak has been rolled into the Canvas CSS Tweaks enhancement.

[remove-max-width.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/miscellaneous/remove-max-width.user.js)

## Canvas CSS Tweaks
This is a collection of tweaks I've made to the CSS to improve my experience. Many of the SpeedGrader hacks to reduce the amount of scrolling by hiding things I don't use. I have very short rating titles and I don't leave comments on individual criteria.

Your use may vary, so you can control which tweaks to use. Modify the __features__ array to specify which rules you want to use. Comment out any rules you do not want to use.

* __fullscreen__ removes the max-width restriction (default: enabled)
* __sg_rubrics__ removes the min-width: 60rem style on rubrics in SpeedGrader (default: enabled)
* __sg_avatar_zoom__ doubles the size of the user's avatar when you mouse over it in SpeedGrader (default: enabled)
* __sg_long_descriptions__ hides the long descriptions in rubrics (default: enabled)
* __sg_points_possible__ hides the points possible in rubric criteria. Can save space if you have short titles (default: disabled)
* __sg_criteria_comments__ hides the button to leave comments for individual criteria (default: enabled)
* __no_test__ removes the test and beta instance notification from the bottom. This often covers my settings button. (default: enabled)
* __hide_unused_course_navigation__ hides items that Canvas forces instructors to see even though they are disabled in the course navigation settings. See the __forcedNavigationItems__ setting to control which ones are shown. As shipped, it leaves the rubrics, files, and pages visible while hiding announcements, collaborations, conferences, and outcomes (default: enabled)
* __hide_urls__ hides the URL when you print content (default: enabled)
* __disc_split_panel_position__ sets positioning to fixed instead of absolute for the split pane in new discussions. Hopefully this is a temporary fix.

The script only inserts the rule when it would apply to the page, rather than being a generic CSS injection tool that automatically added the rule, even if it didn't apply. This minimizes the chance that the CSS will interfere with Canvas styles on other pages.

[canvas-css-tweaks.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/miscellaneous/canvas-css-tweaks.user.js)
