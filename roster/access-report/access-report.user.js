// ==UserScript==
// @name        Access Report Data
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Generates a .CSV download of the access report for all students
// @include     https://*.instructure.com/courses/*/users
// @require     https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.js
// @version     11
// @grant       none
// ==/UserScript==
(function() {
  'use strict';

  // Some software doesn't like spaces in the headings.
  // Set headingNoSpaces = true to remove spaces from the headings
  // var headingNoSpaces = true;

  // Viewing a student's profile page now counts as a participation.
  // This can confuse the faculty when student names show up as titles.
  // By default these are now removed from the data before downloading
  // Set showViewStudent = true to include these views in the data
  // var showViewStudent = true

  var userData = {};
  var accessData = [];
  var pending = -1;
  var fetched = 0;
  var needsFetched = 0;
  var ajaxPool;
  var aborted = false;
  addAccessReportButton();

  function addAccessReportButton() {
    if (!document.getElementById('jj_access_report')) {
      const parent = document.querySelector('#people-options > ul');
      if (parent) {
        const li = document.createElement('li');
        li.setAttribute('role', 'presentation');
        li.classList.add('ui-menu-item');
        const anchor = document.createElement('a');
        anchor.id = 'jj_access_report';
        anchor.classList.add('ui-corner-all');
        anchor.setAttribute('tabindex', -1);
        anchor.setAttribute('role', 'menuitem');
        const icon = document.createElement('i');
        icon.classList.add('icon-analytics');
        anchor.appendChild(icon);
        anchor.appendChild(document.createTextNode(' Access Report Data'));
        anchor.addEventListener('click',accessReport,{'once' : true});
        li.appendChild(anchor);
        parent.appendChild(li);
      }
    }
    return;
  }


  function abortAll() {
    for (var i = 0; i < ajaxPool.length; i++) {
      ajaxPool[i].abort();
    }
    ajaxPool = [];
  }

  function setupPool() {
    try {
      ajaxPool = [];
      $.ajaxSetup({
        'beforeSend' : function(jqXHR) {
          ajaxPool.push(jqXHR);
        },
        'complete' : function(jqXHR) {
          var i = ajaxPool.indexOf(jqXHR);
          if (i > -1) {
            ajaxPool.splice(i, 1);
          }
        }
      });
    } catch (e) {
      throw new Error('Error configuring AJAX pool');
    }
  }

  function accessReport() {
    aborted = false;
    setupPool();
    var courseId = getCourseId();
    var url = '/api/v1/courses/' + courseId + '/sections?include[]=students&per_page=100';
    progressbar();
    pending = 0;
    getStudents(courseId, url);
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

  function getStudents(courseId, url) {
    try {
      if (aborted) {
        throw new Error('Aborted');
      }
      pending++;
      $.getJSON(url, function(udata, status, jqXHR) {
        url = nextURL(jqXHR.getResponseHeader('Link'));
        for (var i = 0; i < udata.length; i++) {
          var section = udata[i];
          if (section.students && section.students.length > 0) {
            for (var j = 0; j < section.students.length; j++) {
              var user = section.students[j];
              user.section_id = section.id;
              user.section_name = section.name;
              user.sis_section_id = section.sis_section_id;
              user.sis_course_id = section.sis_course_id;
              userData[user.id] = user;
            }
          }
        }
        if (url) {
          getStudents(courseId, url);
        }
        pending--;
        if (pending <= 0) {
          getAccessReport(courseId);
        }
      }).fail(function() {
        pending--;
        throw new Error('Failed to load list of students');
      });
    } catch (e) {
      errorHandler(e);
    }
  }

  function getAccessReport(courseId) {
    pending = 0;
    fetched = 0;
    needsFetched = Object.getOwnPropertyNames(userData).length;
    for ( var id in userData) {
      if (userData.hasOwnProperty(id)) {
        var url = '/courses/' + courseId + '/users/' + id + '/usage.json?per_page=100';
        getAccesses(courseId, url);
      }
    }
  }

  function getAccesses(courseId, url) {
    try {
      if (aborted) {
        throw new Error('Aborted');
      }
      pending++;
      $.getJSON(url, function(adata, status, jqXHR) {
        url = nextURL(jqXHR.getResponseHeader('Link'));
        accessData.push.apply(accessData, adata);
        if (url) {
          getAccesses(courseId, url);
        }
        pending--;
        fetched++;
        progressbar(fetched, needsFetched);
        if (pending <= 0 && !aborted) {
          makeReport();
        }
      }).fail(function() {
        pending--;
        fetched++;
        progressbar(fetched, needsFetched);
        if (!aborted) {
          console.log('Some access report data failed to load');
        }
      });
    } catch (e) {
      errorHandler(e);
    }
  }

  function getCourseId() {
    var courseId = null;
    try {
      var courseRegex = new RegExp('/courses/([0-9]+)');
      var matches = courseRegex.exec(window.location.href);
      if (matches) {
        courseId = matches[1];
      } else {
        throw new Error('Unable to detect Course ID');
      }
    } catch (e) {
      errorHandler(e);
    }
    return courseId;
  }

  function makeReport() {
    try {
      if (aborted) {
        console.log('Process aborted');
        aborted = false;
        return;
      }
      progressbar();
      var csv = createCSV();
      if (csv) {
        var blob = new Blob([ csv ], {
          'type' : 'text/csv;charset=utf-8'
        });
        saveAs(blob, 'access-report.csv');
        $('#jj_access_report').one('click', accessReport);
      } else {
        throw new Error('Problem creating report');
      }
    } catch (e) {
      errorHandler(e);
    }
  }

  function createCSV() {
    var fields = [ {
      'name' : 'User ID',
      'src' : 'u.id'
    }, {
      'name' : 'Display Name',
      'src' : 'u.name'
    }, {
      'name' : 'Sortable Name',
      'src' : 'u.sortable_name'
    }, {
      'name' : 'Category',
      'src' : 'a.asset_category'
    }, {
      'name' : 'Class',
      'src' : 'a.asset_class_name'
    }, {
      'name' : 'Title',
      'src' : 'a.readable_name'
    }, {
      'name' : 'Views',
      'src' : 'a.view_score'
    }, {
      'name' : 'Participations',
      'src' : 'a.participate_score'
    }, {
      'name' : 'Last Access',
      'src' : 'a.last_access',
      'fmt' : 'date'
    }, {
      'name' : 'First Access',
      'src' : 'a.created_at',
      'fmt' : 'date'
    }, {
      'name' : 'Action',
      'src' : 'a.action_level'
    }, {
      'name' : 'Code',
      'src' : 'a.asset_code'
    }, {
      'name' : 'Group Code',
      'src' : 'a.asset_group_code'
    }, {
      'name' : 'Context Type',
      'src' : 'a.context_type'
    }, {
      'name' : 'Context ID',
      'src' : 'a.context_id'
    }, {
      'name' : 'Login ID',
      'src' : 'u.login_id'
    }, {
      'name' : 'Section',
      'src' : 'u.section_name',
    }, {
      'name' : 'Section ID',
      'src' : 'u.section_id',
    }, {
      'name' : 'SIS Course ID',
      'src' : 'u.sis_course_id',
      'sis' : true
    }, {
      'name' : 'SIS Section ID',
      'src' : 'u.sis_section_id',
      'sis' : true
    }, {
      'name' : 'SIS Login ID',
      'src' : 'u.sis_login_id',
      'sis' : true
    }, {
      'name' : 'SIS User ID',
      'src' : 'u.sis_user_id',
      'sis' : true
    } ];
    var canSIS = false;
    for ( var id in userData) {
      if (userData.hasOwnProperty(id)) {
        if (typeof userData[id].sis_user_id !== 'undefined' && userData[id].sis_user_id) {
          canSIS = true;
          break;
        }
      }
    }
    var CRLF = '\r\n';
    var hdr = [];
    fields.map(function(e) {
      if (typeof e.sis === 'undefined' || (e.sis && canSIS)) {
        var name = (typeof headingNoSpaces !== 'undefined' && headingNoSpaces) ? e.name.replace(' ', '') : e.name;
        hdr.push(name);
      }
    });
    var t = hdr.join(',') + CRLF;
    var item, user, userId, fieldInfo, value;
    for (var i = 0; i < accessData.length; i++) {
      item = accessData[i].asset_user_access;
      if ((typeof (showViewStudent) === 'undefined' || !showViewStudent) && item.asset_category == 'roster' && item.asset_class_name == 'student_enrollment') {
        continue;
      }
      userId = item.user_id;
      user = userData[userId];
      for (var j = 0; j < fields.length; j++) {
        if (typeof fields[j].sis !== 'undefined' && fields[j].sis && !canSIS) {
          continue;
        }
        fieldInfo = fields[j].src.split('.');
        value = fieldInfo[0] == 'a' ? item[fieldInfo[1]] : user[fieldInfo[1]];
        if (typeof value === 'undefined' || value === null) {
          value = '';
        } else {
          if (typeof fields[j].fmt !== 'undefined') {
            switch (fields[j].fmt) {
              case 'date':
                value = excelDate(value);
                break;
              default:
                break;
            }
          }
          if (typeof value === 'string') {
            var quote = false;
            if (value.indexOf('"') > -1) {
              value = value.replace(/"/g, '""');
              quote = true;
            }
            if (value.indexOf(',') > -1) {
              quote = true;
            }
            if (quote) {
              value = '"' + value + '"';
            }
          }
        }
        if (j > 0) {
          t += ',';
        }
        t += value;
      }
      t += CRLF;
    }
    return t;
  }

  function excelDate(timestamp) {
    var d;
    try {
      if (!timestamp) {
        return '';
      }
      timestamp = timestamp.replace('Z', '.000Z');
      var dt = new Date(timestamp);
      if (typeof dt !== 'object') {
        return '';
      }
      d = dt.getFullYear() + '-' + pad(1 + dt.getMonth()) + '-' + pad(dt.getDate()) + ' ' + pad(dt.getHours()) + ':' + pad(dt.getMinutes()) + ':' + pad(dt.getSeconds());
    } catch (e) {
      errorHandler(e);
    }
    return d;

    function pad(n) {
      return n < 10 ? '0' + n : n;
    }
  }

  function progressbar(x, n) {
    try {
      if (typeof x === 'undefined' || typeof n == 'undefined') {
        if ($('#jj_progress_dialog').length === 0) {
          $('body').append('<div id="jj_progress_dialog"></div>');
          $('#jj_progress_dialog').append('<div id="jj_progressbar"></div>');
          $('#jj_progress_dialog').dialog({
            'title' : 'Fetching Access Reports',
            'autoOpen' : false,
            'buttons' : [ {
              'text' : 'Cancel',
              'click' : function() {
                $(this).dialog('close');
                aborted = true;
                abortAll();
                pending = -1;
                fetched = 0;
                needsFetched = 0;
                $('#jj_access_report').one('click', accessReport);
              }
            } ]
          });
        }
        if ($('#jj_progress_dialog').dialog('isOpen')) {
          $('#jj_progress_dialog').dialog('close');
        } else {
          $('#jj_progressbar').progressbar({
            'value' : false
          });
          $('#jj_progress_dialog').dialog('open');
        }
      } else {
        if (!aborted) {
          var val = n > 0 ? Math.round(100 * x / n) : false;
          $('#jj_progressbar').progressbar('option', 'value', val);
        }
      }
    } catch (e) {
      errorHandler(e);
    }
  }

  function errorHandler(e) {
    console.log(e.name + ': ' + e.message);
  }
})();
