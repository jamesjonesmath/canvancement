# Assign Intra-Group Peer Reviews
This script will assign each student peer reviews for the other members in their own group.

The group set is selectable, although it defaults to the assignment group set if the assignment is a already a group assignment.

This script has been tested in Chrome and Safari.

## Quick Install
1. Make sure [Tampermonkey](http://tampermonkey.net/) is installed and enabled
2. Install the [intragroup-peer-reviews.user.js](https://github.com/jamesjonesmath/canvancement/raw/master/assignments/intragroup-peer-reviews/intragroup-peer-reviews.user.js) file
3. Navigate to an Peer Review page for an assignment and find an Intra-Group Reviews section.

## About
Our school has started pushing seeking and providing feedback, so I decided to incorporate it into my course on a project the students were working on. They were to provide feedback to each of their team members. I had a relatively small class of 30 students in 7 groups of 4-5 students each, but that was still 103 peer reviews to assign manually.

This script looks up the groups that are in the group set and then looks up the students that are in each group. It looks for the peer reviews that already exist on the page and then attempts to add the ones that are missing.

## Customization
There is a reloadPageWhenFinished Boolean near the top of the file. It defaults to true since most people will probably want to see the assigned peer reviews while the script is running.

This script will automatically run on any Canvas instance hosted at ``*.instructure.com``. If you have a custom domain, then you will need to modify the `\\ @match` line to refer to your site.

## References
* [Is there a way to automatically assign intra-group peer reviews?](https://community.canvaslms.com/thread/18177-is-there-a-way-to-automatically-assign-intra-group-peer-reviews)
* [Assign Peer Reviews by Student Group](https://community.canvaslms.com/ideas/4789-assign-peer-reviews-by-student-group)
* [Assigning Intra-Group Peer Reviews](https://community.canvaslms.com/docs/DOC-14465-assigning-intra-group-peer-reviews) is the main page in the Canvas Community for this script. It includes further instructions and videos.
