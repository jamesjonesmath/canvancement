// ==UserScript==
// @name        QuizWhiz
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Regrading and speed enhancements for Canvas quizzes
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @version     1
// @grant       none
// ==/UserScript==
requirejs(['https://raw.githubusercontent.com/jamesjonesmath/canvancement/master/quizzes/quizwhiz/quizwhiz-engine.js'], function(QuizWhiz) {
  'use strict';

  var config = {
    'autoExpandComments': true,
    'duplicateQuestionHeader': true,
    'showButtonCounts': true,
    'methods': {
      'unanswered': true,
      'full_points': false,
      'ma_allnone': false,
      'ma_correct': true,
      'ma_difference': false,
      'ma_canvas' : false,
      'fill_in_blanks': false,
      'dropdowns': false,
    },
    'autoRun': [
      // 'unanswered',
      // 'full_points'
    ]
  };

  QuizWhiz(config);
});
