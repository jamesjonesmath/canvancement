// ==UserScript==
// @name        Admin User Search Details
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Show the Login ID and SIS User Id for users from the Admin Search Page
// @include     /^https://.*\.instructure\.com/accounts/[0-9]+/users(\?|$)/
// @version     2
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var config = {
    'columns': [{
      'field': 'login_id'
    }, {
      'field': 'sis_user_id',
      'class': 'text-right'
    }]
  };
  var userRegex = new RegExp('/accounts/([0-9]+)/users/([0-9]+)');
  var userData = {};
  $('ul.users').wrap('<div class="item-group-condensed"></div>');
  $('ul.users').addClass('ig-list');
  $('ul.users li.user a').wrap('<div class="ig-row"><div class="ig-row__layout"></div></div>').addClass('ig-title ellipses');
  $('ul.users li.user a').each(function(i, e) {
    var match = userRegex.exec(e.href);
    if (match) {
      getUser(match[1], match[2]);
    }
  });

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
    var i,
      e,
      col;
    var details = $('<div>').addClass('ig-details');
    for (i = 0; i < config.columns.length; i++) {
      col = config.columns[i];
      if (typeof user[col.field] !== 'undefined' && user[col.field]) {
        e = $('<div>').addClass('ellipses').text(user[col.field]);
        if (typeof col.class !== 'undefined' && col.class) {
          e.addClass(col.class);
        }
        details.append(e);
      }
    }
    $('li#user_' + userId + '> div > div').append(details);
  }
})();
