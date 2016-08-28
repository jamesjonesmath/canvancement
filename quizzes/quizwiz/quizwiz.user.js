// ==UserScript==
// @name        QuizWiz
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Regrading and speed enhancements for Canvas quizzes
// @include     https://*.instructure.com/courses/*/quizzes/*/history?*
// @version     1
// @grant       none
// ==/UserScript==
requirejs([ 'https://cdn.rawgit.com/jamesjonesmath/canvancement/master/quizzes/quizwiz/quizwiz-engine.js' ], function(QuizWiz) {
  'use strict';

  // Edit this configuration to match your desired features
  var config = {
    'methods' : {
      'unanswered' : true,
      'full_points' : false,
      'ma_allnone' : false,
      'ma_correct' : false,
      'ma_difference' : false,
      'ma_canvas' : false,
      'fill_in_blanks' : false,
      'dropdowns' : false,
    },
    'autoRun' : [
    // 'unanswered',
    // 'full_points',
    ],
    'autoExpandComments' : true,
    'duplicateQuestionHeader' : true,
    'showButtonCounts' : true
  };

  // Notes

  // Only one of the ma_* methods may be chosen as they conflict with each other
  // If you choose more than one, it will use the first one selected

  // See the Canvancement site for instructions on configuring this script
  // https://github.com/jamesjonesmath/canvancement/tree/master/quizzes/quizwiz

  QuizWiz(config);
});
