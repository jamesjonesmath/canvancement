// ==UserScript==
// @name        Canvas CSS Tweaks
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Various tweaks to Canvas CSS
// @match       https://*.instructure.com/courses/*
// @match       https://*.instructure.com/accounts/*
// @version     4
// ==/UserScript==
(function () {
  'use strict';

  // Only run in parent window, do not run in iframes
  if (window !== parent.window) {
    return;
  }

  // Select the features to enable. Comment out or delete any you do not want
  const features = [
    'fullscreen', // use full width of page
    'sg_rubrics', // don't make rubrics so big in speedgrader
    // 'no_test' , // hide test instance notification in test and beta
    'sg_avatar_zoom', // zoom avatar in Speed Grader
  ];

  const rules = [];

  // Allow Canvas to use the full width of the page
  if (features.indexOf('fullscreen') > -1) {
    if (!document.body.classList.contains('full-width') && !document.body.classList.contains('outcomes')) {
      rules.push('body:not(.full-width):not(.outcomes) #wrapper.ic-Layout-wrapper {max-width:none;}');
    }
  }

  // Override the min-width=60rem; that Canvas has on rubrics in speedgrader
  if (features.indexOf('sg_rubrics') > -1) {
    if (/^\/courses\/\d+\/gradebook\/speed_grader$/.test(window.location.pathname)) {
      rules.push('#rubric_holder .rubric_container.rubric.assessing .react-rubric {min-width: min-content !important;}');
      rules.push('#rubric_holder .rubric_container.rubric.assessing .react-rubric table {table-layout: auto;}');
    }
  }

  // Disable the test and beta instance banner at the bottom
  if (features.indexOf('no_test') > -1) {
    if (document.querySelector('#fixed_bottom .fixed_warning')) {
      rules.push('#fixed_bottom .fixed_warning {display: none;}');
    }
  }

  // Zoom avatar in SpeedGrader
  if (features.indexOf('sg_avatar_zoom') > -1) {
    if (/^\/courses\/\d+\/gradebook\/speed_grader$/.test(window.location.pathname)) {
      rules.push('.gradebookAvatar:hover {transform: scale(2);}');
    }
  }

  if (rules.length) {
    const style = document.createElement('style');
    document.head.appendChild(style);
    const sheet = style.sheet;
    for (let i = 0; i < rules.length; i++) {
      sheet.insertRule(rules[i],i);
    }
  }
}) ();
