// ==UserScript==
// @name        Add All Questions
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Adds a link to add all questions when finding questions from a bank
// @include     https://*.instructure.com/courses/*/quizzes/*/edit
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  checkDialog();

  function addLink(dialog) {
    const insertionPoint = dialog.querySelector('.question_list_holder > ul.question_list.unstyled_list');
    const parent = insertionPoint.parentNode;
    const el = document.createElement('a');
    el.href = '#';
    el.textContent = 'Add All';
    el.addEventListener('click', loadAll);
    parent.insertBefore(document.createTextNode(' | '), insertionPoint);
    parent.insertBefore(el, insertionPoint);
  }

  function loadAll(mutations, observer) {
    const loader = document.querySelector('.question_list_holder > a.page_link');
    if (!loader || loader.classList.contains('loading')) {
      return;
    }
    if (loader.style.display !== 'none') {
      if (typeof observer === 'undefined') {
        const observer = new MutationObserver(loadAll);
        observer.observe(loader, {
          'attributes' : true
        });
      }
      loader.click();
    } else {
      if (typeof observer !== 'undefined') {
        observer.disconnect();
      }
      selectAll();
    }
  }

  function selectAll() {
    const items = document.querySelectorAll('.question_list_holder > ul.question_list li.found_question:not(.already_added):not(.blank) input[type=checkbox]');
    if (items) {
      items.forEach(function(el) {
        el.checked = true
      });
      const button = document.querySelector('.question_list_holder button.submit_button');
      if (button) {
        button.click();
      }
    }
  }

  function checkDialog(mutations, observer) {
    let dialog;
    dialog = document.getElementById('find_question_dialog');
    if (!dialog && typeof observer === 'undefined') {
      const obs = new MutationObserver(checkDialog);
      obs.observe(document.body, {
        'childList' : true
      });
    }
    if (dialog) {
      if (typeof observer !== 'undefined') {
        observer.disconnect();
      }
      addLink(dialog);
    }
  }
})();
