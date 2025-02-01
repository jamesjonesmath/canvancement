// ==UserScript==
// @name        Canvas CSS Tweaks
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Various tweaks to Canvas CSS
// @match       https://*.instructure.com/courses/*
// @match       https://*.instructure.com/accounts/*
// @version     9
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
    'sg_avatar_zoom', // zoom user avatar in SpeedGrader
    'sg_long_descriptions', // hide long descriptions in SpeedGrader rubrics
    // 'sg_points_possible', // hide criterion points possible in SpeedGrader rubrics
    'sg_criteria_comments', // hide criteria comments
    //'no_test' , // hide test instance notification in test and beta
    'hide_unused_course_navigation', // see forcedNavigationItems below
    'hide_urls', // Do not print links
    'roster_user_width', // Remove forced 100% width on roster user name,
    'disc_split_panel_position', // Fix discussion split panel right panel scrolling
  ];

  // Canvas forces some navigation items even though you have them disabled.
  // Items listed here will be hidden when they are disabled.
  const forcedNavigationItems = [
    'announcements',
    'collaborations',
    'conferences',
    'outcomes',
    // 'files',
    // 'rubrics',
    // 'pages',
  ];

  const rules = [];

  // Allow Canvas to use the full width of the page
  if (
    features.includes('fullscreen') &&
    !document.body.classList.contains('full-width') &&
    !document.body.classList.contains('outcomes')
  ) {
    rules.push(
      'body:not(.full-width):not(.outcomes) #wrapper.ic-Layout-wrapper {max-width:none;}'
    );
  }

  // Override the min-width=60rem; that Canvas has on rubrics in speedgrader
  if (features.includes('sg_rubrics') && isSpeedGrader()) {
    rules.push(
      '#rubric_holder .rubric_container.rubric.assessing .react-rubric {min-width:min-content!important;}'
    );
    rules.push(
      '#rubric_holder .rubric_container.rubric.assessing .react-rubric table {table-layout:auto;}'
    );
  }

  // Remove the long descriptions for rubrics and show only the titles
  if (features.includes('sg_long_descriptions') && isSpeedGrader()) {
    rules.push('#rubric_holder .rating-description+span {display:none;}');
    rules.push('#rubric_holder .rating-footer {display:none;}');
  }

  // Hide the points possible for each criterion in SpeedGrader
  if (features.includes('sg_points_possible') && isSpeedGrader()) {
    rules.push(
      '#rubric_holder td[data-testid="criterion-points"] .graded-points > span > span + span {display:none;}'
    );
  }

  // Hide the individual criterion comments
  if (features.includes('sg_criteria_comments') && isSpeedGrader()) {
    rules.push(
      '#rubric_holder td[data-testid="criterion-points"] > div > button {display:none;}'
    );
  }

  // Zoom user's avatar in SpeedGrader upon mouseover
  if (features.includes('sg_avatar_zoom') && isSpeedGrader()) {
    rules.push('.gradebookAvatar:hover {transform: scale(2);}');
  }

  // Disable the test and beta instance banner at the bottom
  if (
    features.includes('no_test') &&
    document.querySelector('#fixed_bottom .fixed_warning')
  ) {
    rules.push('#fixed_bottom .fixed_warning {display:none;}');
  }

  // Hide the unused course navigation links that Canvas forces on you but you know you won't use
  if (
    features.includes('hide_unused_course_navigation') &&
    /^\/courses\/\d+/.test(window.location.pathname) &&
    !document.body.classList.contains('full-width')
  ) {
    const items = document.querySelectorAll(
      'ul#section-tabs li.section.section-hidden'
    );
    items.forEach(e => {
      const classes = e.querySelector('a').classList;
      const matching = forcedNavigationItems.filter(c => classes.contains(c));
      if (matching.length > 0) {
        e.style.display = 'none';
      }
    });
  }

  // Hide URLs when printing
  if (features.includes('hide_urls')) {
    rules.push('@media print {a:link:after, a:visited:after {content:none;}}');
  }

  // Remove the roster user width
  if (
    features.includes('roster_user_width') &&
    /^\/courses\/\d+\/users\/?$/.test(window.location.pathname)
  ) {
    rules.push('td.roster_user_name-cell {width:inherit;}');
  }

  // Fix the positioning on the split discussion panel
  if (
    features.includes('disc_split_panel_position') &&
    /^\/courses\/\d+\/discussion_topics\/\d+$/.test(window.location.pathname)
  ) {
    rules.push(
      'div.discussion-redesign-layout div#DrawerLayoutTray {position:fixed;}'
    );
  }

  if (rules.length > 0) {
    const style = document.createElement('style');
    document.head.appendChild(style);
    const sheet = style.sheet;
    let i = 0;
    for (const rule of rules) {
      sheet.insertRule(rule, i);
      i++;
    }
  }

  function isSpeedGrader() {
    return /^\/courses\/\d+\/gradebook\/speed_grader$/.test(
      window.location.pathname
    );
  }
})();
