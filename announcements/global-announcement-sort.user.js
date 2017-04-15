// ==UserScript==
// @name        Global Announcement Sort
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Sort announcements from newest to oldest
// @include     https://*.instructure.com/accounts/*/settings
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  if (window !== window.top) {
    // Don't run in an iframe (RCE)
    return;
  }
  try {
    var tab = document.getElementById('tab-announcements');
    var list = tab.querySelector('ul.announcements_list');
    var items = list.querySelectorAll('li.announcements_list_item');
    if (items.length > 1) {
      var k = items.length - 1;
      while (k-- > 0) {
        list.appendChild(items[k]);
      }
    }
    var button = document.getElementById('add_announcement_button');
    var form = document.getElementById('add_notification_form');
    tab.insertBefore(button, list);
    tab.insertBefore(form, list);
  } catch (e) {
    console.log(e);
  }
})();
