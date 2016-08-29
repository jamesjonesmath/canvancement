// ==UserScript==
// @name        Deselect Front Page
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Allows you to deselect a front page
// @include     https://*.instructure.com/courses/*/pages/*
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  try {
    if (typeof ENV.WIKI_PAGE.front_page === 'undefined' || !ENV.WIKI_PAGE.front_page) {
      // This isn't the front page
      return;
    }
    if (typeof ENV.WIKI_RIGHTS.manage === 'undefined' || !ENV.WIKI_RIGHTS.manage) {
      // This user cannot manage the page
      return;
    } // Wait for page to display

    var checkElement = '#wiki_page_show div.inline-block > a.btn.al-trigger';
    var el = document.querySelector(checkElement);
    if (el) {
      addDeselect();
    } else {
      var src = document.getElementById('wiki_page_show');
      var observer = new MutationObserver(function() {
        this.disconnect();
        var el = document.querySelector(checkElement);
        if (el) {
          addDeselect();
        }
      });
      observer.observe(src, {
        'childList' : true
      });
    }
  } catch (e) {
    console.log(e);
  }
  function addDeselect() {
    var el = document.querySelector(checkElement);
    if (!el) {
      return;
    }
    var list = el.parentNode.querySelector('ul.al-options');
    if (list) {
      var item = document.createElement('li');
      item.classList.add('ui-menu-item');
      var link = document.createElement('a');
      link.classList.add('icon-home');
      link.textContent = 'Deselect Front Page';
      link.addEventListener('click', deselect, false);
      item.appendChild(link);
      list.appendChild(item);
    }
  }
  function deselect() {
    var regex = new RegExp('/courses/');
    var url = window.location.href.replace(regex, '/api/v1/courses/');
    if (!url) {
      return;
    }
    var csrf;
    var csrfregex = new RegExp('^_csrf_token=(.*)$');
    var parms = {
      'wiki_page' : {
        'front_page' : false
      }
    };
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();
      var match = csrfregex.exec(cookie);
      if (match) {
        csrf = decodeURIComponent(match[1]);
        break;
      }
    }
    if (!csrf) {
      console.log('Cannot find csrf token');
      return;
    }
    var jparm = JSON.stringify(parms);
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', finished);
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-CSRF-Token', csrf);
    xhr.send(jparm);
  }
  function finished() {
    var el = document.querySelector('div.header-bar-right > span.front-page.label');
    if (el) {
      el.parentNode.removeChild(el);
    }
  }
})();
