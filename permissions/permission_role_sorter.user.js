// ==UserScript==
// @name        Permission Page Role Sorter
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Moves role to beginning of list
// @include     https://*.instructure.com/accounts/*/permissions
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var checkPathRegex = new RegExp('/accounts/[0-9]+/permissions/?$');
  if (!checkPathRegex.test(window.location.pathname)) {
    return;
  }

  checkForTabs();

  function checkForTabs() {
    try {
      var tab = document.getElementById('course-roles-tab');
      if (tab) {
        addListener();
      } else {
        var el = document.getElementById('content');
        var observer = new MutationObserver(function() {
          var tab = document.getElementById('course-roles-tab');
          if (tab) {
            addListener();
            observer.disconnect();
          }
        });
        observer.observe(el, {
          'childList' : true,
          'subtree' : true
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  function addListener() {
    var tabs = document.querySelectorAll('table.roles_table thead tr');
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', checkClick);
    }
  }

  function checkClick(el) {
    var col = 0;
    try {
      var matchOn = [ 'em', 'th' ];
      var elem = el.target;
      if (matchOn.indexOf(elem.tagName.toLowerCase()) > -1) {
        var parent = elem.parentNode;
        while (parent && parent.tagName.toLowerCase() !== 'tr') {
          elem = parent;
          parent = elem.parentNode;
        }
        if (parent) {
          for (var i = 0; i < parent.children.length; i++) {
            if (parent.children[i] === elem) {
              col = i;
              break;
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
    if (col > 1) {
      moveIt(col);
    }
  }

  function moveIt(col) {
    try {
      var rows = document
          .querySelectorAll('div#role_tabs div.role-tab[aria-hidden="false"] table.roles_table tr:not(.toolbar)');
      if (rows.length && col > 1) {
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i];
          if (row.children.length > 3 && row.children.length > col) {
            row.insertBefore(row.children[col], row.children[1]);
          }
        }
      }
    } catch (e) {
      console.log(e);
    }

  }
})();
