// ==UserScript==
// @name        Sort the Roster
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Allows sorting on any column of the Canvas Course Roster
// @include     https://*.instructure.com/courses/*/users
// @require     https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require     https://cdn.rawgit.com/Mottie/tablesorter/v2.22.5/js/jquery.tablesorter.js
// @version     4
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var rosterColumns = {
    'avatar' : {
      'col' : 0,
      'text' : 'Profile Picture'
    },
    'name' : {
      'text' : 'Name',
      'wrapper' : 'a',
      'heading' : 'Name'
    },
    'login' : {
      'text' : 'Login / SIS ID',
      'heading' : 'Login/SIS'
    },
    'loginid' : {
      'text' : 'Login ID',
      'heading' : 'Login'
    },
    'sisid' : {
      'text' : 'SIS ID'
    },
    'section' : {
      'text' : 'Section',
      'heading' : 'Section',
      'wrapper' : 'div',
      'shrink' : true
    },
    'role' : {
      'text' : 'Role',
      'wrapper' : 'div'
    },
    'last' : {
      'text' : 'Last Activity',
      'heading' : 'Last',
      'wrapper' : 'div',
      'tablesorter' : {
        'sorter' : 'shortDateTime',
        'empty' : 'bottom',
        'sortInitialOrder' : 'desc'
      }
    },
    'total' : {
      'text' : 'Total Activity',
      'heading' : 'Total',
      'align' : 'right',
      'tablesorter' : {
        'sorter' : 'extendedTime',
        'empty' : 'bottom',
        'sortInitialOrder' : 'desc'
      }
    }
  };
  waitForKeyElements('table.roster', rosterSort);
  function rosterSort() {
    try {
      var tableColumns = $('table.roster thead tr th');
      var sortHeaders = {};
      var needParser = false;
      for (var c = 0; c < tableColumns.length; c++) {
        var columnText = tableColumns[c].textContent.trim();
        var match = false;
        for ( var field in rosterColumns) {
          if (rosterColumns.hasOwnProperty(field)) {
            var info = rosterColumns[field];
            if (typeof info.col !== 'undefined' && info.col == c) {
              if (typeof info.heading === 'undefined') {
                sortHeaders[c] = {
                  'sorter' : false,
                  'parser' : false
                };
                match = true;
                break;
              }
            }
            if (info.text == columnText) {
              rosterColumns[field].col = c;
              if (typeof info.align !== 'undefined') {
                var nthchildSelector = ':nth-child(' + (1 + c) + ')';
                var style = '<style type="text/css">table.roster tr th' + nthchildSelector + ',table.roster tr td' + nthchildSelector + '{text-align:right;}</style>';
                $(style).appendTo('head');
              }
              if (typeof info.tablesorter !== 'undefined') {
                sortHeaders[c] = info.tablesorter;
                if (typeof info.tablesorter.sorter !== 'undefined') {
                  needParser = true;
                }
              }
              match = true;
              break;
            }
          }
        }
        if (!match) {
          sortHeaders[c] = {
            'sorter' : false,
            'parser' : false
          };
        }
      }
      if (needParser) {
        $.tablesorter.addParser({
          'id' : 'shortDateTime',
          'format' : function(s, table, cell, cellIndex) {
            var months = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
            var thisYear = new Date().getFullYear();
            var shortDateTimeRegex = new RegExp('^(' + months + ') ([0-9]+)(?:, ([0-9]{4}))? at ([0-9]+):([0-9][0-9])(am|pm)');
            var tm = '';
            var matches = shortDateTimeRegex.exec(s);
            if (matches) {
              var month = months.indexOf(matches[1]) / 4;
              var day = parseInt(matches[2]);
              var year = parseInt(matches[3]) || thisYear;
              var hour = parseInt(matches[4]);
              if (hour == 12) {
                hour = 0;
              }
              if (matches[6] == 'pm') {
                hour += 12;
              }
              var min = parseInt(matches[5]);
              tm = new Date(year, month, day, hour, min, 0).toISOString();
            }
            return tm;
          },
          'parsed' : false,
          'type' : 'text'
        });
        $.tablesorter.addParser({
          'id' : 'extendedTime',
          'format' : function(s, table, cell, cellIndex) {
            var extendedTimeRegex = new RegExp('^(?:([0-9]+):)?([0-9]{2}):([0-9]{2})$', 'im');
            var tm = '';
            var matches = extendedTimeRegex.exec(s);
            if (matches) {
              var hrs = parseInt(matches[1]) || 0;
              var mins = parseInt(matches[2]);
              var secs = parseInt(matches[3]);
              tm = 3600 * hrs + 60 * mins + secs;
            }
            return tm;
          },
          'parsed' : false,
          'type' : 'numeric'
        });
      }
      console.log('configuration done');
      var observerTarget = document.querySelector('table.roster tbody');
      var rowsInRosterTable = observerTarget.rows.length;
      if (rowsInRosterTable >= 50) {
        var observer = new MutationObserver(function() {
          if (observerTarget.rows.length != rowsInRosterTable) {
            rowsInRosterTable = observerTarget.rows.length;
            $('table.roster.tablesorter').trigger('update', [ true ]);
          }
        });
        observer.observe(observerTarget, {
          'childList' : true
        });
      }
      $('table.roster').tablesorter({
        'sortReset' : true,
        'headers' : sortHeaders
      });
    } catch (e) {
      console.log(e);
    }
  }
})();
