// ==UserScript==
// @name        Photo Roster
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Sort a Canvas course roster; download a regular or photo version as a PDF
// @include     https://*.instructure.com/courses/*/users
// @require     https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require     https://cdn.rawgit.com/ryanmorr/ready/master/ready.js
// @require     https://cdn.rawgit.com/Mottie/tablesorter/v2.22.5/js/jquery.tablesorter.js
// @require     https://cdn.rawgit.com/henrya/js-jquery/master/BinaryTransport/jquery.binarytransport.js
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==
(function () {
  'use strict';
  var rosterColumns = {
    'avatar': {
      'col': 0,
      'text': 'Profile Picture'
    },
    'name': {
      'text': 'Name',
      'wrapper': 'a',
      'heading': 'Name'
    },
    'login': {
      'text': 'Login / SIS ID',
      'heading': 'Login'
    },
    'section': {
      'text': 'Section',
      'heading': 'Section',
      'wrapper': 'div',
      'shrink': true
    },
    'role': {
      'text': 'Role',
      'wrapper': 'div'
    },
    'last': {
      'text': 'Last Activity',
      'heading': 'Last',
      'wrapper': 'div',
      'tablesorter': {
        'sorter': 'shortDateTime',
        'empty': 'bottom',
        'sortInitialOrder': 'desc'
      }
    },
    'total': {
      'text': 'Total Activity',
      'heading': 'Total',
      'align': 'right',
      'tablesorter': {
        'sorter': 'extendedTime',
        'empty': 'bottom',
        'sortInitialOrder': 'desc'
      }
    }
  };
  var skipPaginationWarning = false;
  ready('table.roster.table', function (e) {
    try {
      var tableColumns = $('table.roster.table thead tr th');
      var sortHeaders = {
      };
      var needParser = false;
      for (var c = 0; c < tableColumns.length; c++) {
        var columnText = tableColumns[c].textContent.trim();
        var match = false;
        for (var field in rosterColumns) {
          if (rosterColumns.hasOwnProperty(field)) {
            var info = rosterColumns[field];
            if (typeof info.col !== 'undefined' && info.col == c) {
              if (typeof info.heading === 'undefined') {
                sortHeaders[c] = {
                  'sorter': false,
                  'parser': false
                };
                match = true;
                break;
              }
            }
            if (info.text == columnText) {
              rosterColumns[field].col = c;
              if (typeof info.align !== 'undefined') {
                var nthchildSelector = ':nth-child(' + (1 + c) + ')';
                var style = '<style type="text/css">table.roster.table tr th' + nthchildSelector + ',table.roster.table tr td' + nthchildSelector + '{text-align:right;}</style>';
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
            'sorter': false,
            'parser': false
          };
        }
      }
      if (needParser) {
        $.tablesorter.addParser({
          'id': 'shortDateTime',
          'format': function (s, table, cell, cellIndex) {
            var months = 'Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec';
            var thisYear = new Date().getFullYear();
            var shortDateTimeRegex = new RegExp('^(' + months
            + ') ([0-9]+)(?:, ([0-9]{4}))? at ([0-9]+):([0-9][0-9])(am|pm)');
            var tm = '';
            var matches = shortDateTimeRegex.exec(s);
            if (matches) {
              var month = months.indexOf(matches[1]) / 4 + 1;
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
          'parsed': false,
          'type': 'text'
        });
        $.tablesorter.addParser({
          'id': 'extendedTime',
          'format': function (s, table, cell, cellIndex) {
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
          'parsed': false,
          'type': 'numeric'
        });
      }
      var observerTarget = document.querySelector('table.roster.table tbody');
      var rowsInRosterTable = observerTarget.rows.length;
      if (rowsInRosterTable >= 50) {
        var observer = new MutationObserver(function (mutations) {
          if (observerTarget.rows.length != rowsInRosterTable) {
            rowsInRosterTable = observerTarget.rows.length;
            $('table.roster.table.tablesorter').trigger('update', [
              true
            ]);
          }
        });
        observer.observe(observerTarget, {
          'childList': true
        });
      }
      $('table.roster.table').tablesorter({
        'sortReset': true,
        'headers': sortHeaders
      });
      addRosterPdfButton();
      addPhotoRosterButton();
    } 
    catch (e) {
      console.log(e);
    }
  });
  function fetchRoster() {
    var roster = [];
    try {
      var studentsOnly = true;
      var studentRegex = new RegExp('Student');
      var userRegex = new RegExp('/users/([0-9]+)$');
      var roleColumn = rosterColumns.role.col;
      $('table.roster.table tbody tr').each(function () {
        var td = $(this).children();
        if (!studentsOnly || studentRegex.test(td[roleColumn].textContent)) {
          var a = $(td[0]).children('a.avatar') [0];
          var userId = null;
          var userMatch = userRegex.exec($(a).attr('href'));
          if (userMatch) {
            userId = userMatch[1];
          } 
          else {
            throw ('Malformed UserID URL, refusing to do anything else.');
          }
          var avatarUrl = $(a).css('background-image').replace(/^url\(['"]*(.*?)['"]*\)$/, '$1');
          var row = {
            'userId': userId,
            'avatar': avatarUrl
          };
          for (var field in rosterColumns) {
            if (!rosterColumns.hasOwnProperty(field)) {
              continue;
            }
            var info = rosterColumns[field];
            if (typeof info.col !== 'undefined' && info.col > 0) {
              if (typeof info.wrapper !== 'undefined') {
                row[field] = (td[info.col]).querySelector(info.wrapper).textContent.trim();
              } 
              else {
                row[field] = td[info.col].textContent.trim();
              }
            }
          }
          roster.push(row);
        }
      });
    } 
    catch (e) {
      console.log(e);
    }
    return roster;
  }
  function singleSection(roster) {
    var sections = [
    ];
    for (var i = 0; i < roster.length; i++) {
      var section = roster[i].section;
      if (typeof section !== 'undefined') {
        if (sections.indexOf(section) == - 1) {
          sections.push(section);
        }
      }
    }
    return sections.length <= 1 ? true : false;
  }
  function rosterHeader() {
    var shortCourseName = $('#section-tabs-header').text().trim();
    var termName = $('#section-tabs-header-subtitle').text().trim();
    var d = new Date();
    var heading = {
      'columns': [
        {
          'text': [
            shortCourseName + ' ',
            {
              'text': termName,
              'fontSize': 12,
              'italics': true,
              'align': 'center'
            }
          ],
          'fontSize': 16,
          'bold': true,
        },
        {
          'text': d.toLocaleDateString(),
          'alignment': 'right',
          'fontSize': 10
        }
      ]
    };
    return heading;
  }
  function confirmAllLoaded() {
    var isOk = true;
    if (typeof skipPaginationWarning !== 'undefined' && skipPaginationWarning) {
      return isOk;
    }
    var rosterBody = document.querySelector('table.roster.table tbody');
    if (rosterBody.rows.length == 50) {
      var mesg = 'You have exactly 50 names in your roster.\n\n'
      + 'If you are expecting more names, then you probably need to scroll down on the page to finish loading the entire roster.\n\n'
      + 'Press OK to continue with the report or Cancel to return to the Roster Page.';
      isOk = window.confirm(mesg);
    }
    return isOk;
  }
  function addRosterPdfButton() {
    if ($('#jj_roster_pdf').length == 0) {
      $('#right-side-wrapper div').append('<a id="jj_roster_pdf" class="btn button-sidebar-wide"><i class="icon-download"></i> Download Roster as PDF</a>');
      $('#jj_roster_pdf').click(rosterPdf);
    }
    return;
  }
  function rosterPdf() {
    var baseFontSize = 12;
    if (!confirmAllLoaded()) {
      return;
    }
    var tableHeading = [
    ];
    var roster = fetchRoster();
    var omitSection = singleSection(roster);
    var colOrder = [
    ];
    var colWidths = [
    ];
    var tableBody = [
    ];
    try {
      for (var field in rosterColumns) {
        if (!rosterColumns.hasOwnProperty(field)) {
          continue;
        }
        var info = rosterColumns[field];
        if (typeof info.heading === 'undefined') {
          continue;
        }
        if (field == 'section' && omitSection) {
          continue;
        }
        colOrder.push(field);
        if (typeof info.align !== 'undefined') {
          tableHeading.push({
            'text': info.heading,
            'style': info.align + 'align'
          });
        } 
        else {
          tableHeading.push(info.heading);
        }
        colWidths.push(typeof info.shrink !== 'undefined' && info.shrink ? '*' : 'auto');
      }
      tableBody.push(tableHeading);
      for (var i = 0; i < roster.length; i++) {
        var user = roster[i];
        var row = [
        ];
        for (var j = 0; j < colOrder.length; j++) {
          var key = colOrder[j];
          if (typeof rosterColumns[key].align !== 'undefined') {
            row.push({
              'text': user[key],
              'style': rosterColumns[key].align + 'align'
            });
          } 
          else if (typeof rosterColumns[key].shrink !== 'undefined' && rosterColumns[key].shrink && user[key].length > 15) {
            var fontSize = baseFontSize * 15 / user[key].length;
            row.push({
              'text': user[key],
              'fontSize': fontSize < 8 ? 8 : fontSize
            });
          } 
          else {
            row.push(user[key]);
          }
        }
        tableBody.push(row);
      }
      var table = {
        'headerRows': 1,
        'widths': colWidths,
        'body': tableBody
      };
      var pdfContent = {
        content: [
          rosterHeader(),
          {
            'table': table,
            'layout': 'lightHorizontalLines',
            'style': 'roster'
          }
        ],
        'styles': {
          'header': {
            'fontSize': 1.25 * baseFontSize,
            'bold': true
          },
          'roster': {
            'fontSize': baseFontSize
          },
          'rightalign': {
            'alignment': 'right'
          }
        },
        'pageSize': 'LETTER',
        'pageOrientation': 'portrait',
        'pageMargins': [
          40,
          60,
          40,
          60
        ]
      };
      downloadPdf(pdfContent, 'roster.pdf');
    } catch (e) {
      console.log(e);
    }
  }
  function addPhotoRosterButton() {
    if ($('#jj_photo_roster_pdf').length == 0) {
      $('#right-side-wrapper div').append('<a id="jj_photo_roster_pdf" class="btn button-sidebar-wide"><i class="icon-user"></i> Create Photo Roster</a>');
      $('#jj_photo_roster_pdf').click(photoRoster);
    }
    return;
  }
  function photoRoster() {
    var baseFontSize = 12;
    var defaultAvatarUrl = 'https://canvas.instructure.com/images/messages/avatar-50.png';
    var avatarWidth = 128;
    var avatarHeight = 128;
    if (!confirmAllLoaded()) {
      return;
    }
    var roster = [
    ];
    var avatars = [
    ];
    var failedDownloads = {
      'aborts': 0,
      'errors': 0,
      'timeouts': 0
    };
    var contentTypeRegex = new RegExp('^Content-Type: (image/(?:jpeg|png|gif))$', 'im');
    var defaultAvatar;
    init();
    function init() {
      try {
        roster = fetchRoster();
        fetchAvatar(defaultAvatarUrl, - 1);
        var defaultAvatarRegex = new RegExp('d=' + defaultAvatarUrl + '$');
        for (var i = 0; i < roster.length; i++) {
          var avatar = roster[i].avatar;
          var userId = roster[i].userId;
          if (defaultAvatarRegex.test(decodeURIComponent(avatar))) {
            roster[i].avatar = defaultAvatarUrl;
            addAvatar(userId);
          } 
          else {
            fetchAvatar(avatar, userId);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    function fetchAvatar(url, userId) {
      try {
        GM_xmlhttpRequest({
          'method': 'GET',
          'url': url,
          'responseType': 'arraybuffer',
          'timeout': 1500,
          'onload': function (res) {
            convertAvatar(userId, res);
          },
          'onabort': function (res) {
            console.log('Aborted : ' + url);
            failedDownloads.aborts++;
            addAvatar(userId);
          },
          'onerror': function (res) {
            console.log('Error : ' + url);
            failedDownloads.errors++;
            addAvatar(userId);
          },
          'ontimeout': function (res) {
            console.log('Timed out : ' + url);
            failedDownloads.timeouts++;
            addAvatar(userId);
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
    function convertAvatar(userId, res) {
      try {
        if (res.readyState == 4) {
          if (res.status == 200) {
            var ctypes = contentTypeRegex.exec(res.responseHeaders);
            if (ctypes) {
              var ctype = ctypes[1];
              if (ctype == 'image/gif') {
                ctype = 'image/png';
              }
              var bin = new Uint8Array(res.response);
              var dataUrl = 'data:' + ctypes[1] + ';base64,'
              + btoa(String.fromCharCode.apply(null, bin));
              var img = new Image();
              img.onerror = function () {
                console.log('Corrupt image for userId = ', userId);
                addAvatar(userId);
              };
              img.onload = function () {
                if (img.width != avatarWidth || img.height != avatarHeight) {
                  var canvas = document.createElement('canvas');
                  canvas.width = avatarWidth;
                  canvas.height = avatarHeight;
                  var ctx = canvas.getContext('2d');
                  ctx.rect(0, 0, avatarWidth, avatarHeight);
                  ctx.fillStyle = 'white';
                  ctx.fill();
                  var scale = Math.min(avatarWidth / img.width, avatarHeight / img.height)
                  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, scale * img.width, scale
                  * img.height);
                  dataUrl = canvas.toDataURL(ctype);
                  canvas = null;
                }
                if (userId < 0) {
                  defaultAvatar = dataUrl;
                  return;
                }
                addAvatar(userId, dataUrl);
              };
              img.src = dataUrl;
            } 
            else {
              addAvatar(userId);
            }
          } 
          else {
            addAvatar(userId);
          }
        } 
        else {
          console.log(res);
          alert('Missing informations, press F12 to see log');
          addAvatar(userId);
        }
      } catch (e) {
        console.log(e);
      }
    }
    function addAvatar(userId, avatar) {
      var item = {
        'id': userId
      };
      if (typeof avatar !== 'undefined') {
        item.img = avatar;
      }
      avatars.push(item);
      if (avatars.length >= roster.length) {
        photoRosterPdf();
      }
    }
    function abortOnFailedDownloads() {
      var abort = false;
      var mesg = '';
      if (failedDownloads.aborts > 0) {
        mesg += failedDownloads.aborts + ' images failed with an abort\n';
      }
      if (failedDownloads.errors > 0) {
        mesg += failedDownloads.errors + ' images failed with an error\n';
      }
      if (failedDownloads.timeouts > 0) {
        mesg += failedDownloads.timeouts + ' images timed out before downloading\n';
      }
      if (mesg.length > 0) {
        mesg += '\nClick OK to continue with the incomplete Photo roster or Cancel to try again later.';
        abort = !window.confirm(mesg);
      }
      return abort;
    }
    function photoRosterPdf() {
      try {
        var colsPerPage = 4;
        var tableBody = [
        ];
        var row = [
        ];
        if (abortOnFailedDownloads()) {
          return;
        }
        var omitSection = singleSection(roster);
        for (var i = 0; i < roster.length; i++) {
          if (i % colsPerPage == 0 && row.length > 0) {
            tableBody.push(row);
            row = [
            ];
          }
          var user = roster[i];
          var avatar = {
            'image': 'defaultAvatar',
            'height': avatarHeight / 2,
            'width': avatarWidth / 2,
          };
          for (var j = 0; j < avatars.length; j++) {
            if (avatars[j].id == user.userId) {
              if (typeof avatars[j].img !== 'undefined') {
                avatar = {
                  'image': avatars[j].img,
                  'height': avatarHeight / 2,
                  'width': avatarWidth / 2,
                };
              }
              break;
            }
          }
          var userInfo = [
            avatar,
            user.name
          ];
          if (!omitSection) {
            userInfo.push({
              'text': user.section,
              'fontSize': 0.8 * baseFontSize
            });
          }
          row.push(userInfo);
        }
        if (row.length > 0) {
          for (var k = row.length; k < colsPerPage; k++) {
            row.push('');
          }
          tableBody.push(row);
        }
        var rowWidths = [
        ];
        for (var c = 0; c < colsPerPage; c++) {
          rowWidths.push('*');
        }
        var table = {
          'headerRows': 0,
          'widths': rowWidths,
          'body': tableBody
        };
        var pdfContent = {
          content: [
            rosterHeader(),
            {
              'table': table,
              'layout': 'lightHorizontalLines',
              'style': 'roster'
            }
          ],
          'styles': {
            'header': {
              'fontSize': 1.25 * baseFontSize,
              'bold': true
            },
            'roster': {
              'fontSize': baseFontSize
            },
            'rightalign': {
              'alignment': 'right'
            }
          },
          'images': {
            'defaultAvatar': defaultAvatar
          },
          'fontSize': 24,
          'pageSize': 'LETTER',
          'pageOrientation': 'portrait',
          'pageMargins': [
            40,
            60,
            40,
            40
          ]
        };
        downloadPdf(pdfContent, 'photoroster.pdf');
      } catch (e) {
        console.log(e);
      }
    }
  };
  function downloadPdf(content, name) {
    // pdfmake won't load via GreaseMonkey // @require, so load it separately.
    try {
      var scripts = [
        'https://cdn.rawgit.com/bpampuch/pdfmake/master/build/pdfmake.js',
        'https://cdn.rawgit.com/bpampuch/pdfmake/master/build/vfs_fonts.js'
      ];
      var numLoaded = 0;
      for (var i = 0; i < scripts.length; i++) {
        jQuery.ajax({
          'url': scripts[i],
          'cache': true,
          'dataType': 'script'
        }).done(function (data, textStatus, jqXHR) {
          numLoaded++;
          if (numLoaded >= scripts.length) {
            var docDefinition = cloneInto(content, unsafeWindow);
            unsafeWindow.pdfMake.createPdf(docDefinition).download(name);
          }
        }).fail(function (data, textStatus, jqXHR) {
          alert('Failed to load PDF libraries. Please try again later');
        });
      }
    } 
    catch (e) {
      console.log(e);
    }
  }
}) ();
