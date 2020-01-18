// ==UserScript==
// @name         Add Color Course Border
// @namespace    https://github.com/jamesjonesmath/canvancement
// @description  Add a border to the course that matches the dashboard and calendar color
// @match        https://*.instructure.com/courses/*
// @version      1
// @grant        none
// ==/UserScript==
(function() {
  'use strict';
  const courseRegex = new RegExp('^/courses/([0-9]+)');
  const courseMatches = courseRegex.exec(document.location.pathname);
  if (!courseMatches) {
    return;
  }
  const contextId = 'course_' + courseMatches[1];
  fetch('/api/v1/users/self/colors', {
      'headers': {
        'accept': 'application/json'
      },
      'credentials': 'same-origin'
    })
    .then(response => response.json())
    .then(json => {
      if (typeof json.custom_colors[contextId] === 'string') {
        document.getElementById('wrapper').style.border = 'thick solid ' + json.custom_colors[contextId];
      }
    });
})();
