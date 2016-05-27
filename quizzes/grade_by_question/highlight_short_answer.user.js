// ==UserScript==
// @name        Highlight Short Answer
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Highlights fill in the blank questions that are not correct in the one-at-a-time navigation links
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @version     1
// @grant none
// ==/UserScript==
(function() {
  'use strict';
  if (/^\/courses\/[0-9]+\/quizzes\/[0-9]+\/history$/.test(window.location.pathname)) {
    // Change your colors here. You can also use names like 'white' and 'black'
    var backgroundColor = '#900';
    var foregroundColor = '#eee';
    highlightWrong(backgroundColor, foregroundColor);
  }
  function highlightWrong(bgColor, fgColor) {
    var checkQuestionTypes = [ 'short_answer_question', 'fill_in_multiple_blanks_question' ];
    try {
      var nList = document.querySelectorAll('div#quiz-nav-inner-wrapper ul li');
      console.log(nList);
      if (nList.length === 0) {
        return;
      }
      var qList = document.querySelectorAll('div#questions div.question.display_question');
      var qRegex = new RegExp('^question_([0-9]+)$');
      for (var i = 0; i < qList.length; i++) {
        var match = qRegex.exec(qList[i].id);
        if (match) {
          if (qList[i].classList.contains('correct')) {
            continue;
          }
          var questionId = match[1];
          var navItem = document.getElementById('quiz_nav_' + questionId);
          if (navItem) {
            var process = false;
            for (var j = 0; j < checkQuestionTypes.length; j++) {
              if (qList[i].classList.contains(checkQuestionTypes[j])) {
                process = true;
                break;
              }
            }
            if (process) {
              var nItem = navItem.querySelector('a.question-nav-link');
              nItem.style.backgroundColor = (typeof bgColor === 'undefined') ? 'black' : bgColor;
              nItem.style.color = (typeof fgColor === 'undefined') ? 'white' : fgColor;
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
})();
