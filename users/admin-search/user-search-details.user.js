// ==UserScript==
// @name        Admin User Search Details
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Show the Login ID and SIS User Id for users from the Admin Search Page
// @include     /^https://.*\.instructure\.com/accounts/[0-9]+/users(\?|$)/
// @version     3
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var config = {
    'columns' : [ {
      'field' : 'login_id',
      'name' : 'Login'
    }, {
      'field' : 'sis_user_id',
      'name' : 'SIS ID'
    } ],
    'features' : [ 'masquerade' ]
  };
  var userRegex = new RegExp('/accounts/([0-9]+)/users/([0-9]+)');
  var userData = {};

  try {
    var nodes = document.querySelectorAll('ul.users li.user');
    if (nodes.length === 0) {
      return;
    }
    document.querySelector('ul.users').classList.add('ig-list');
    for (var k = 0; k < nodes.length; k++) {
      var e = nodes[k].querySelector('a');
      var match = userRegex.exec(e.href);
      if (!match) {
        continue;
      }
      var accountId = match[1];
      var userId = match[2];
      e.classList.add('ig-title');
      var row = document.createElement('div');
      row.classList.add('ig-row');
      var layout = document.createElement('div');
      layout.classList.add('ig-row__layout');
      var info = document.createElement('div');
      info.classList.add('ig-info');
      info.appendChild(e);
      var details = document.createElement('div');
      details.classList.add('ig-details');
      info.appendChild(details);
      layout.appendChild(info);
      if (typeof config.features !== 'undefined' && config.features.indexOf('masquerade') > -1) {
        var admin = document.createElement('div');
        admin.classList.add('ig-admin');
        var link = document.createElement('a');
        link.href = '/?become_user_id=' + userId;
        link.textContent = 'Become';
        link.title = 'Masquerade as ' + e.textContent;
        admin.appendChild(link);
        layout.appendChild(admin);
      }
      row.appendChild(layout);
      nodes[k].appendChild(row);
      getUser(accountId, userId);
    }
  } catch (e) {
    console.log(e);
  }

  function getUser(accountId, userId) {
    var url = '/api/v1/users/' + userId;
    $.getJSON(url, function(data, status, jqXHR) {
      var userId = data.id;
      userData[userId] = data;
      updateInfo(data);
    });
  }

  function updateInfo(user) {
    var userId = user.id;
    var info = [];
    var i, e, col;
    var node = document.querySelector('li#user_' + userId + ' div.ig-details');
    if (!node) {
      return;
    }
    for (i = 0; i < config.columns.length; i++) {
      col = config.columns[i];
      if (typeof user[col.field] !== 'undefined' && user[col.field]) {
        var item = document.createElement('div');
        item.classList.add('ig-details__item');
        item.textContent = col.name + ': ' + user[col.field];
        node.appendChild(item);
      }
    }
    if (typeof config.features !== 'undefined' && config.features.indexOf('masquerade') > -1) {
      if (typeof user.short_name !== 'undefined' && user.short_name) {
        var link = node.parentNode.parentNode.querySelector('div.ig-admin a[href^="/?become_user_id"]');
        if (link) {
          link.title = 'Masquerade as ' + user.short_name;
        }
      }
    }
  }
})();
