// ==UserScript==
// @name        Duplicate Question Header
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Duplicates the speedgrader quiz question headers at the bottom.
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @version     1
// @grant none
// ==/UserScript==
(function() {
  'use strict';
  try {
    if (/^\/courses\/[0-9]+\/quizzes\/[0-9]+\/history$/.test(window.location.pathname)) {
      var nodes = document.querySelectorAll('div#questions > div.question_holder > div.display_question > div.header');
      for (var i = 0; i < nodes.length; i++) {
        var original = nodes[i];
        var parent = original.parentNode;
        var commentNode;
        for (var j = parent.children.length - 1; j >= 0; j--) {
          if (parent.children[j].classList.contains('quiz_comment')) {
            commentNode = parent.children[j + 1];
          }
        }
        if (typeof commentNode === 'undefined') {
          // Unable to find the quiz_comment class, so don't know where to stick
          // the duplicated header.
          continue;
        }
        var duplicate = original.cloneNode(true);
        duplicate.style.borderTop = '1px solid #AAA';
        duplicate.style.borderBottom = 'none';
        var userPoints = duplicate.querySelector('div.user_points');
        userPoints.removeAttribute('class');
        var input = userPoints.querySelector('input.question_input');
        var originalInput = original.querySelector('div.user_points > input.question_input');
        input.addEventListener('change', userPointsUpdate, false);
        originalInput.addEventListener('change', userPointsUpdate, false);
        parent.insertBefore(duplicate, commentNode);
      }
    }
  } catch (e) {
    console.log(e);
  }
  function userPointsUpdate(e) {
    var name = e.target.name;
    var value = e.target.value;
    var parent = e.target.parentNode;
    var isPrimary = parent.classList.contains('user_points');
    if (isPrimary) {
      // This is a change to the primary value.
      // Change secondaries but don't propagate events
      var dsts = document.querySelectorAll('div.header div:not(.user_points) > input.question_input[name="' + name + '"]');
      for (var i = 0; i < dsts.length; i++) {
        if (dsts[i].value !== value) {
          dsts[i].value = value;
        }
      }
    } else {
      // This is a change to the secondary point.
      // Update the main one and trigger its events
      var dst = document.querySelector('div.header div.user_points > input.question_input[name="' + name + '"]');
      if (dst.value !== value) {
        dst.value = value;
        dst.dispatchEvent(new Event('change', {
          'bubbling' : false
        }));
      }
    }
  }
})();
