// ==UserScript==
// @name        All Courses Sort
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Allows sorting on any column of the All Courses list
// @include     https://*.instructure.com/courses
// @require     https://cdn.jsdelivr.net/npm/tablesorter@2.31.1/dist/js/jquery.tablesorter.combined.min.js
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  if (/^\/courses\/?$/.test(window.location.pathname)) {
    const head = document.querySelector('head');
    if (head) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'https://cdn.jsdelivr.net/npm/tablesorter@2.31.1/dist/css/theme.default.min.css';
      head.appendChild(link);
    }
    document.querySelectorAll('table.ic-Table th.course-list-star-column').forEach(function(e) {
      e.classList.add('filter-false');
    });
    $('table.ic-Table').tablesorter({
      'widgets' : [ 'filter' ]
    });
  }
})();
