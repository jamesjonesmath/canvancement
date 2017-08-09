// ==UserScript==
// @name        Remove Text Questions
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Remove text-only questions from Speedgrader's grade one question at a time navigation links
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @version     1
// @grant none
// ==/UserScript==
(function () {
  'use strict';
  if (/^\/courses\/[0-9]+\/quizzes\/[0-9]+\/history$/.test(window.location.pathname)) {
    renumberList();
  }
  function renumberList() {
    try {
      var nList = document.querySelectorAll('div#quiz-nav-inner-wrapper ul li');
      if (nList.length == 0) {
        return;
      }
      var qList = document.querySelectorAll('div#questions div.question.display_question');
      var qRegex = new RegExp('^question_([0-9]+)$');
      var questionId;
      var i;
      var n;
      var match;
      var nItem;
      n = 0;
      for (i = 0; i < qList.length; i++) {
        match = qRegex.exec(qList[i].id);
        if (match) {
          questionId = match[1];
          if (nList[i].id === 'quiz_nav_' + questionId) {
            if (qList[i].classList.contains('text_only_question')) {
              nList[i].style.display = 'none';
            } 
            else {
              n++;
              nItem = nList[i].querySelector('a.question-nav-link');
              if (nItem.textContent !== n) {
                nItem.textContent = n;
              }
            }
          }
        }
      }
    } 
    catch (e) {
      console.log(e);
    }
  }
}) ();
