// ==UserScript==
// @name        Sort a Rubric
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description This program allows the user to sort rubric criteria
// @include     https://*.instructure.com/courses/*/rubrics/*
// @version     3
// @grant       none
// ==/UserScript==
(function() {
  'use strict';

  const pageRegex = new RegExp('^/courses/[0-9]+/rubrics/[0-9]+');
  if (!pageRegex.test(window.location.pathname)) {
    return;
  }

  waitForEdit();

  function waitForEdit(mutations, observer) {
    const parent = document.getElementById('rubrics');
    const el = parent.querySelector('.rubric_container.rubric.editing');
    if (!el) {
      if (typeof observer === 'undefined') {
        const obs = new MutationObserver(waitForEdit);
        obs.observe(parent, {
          'childList' : true
        });
      }
      return;
    } else {
      if (typeof observer !== 'undefined') {
        observer.disconnect();
      }
      attachRowSorter();
    }
  }

  function attachRowSorter() {
    $('.rubric_container.rubric.editing .rubric_table tbody').sortable({
      axis : 'y',
      containment : 'parent',
      items : '> tr'
    });
  }

})();
