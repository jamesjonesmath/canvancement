// ==UserScript==
// @name        AutoExpand Comments
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Auto expands the comment boxes when there is content in them.
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @version     1
// @grant none
// ==/UserScript==
(function() {
  'use strict';
  try {
    if (/^\/courses\/[0-9]+\/quizzes\/[0-9]+\/history$/.test(window.location.pathname)) {
      var nodes = document.querySelectorAll('div#questions > div.question_holder > div.display_question > div.quiz_comment');
      console.log(nodes);
      for (var i = 0; i < nodes.length; i++) {
        var t = nodes[i].querySelector('textarea');
        if (t.value.length > 0) {
          expandComment(t, true);
        }
        t.addEventListener('input', watchComment, false);
      }
    }
  } catch (e) {
    console.log(e);
  }
  function watchComment(e) {
    if (e.target.value.length === 0) {
      expandComment(e.target, false);
    } else if (e.target.value.length === 1) {
      expandComment(e.target, true);
    }
  }
  function expandComment(e, expand) {
    var divElement = e.parentNode;
    if (expand) {
      divElement.style.display = 'block';
      e.style.width = '98%';
    } else {
      divElement.style.display = 'inline-block';
      e.style.width = 'auto';
    }
  }
})();
