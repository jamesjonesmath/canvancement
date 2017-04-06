// ==UserScript==
// @name        Group Discussion Links
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Create links from a group discussion that will return you back to the main course page or the discussion page
// @include     https://*.instructure.com/groups/*/discussion_topics/*
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  try {
    // There are some configuration settings that you can customize
    // show_names: true will look up the names of the course and discussion for
    // the links. Setting it false will use a generic "Course > Description"
    // switch_to_discussion: true will switch to the corresponding discussion
    // when switching to a new group, false will mimic the default Canvas
    // behavior of going to the main group page

    var config = {
      'show_names' : true,
      'switch_to_discussion' : true
    };

    var pathRegex = new RegExp('^/groups/[0-9]+/discussion_topics/[0-9]+$');
    if (!pathRegex.test(document.location.pathname)) {
      return;
    }
    if (typeof ENV.DISCUSSION === 'undefined' || typeof ENV.DISCUSSION.SEQUENCE === 'undefined') {
      return;
    }
    var courseId = ENV.DISCUSSION.SEQUENCE.COURSE_ID;
    var discussionId = ENV.DISCUSSION.SEQUENCE.ASSET_ID;
    var infoElement = document.querySelector('div.discussion-subtitle + span.discussion-subtitle');
    if (!infoElement) {
      return;
    }
    var courseLink = infoElement.querySelector('a');
    courseLink.textContent = 'Course';
    infoElement.appendChild(document.createTextNode(' > '));
    var discussionLink = document.createElement('a');
    discussionLink.href = '/courses/' + courseId + '/discussion_topics/' + discussionId;
    discussionLink.textContent = 'Discussion';
    infoElement.appendChild(discussionLink);
    if (config.show_names) {
      $.ajax({
        'url' : '/api/v1/courses/' + courseId,
        'dataType' : 'json',
        'timeout' : 2000
      }).done(function(data) {
        var name = typeof data.course_code !== 'undefined' ? data.course_code : data.name;
        courseLink.textContent = name;
      });
      $.ajax({
        'url' : '/api/v1/courses/' + courseId + '/discussion_topics/' + discussionId,
        'dataType' : 'json',
        'timeout' : 2000
      }).done(function(data) {
        discussionLink.textContent = data.title;
      });
    }
    if (config.switch_to_discussion) {
      var groupLinks = document.querySelectorAll('div#left-side > ul > li a');
      if (groupLinks) {
        for (var i = 0; i < groupLinks.length; i++) {
          groupLinks[i].href = groupLinks[i].href + '/discussion_topics?root_discussion_topic_id=' + discussionId;
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
})();
