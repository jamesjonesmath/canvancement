// ==UserScript==
// @name        View All Grades for a Student
// @namespace   https://github.com/jamesjonesmath/canvancement
// @include     /^https://.*\.instructure\.com/?.*/users/[0-9]+$/
// @version     2
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var regex = new RegExp('/users/([0-9]+)$');
  var matches = regex.exec(document.location.pathname);
  if (matches && !document.getElementById('jj_allgrades')) {
    var parent = document.querySelector('aside#right-side > div');
    var anchor = document.createElement('a');
    var label = document.createTextNode(' View All Grades');
    anchor.id = 'jj_allgrades';
    anchor.classList.add('btn', 'button-sidebar-wide');
    anchor.href = '/users/' + matches[1] + '/grades';
    var icon = document.createElement('i');
    icon.classList.add('icon-gradebook');
    anchor.appendChild(icon);
    anchor.appendChild(label);
    parent.appendChild(anchor);
  }
})();
