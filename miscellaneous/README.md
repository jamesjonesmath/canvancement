# Miscellaneous
These files don't really fit in or aren't fully developed and may contain code snippets rather than working products.

## Remove Max Width
Most pages within Canvas are shown with a lot of white-space on the right-hand side when viewed on a wide-screen monitor. 
For my 1920x1080 monitor, the width gets limited to 1366px, so there is about 29% of the screen that's wasted.
This user script overrides the max-width restriction Canvas puts on pages within a course.

[remove-max-width.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/miscellaneous/remove-max-width.user.js)

## Canvas CSS Tweaks
This is a replacement for the Remove Max Width script. Current tweaks include
* __fullscreen__ removes the max-width restriction (default: enabled)
* __sg_rubrics__ removes the min-width: 60rem style on rubrics in speedgrader (default: enabled)
* __no_test__ removes the test and beta instance notification from the bottom (default: disabled)

There is a __features__ array that specifies which rules you want to enable for your site.

The script only inserts the rule when it would apply to the page, rather than being a generic CSS injection tool that automatically added the rule, even if it didn't apply. This minimizes the chance that the CSS will interfere with Canvas styles on other pages.

[canvas-css-tweaks.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/miscellaneous/canvas-css-tweaks.user.js)
