// ==UserScript==
// @name        Group Discussion Links
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Create links from a group discussion that will return you back to the main course page or the discussion page
// @match       https://*.instructure.com/groups/*/discussion_topics/*
// @version     4
// @grant       none
// ==/UserScript==
/* global ENV */
(function () {
  // There are some configuration settings that you can customize.
  // show_names: true will look up the name of the discussion and add it to
  // the breadcrumb.
  // Setting it false will use append a generic " > Discussion" link.
  // switch_to_discussion: true will switch to the corresponding discussion
  // when switching to a new group, false will mimic the default Canvas
  // behavior of going to the main group page

  const config = {
    show_names: true,
    switch_to_discussion: true,
  };

  const pathRegex = /^\/groups\/\d+\/discussion_topics\/\d+$/;
  if (!pathRegex.test(document.location.pathname)) {
    return;
  }
  if (
    typeof ENV === 'undefined' ||
    typeof ENV.DISCUSSION === 'undefined' ||
    typeof ENV.DISCUSSION.SEQUENCE === 'undefined'
  ) {
    return;
  }
  const courseId = ENV.DISCUSSION.SEQUENCE.COURSE_ID;
  const discussionId = ENV.DISCUSSION.SEQUENCE.ASSET_ID;
  addDiscussionLinks();
  addDiscussionTitle();

  function addDiscussionLinks() {
    if (config.switch_to_discussion) {
      const groupLinks = document.querySelectorAll(
        'div#sticky-container > ul > li a'
      );
      for (const link of groupLinks) {
        link.href = `${link.href}/discussion_topics?root_discussion_topic_id=${discussionId}`;
      }
    }
  }

  function addDiscussionTitle() {
    const infoElement = document.querySelector(
      'div.discussion-subtitle ~ span.discussion-subtitle'
    );
    if (!infoElement) {
      return;
    }
    infoElement.appendChild(document.createTextNode(' > '));
    const discussionLink = document.createElement('a');
    discussionLink.href = `/courses/${courseId}/discussion_topics/${discussionId}`;
    discussionLink.textContent = 'Discussion';
    infoElement.appendChild(discussionLink);
    if (config.show_names) {
      const options = {
        credentials: 'same-origin',
        headers: {
          accept: 'application/json',
        },
      };
      const url = `/api/v1/courses/${courseId}/discussion_topics/${discussionId}`;
      fetch(url, options)
        .then(res => res.json())
        .then(data => {
          discussionLink.textContent = data.title;
          return Promise.resolve();
        });
    }
  }
})();
