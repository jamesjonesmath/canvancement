// ==UserScript==
// @name        Needs Grading Count
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Show the actual number of assignments needing graded instead of 9+
// @include     /^https://.*\.instructure\.com/(courses/[0-9]+)?$/
// @version     1
// @grant       none
// ==/UserScript==
(function () {
  'use strict';
  var observer;
  if ($('ul.right-side-list.to-do-list li.todo').length > 0) {
    process();
  } 
  else {
     observer = new MutationObserver(function (mutations) {
      var isLoaded = false;
      mutations.forEach(function (mutation) {
        if (mutation.type == 'childList' && mutation.addedNodes.length > 0) {
          for (var j = 0, l = mutation.addedNodes.length; j < l; j++) {
            if (mutation.addedNodes[j].nodeType === 1 && mutation.addedNodes[j].classList.contains('to-do-list')) {
              isLoaded = true;
              break;
            }
          }
        }
      });
      if (isLoaded) {
        process();
      }
    });
    var config = {
      'childList': true,
      'subtree': true
    };
    var target = document.getElementById('right-side-wrapper');
    observer.observe(target, config);
  }
  function process() {
    if (typeof observer == 'object') {
      observer.disconnect();
    }
    var urlRegex = new RegExp('^/courses/([0-9]+)/.*assignment_id=([0-9]+)');
    var elements = $('ul.right-side-list.to-do-list li.todo').each(function (i, e) {
      if ($('div.todo-badge span:contains("9+")', e).length > 0) {
        var href = $('a', this).first().attr('href');
        var matches = urlRegex.exec(href);
        if (matches) {
          var courseId = matches[1];
          var assignmentId = matches[2];
          fetch_assignment(courseId, assignmentId, e);
        }
      }
    });
  }
  function fetch_assignment(courseId, assignmentId, element) {
    var url = '/api/v1/courses/' + courseId + '/assignments/' + assignmentId;
    $.getJSON(url, function (data, status, jqXHR) {
      $('div.todo-badge span:contains("9+")', element).html(data.needs_grading_count);
    });
  }
}) ();
