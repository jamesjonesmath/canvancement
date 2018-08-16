// ==UserScript==
// @name         Admin Course Links
// @namespace    https://github.com/jamesjonesmath/canvancement
// @description  Add links directly into the course from the admin course search
// @include      /^https://.*\.instructure\.com/accounts/[0-9]+(\?.*)*$/
// @version      1
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  var linksToAdd = {
    'users' : 'People',
    'grades' : 'Grades',
    'settings' : 'Settings',
  // 'analytics' : 'Analytics',
  // 'announcements' : 'Announcements',
  // 'assignments' : 'Assignments',
  // 'discussion_topics' : 'Discussions',
  // 'files' : 'Files',
  // 'modules' : 'Modules',
  // 'outcomes' : 'Outcomes',
  // 'pages' : 'Pages',
  // 'quizzes' : 'Quizzes',
  // 'assignments/syllabus' : 'Syllabus',
  };

  // This lets the system know that it is processing information
  var wrapperClass = 'jj_course_links';

  // This can be commented out if you want to supply external CSS
  var wrapperCSS = {
    'ul' : 'list-style: none; font-size: 0.8rem; margin-left: 0;',
    'ul li' : 'display: inline;',
    'ul li:not(:first-child):before' : 'content: " | "',
    'ul li a' : 'color: #999;'
  };

  var pageRegex = new RegExp('^/accounts/\\d+$');

  if (pageRegex.test(window.location.pathname) && Object.keys(linksToAdd).length > 0) {
    addCSS(wrapperCSS);
    addMutationObserver();
    checkCourses();
  }

  function addMutationObserver() {
    var el = document.getElementById('content');
    var observer = new MutationObserver(checkCourses);
    observer.observe(el, {
      'childList' : true,
      'subtree' : true
    });
  }

  function checkCourses() {
    var sel1 = 'tbody[data-automation="courses list"] tr td:nth-child(2) > a';
    var sel2 = sel1 + ' + .' + wrapperClass;
    var el1 = document.querySelectorAll(sel1);
    var el2 = document.querySelectorAll(sel2);
    var child, parent;
    if (el1.length > el2.length) {
      for (var i = 0; i < el1.length; i++) {
        if (!el1[i].querySelector('.' + wrapperClass)) {
          child = buildLinks(el1[i].href);
          parent = el1[i].parentNode;
          if (parent && child) {
            parent.appendChild(child);
          }
        }
      }
    }
  }

  function buildLinks(base) {
    var div = document.createElement('div');
    div.classList.add(wrapperClass);
    var ul = document.createElement('ul');
    var item, a, key;
    var keys = Object.keys(linksToAdd);
    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      item = document.createElement('li');
      a = document.createElement('a');
      a.href = base + '/' + key;
      a.textContent = linksToAdd[key];
      item.appendChild(a);
      ul.appendChild(item);
    }
    div.append(ul);
    return div;
  }

  function addCSS(styles) {
    if (typeof styles !== 'undefined' && Object.keys(styles).length > 0) {
      var key, selector, rule;
      var style = document.createElement('style');
      document.head.appendChild(style);
      var sheet = style.sheet;
      var keys = Object.keys(styles);
      for (var i = 0; i < keys.length; i++) {
        key = keys[i];
        selector = '.' + wrapperClass + ' ' + key;
        rule = ' {' + styles[key] + '}';
        sheet.insertRule(selector + rule, sheet.cssRules.length);
      }
    }
  }
})();
