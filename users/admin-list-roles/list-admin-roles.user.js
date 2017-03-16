// ==UserScript==
// @name        List Admin Roles
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Generates a .CSV download of the admins and their roles in an account
// @include     /^https://.*\.instructure\.com/accounts/[0-9]+$/
// @require     https://github.com/eligrey/FileSaver.js/raw/master/FileSaver.js
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  
  var locationRegex = new RegExp('^/accounts/[0-9]+$');
  if (locationRegex.test(window.location.pathname)) {
    addAdminListReportButton();
  }

  // Define the order and location of the fields that you want in the
  // spreadsheet. Each src refers to a particular object and field
  // Here are the possible sources
  // a: account information
  // r: role information
  // u: user information
  var reportFields = [ {
    'name' : 'Account',
    'src' : 'a.name'
  }, {
    'name' : 'Name',
    'src' : 'u.name'
  }, {
    'name' : 'Role',
    'src' : 'r.label'
  }, {
    'name' : 'Login',
    'src' : 'u.login_id'
  }, {
    'name' : 'Sortable_Name',
    'src' : 'u.sortable_name'
  }, {
    'name' : 'Account_ID',
    'src' : 'a.id'
  }, {
    'name' : 'User_ID',
    'src' : 'u.id'
  }, {
    'name' : 'Role_ID',
    'src' : 'r.id'
  }, {
    'name' : 'SIS_User',
    'src' : 'u.sis_user_id'
  }, {
    'name' : 'SIS_Login',
    'src' : 'u.sis_login_id'
  }, {
    'name' : 'SIS_Account',
    'src' : 'a.sis_account_id'
  }, {
    'name' : 'Parent_ID',
    'src' : 'a.parent_account_id'
  } ];

  var roles, rootAccount, rootUsers, subAccounts;

  function adminListReport() {
    var accountId = getAccountId();
    roles = new GetData('/api/v1/accounts/' + accountId + '/roles', checkData, {
      'filter' : validateRole,
      'data' : {
        'show_inherited' : true
      }
    });
    rootAccount = new GetData('/api/v1/accounts/' + accountId, checkData, {
      'filter' : validateWorkflow
    });
    rootUsers = new GetData('/api/v1/accounts/' + accountId + '/admins', checkData);
    subAccounts = new GetData('/api/v1/accounts/' + accountId + '/sub_accounts', loadSubAccountAdmins, {
      'filter' : validateWorkflow,
      'data' : {
        'recursive' : true
      },
      'deferReady' : true
    });
  }

  function checkData() {
    var loaded = true;
    var waitFor = [ roles, rootAccount, rootUsers, subAccounts ];
    var i = 0;
    while (loaded && i < waitFor.length) {
      if (typeof waitFor[i] === 'undefined' || !waitFor[i].isReady) {
        loaded = false;
      }
      i++;
    }
    if (loaded) {
      compileList();
    }
  }

  function compileList() {
    var roleHash = {};
    roles.data.map(function(role) {
      roleHash[role.id] = role;
    });
    var accountHash = {};
    accountHash[rootAccount.data.id] = {
      'account' : rootAccount.data,
      'users' : rootUsers.data
    };
    subAccounts.data.map(function(subAccount) {
      var users = subAccount.users.data;
      delete subAccount.users;
      accountHash[subAccount.id] = {
        'account' : subAccount,
        'users' : users
      };
    });
    var data = createDataTable(accountHash, roleHash, rootAccount.data.id);
    if (data.length > 0) {
      makeReport(data);
    } else {
      console.log('NO DATA');
    }
  }

  function getSisTypes(accounts) {
    var sisTypes = {
      'account' : false,
      'login' : false,
      'user' : false
    };
    var accountIds = Object.keys(accounts);
    var sisTypeKeys = Object.keys(sisTypes);
    var i = 0;
    var doneChecking = false;
    while (!doneChecking && i < accountIds.length) {
      var account = accounts[accountIds[i]];
      i++;
      if (typeof account.account.sis_account_id !== 'undefined' && account.account.sis_account_id) {
        sisTypes.account = true;
      }
      if (account.users.length > 0) {
        for (var j = 0; j < account.users.length; j++) {
          if (typeof account.users[j].user.sis_user_id !== 'undefined' && account.users[j].user.sis_user_id) {
            sisTypes.user = true;
          }
          if (typeof account.users[j].user.sis_login_id !== 'undefined' && account.users[j].user.sis_login_id) {
            sisTypes.login = true;
          }
        }
      }
      doneChecking = true;
      var k = 0;
      while (doneChecking && k < sisTypeKeys.length) {
        if (!sisTypes[sisTypeKeys[k]]) {
          doneChecking = false;
        }
        k++;
      }
    }
    return sisTypes;
  }

  function loadSubAccountAdmins() {
    if (subAccounts.data.length > 0) {
      // We have subaccounts. Loop through them and get the admin data
      for (var j = 0; j < subAccounts.data.length; j++) {
        var subAccount = subAccounts.data[j];
        subAccounts.data[j].users = new GetData('/api/v1/accounts/' + subAccount.id + '/admins', checkSubAccounts);
      }
    } else {
      subAccounts.isReady = true;
      checkData();
    }
  }

  function checkSubAccounts() {
    var loaded = true;
    var i = 0;
    while (loaded && i < subAccounts.data.length) {
      if (!subAccounts.data[i++].users.isReady) {
        loaded = false;
      }
    }
    if (loaded) {
      subAccounts.isReady = true;
      checkData();
    }
  }

  function validateRole(role) {
    var validStates = validStates || [ 'built_in', 'active' ];
    return role.base_role_type === 'AccountMembership' && validStates.indexOf(role.workflow_state) > -1;
  }

  function validateWorkflow(obj) {
    return obj.workflow_state === 'active';
  }

  function GetData(url, finishedFunction, opts) {
    if (typeof this === 'undefined') {
      throw new Error('GetArrayData must be invoked with a new statement');
    }
    var finished = typeof finishedFunction === 'function' ? finishedFunction : false;
    // Options that can be specified
    // filter: a function that will be passed the data item and should return
    // true if the item should be kept
    // fetchAll: a boolean that will load all of the data if true (default) or
    // just the first page (if false). May be useful for testing purposes
    // perPage: an integer that says how many items to load per page. The
    // default is 100. To skip this and use the Canvas default, specify 0.
    // timeout: the number of milliseconds to wait for a request to return,
    // the default is 2000 (2 seconds)
    // data: is an object that is passed on to the jQuery AJAX call so
    // that you can specify extra parameters
    // deferReady: hold off on marking the data done when loaded and allow other
    // code to make that determination

    var options = {
      'filter' : false,
      'fetchAll' : true,
      'perPage' : 100,
      'timeout' : 2000,
      'data' : undefined,
      'deferReady' : false
    };
    if (typeof opts === 'object') {
      for ( var prop in opts) {
        if (opts.hasOwnProperty(prop) && options.hasOwnProperty(prop)) {
          options[prop] = opts[prop];
        }
      }
    }
    if (options.perPage > 0) {
      if (typeof options.data === 'undefined') {
        options.data = {};
      }
      if (typeof options.data.per_page === 'undefined') {
        options.data.per_page = options.perPage;
      }
    }
    var pending = 0;
    this.isReady = false;
    this.data = undefined;
    var parent = this;
    try {
      (function getUrl() {
        pending++;
        $.ajax({
          'url' : url,
          'dataType' : 'json',
          'data' : options.data,
          'timeout' : options.timeout
        }).done(function(d, status, jqXHR) {
          url = nextURL(jqXHR.getResponseHeader('Link'));
          var valid;
          if (typeof d === 'object') {
            if (Array.isArray(d)) {
              if (typeof parent.data === 'undefined') {
                parent.data = [];
              }
              for (var i = 0; i < d.length; i++) {
                valid = true;
                if (typeof options.filter === 'function') {
                  valid = options.filter(d[i]);
                }
                if (valid) {
                  parent.data.push(d[i]);
                }
              }
            } else {
              if (typeof parent.data === 'undefined') {
                valid = true;
                if (typeof options.filter === 'function') {
                  valid = options.filter(d);
                }
                if (valid) {
                  parent.data = d;
                }
              } else {
                console.log('More than one page loaded for an object -- need to figure this out');
              }
            }
          }
          if (options.fetchAll && url) {
            getUrl();
          }
          pending--;
          if (pending <= 0) {
            if (!options.deferReady) {
              parent.isReady = true;
            }
            if (finished) {
              finished();
            }
          }
        }).fail(function() {
          pending--;
          throw new Error('Failed to load all of the data');
        });
      })();
    } catch (e) {
      errorHandler(e);
    }
  }

  function nextURL(linkTxt) {
    var url = null;
    if (linkTxt) {
      var links = linkTxt.split(',');
      var nextRegEx = new RegExp('^<(.*)>; rel="next"$');
      for (var i = 0; i < links.length; i++) {
        var matches = nextRegEx.exec(links[i]);
        if (matches) {
          url = matches[1];
        }
      }
    }
    return url;
  }

  function addAdminListReportButton() {
    var el = document.getElementById('jj_admin_list_report');
    if (!el) {
      var rsMargins = document.querySelectorAll('div#right-side-wrapper div.rs-margin-bottom');
      if (rsMargins) {
        for (var i = 0; i < rsMargins.length; i++) {
          var analytics = rsMargins[i].querySelector('i.icon-analytics');
          if (analytics) {
            var anchor = document.createElement('a');
            anchor.id = 'jj_admin_list_report';
            anchor.classList.add('Button', 'button-sidebar-wide');
            var icon = document.createElement('i');
            icon.classList.add('icon-export');
            anchor.appendChild(icon);
            var text = document.createTextNode(' List Account Admins');
            anchor.appendChild(text);
            rsMargins[i].appendChild(anchor);
            break;
          }
        }
      }
      $('#jj_admin_list_report').one('click', adminListReport);
    }
    return;
  }

  function getAccountId() {
    var accountId = null;
    try {
      var accountRegex = new RegExp('/accounts/([0-9]+)$');
      var matches = accountRegex.exec(window.location.pathname);
      if (matches) {
        accountId = matches[1];
      } else {
        throw new Error('Unable to detect Account ID');
      }
    } catch (e) {
      errorHandler(e);
    }
    return accountId;
  }

  function makeReport(data) {
    try {
      var csv = createCSV(data);
      if (csv) {
        var blob = new Blob([ csv ], {
          'type' : 'text/csv;charset=utf-8'
        });
        saveAs(blob, 'admin-list.csv');
        $('#jj_admin_list_report').one('click', adminListReport);
      } else {
        throw new Error('Problem creating report');
      }
    } catch (e) {
      errorHandler(e);
    }
  }

  function createDataTable(accounts, roles, rootId) {
    var sisTypes = getSisTypes(accounts);
    var srcRegex = new RegExp('^([aur])\.(.*)$');
    var sisRegex = new RegExp('\.sis_(.*?)_id$');
    var k;
    for (k = 0; k < reportFields.length; k++) {
      var field = reportFields[k];
      if (!srcRegex.test(field.src)) {
        throw new Error('Bad src for field ' + field.name);
      }
      var sisMatch = sisRegex.exec(field.src);
      if (sisMatch) {
        if (typeof sisTypes[sisMatch[1]] !== 'undefined') {
          reportFields[k].sis = sisTypes[sisMatch[1]] ? sisMatch[1] : false;
        }
      }
    }
    var header = [];
    var needsHeader = true;
    var data = [];
    var parentList = collectParents(accounts);
    addParent(rootId);
    return data;

    function addParent(id) {
      if (typeof accounts[id] === 'undefined') {
        return;
      }
      addAccount(id);
      if (typeof parentList[id] !== 'undefined') {
        // We have children, process them
        for (var i = 0; i < parentList[id].length; i++) {
          addParent(parentList[id][i]);
        }
      }
      return;
    }

    function addAccount(id) {
      // Add the data for the account
      if (typeof accounts[id] === 'undefined') {
        return;
      }
      var account = accounts[id];
      if (account.users.length === 0) {
        // Skip accounts with no admin users
        return;
      }
      account.users.sort(compareUsers);
      for (var j = 0; j < account.users.length; j++) {
        var roleId = account.users[j].role_id;
        if (typeof roles[roleId] === 'undefined') {
          continue;
        }
        var user = account.users[j].user;
        var role = roles[roleId];
        var row = [];
        for (k = 0; k < reportFields.length; k++) {
          var field = reportFields[k];
          var srcMatch = srcRegex.exec(field.src);
          if (srcMatch) {
            if (typeof field.sis !== 'undefined' && !field.sis) {
              continue;
            }
            if (needsHeader) {
              header.push(field.name);
            }
            var item = null;
            switch (srcMatch[1]) {
              case 'a':
                item = account.account[srcMatch[2]];
                break;
              case 'r':
                item = role[srcMatch[2]];
                break;
              case 'u':
                item = user[srcMatch[2]];
                break;
            }
            if (typeof item === 'undefined' || item === null) {
              item = '';
            }
            row.push(item);
          }
        }
        if (needsHeader && header.length > 0) {
          data.push(header);
          needsHeader = false;
        }
        if (row.length > 0) {
          data.push(row);
        }
      }

      function compareUsers(a, b) {
        if (a.user.sortable_name && b.user.sortable_name) {
          return a.user.sortable_name.localeCompare(b.user.sortable_name);
        } else {
          return a.user.name.localeCompare(b.user.name);
        }
      }

    }
  }

  function createCSV(data) {
    if (data.length === 0) {
      return;
    }
    var CRLF = '\r\n';
    var t = '';
    for (var i = 0; i < data.length; i++) {
      t = t + data[i].map(function(item) {
        var quote = false;
        if (item.indexOf('"') > -1) {
          item.replace(/"/g, '""');
          quote = true;
        }
        if (item.indexOf(',') > -1) {
          quote = true;
        }
        if (quote) {
          item = '"' + item + '"';
        }
        return item;
      }).join(',') + CRLF;
    }
    return t;
  }

  function collectParents(accounts) {
    var accountIds = Object.keys(accounts);
    var parents = {};
    for (var i = 0; i < accountIds.length; i++) {
      var key = accountIds[i];
      var parentId = accounts[key].account.parent_account_id;
      if (parentId) {
        if (typeof parents[parentId] === 'undefined') {
          parents[parentId] = [ key ];
        } else {
          parents[parentId].push(key);
        }
      }
    }
    // Sort the children alphabetically by name
    var parentIds = Object.keys(parents);
    for (var j = 0; j < parentIds.length; j++) {
      parents[parentIds[j]].sort(compareAccountNames);
    }
    return parents;

    function compareAccountNames(a, b) {
      return accounts[a].account.name.localeCompare(accounts[b].account.name);
    }
  }

  function errorHandler(e) {
    console.log(e);
    alert(e.message);
  }
})();
