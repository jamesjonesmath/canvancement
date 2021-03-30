// ==UserScript==
// @name        QuizWiz
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Regrading and speed enhancements for Canvas quizzes
// @include     https://*.instructure.com/courses/*/gradebook/speed_grader?*
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @noframes
// @version     6
// @grant       none
// ==/UserScript==
(function() {
  'use strict';

  var config = {
    // Regrading methods may be 'disabled', 'enabled', or 'autorun'
    'methods' : {
      'unanswered' : 'disabled',
      'full_points' : 'disabled',
      'ma_allnone' : 'disabled',
      'ma_correct' : 'disabled',
      'ma_difference' : 'disabled',
      'fill_in_blanks' : 'disabled',
      'dropdowns' : 'disabled'
    },
    // Speed enhancements may be true or false
    'autoExpandComments' : false,
    'duplicateQuestionHeader' : false,
    'showButtonCounts' : true,
    'nextAfterUpdate' : false,
    'nextAfterComment' : false,
    'nextAfterRubric' : false,
    'nextRubricExpanded' : false
  };

  if (typeof QuizWiz !== 'function') {
    const script = document.createElement('script');
    script.src = 'https://canvancement.s3.us-east-2.amazonaws.com/qw-engine.min.js';
    script.onload = function() {
      QuizWiz(config);
    };
    document.head.appendChild(script);
  }
  else {
    QuizWiz(config);
  }

})();
