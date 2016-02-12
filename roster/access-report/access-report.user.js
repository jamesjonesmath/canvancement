// ==UserScript==
// @name        Access Report Data
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Generates a .CSV download of the access report for all students
// @include     https://*.instructure.com/courses/*/users
// @version     1
// @grant       none
// ==/UserScript==
(function () {
  'use strict';
  var userData = {
  };
  var accessData = [
  ];
  var pending = - 1;
  addAccessReportButton();
  function addAccessReportButton() {
    if ($('#jj_access_report').length == 0) {
      $('#right-side-wrapper div').append('<a id="jj_access_report" class="btn button-sidebar-wide"><i class="icon-analytics"></i> Access Report Data</a>');
      $('#jj_access_report').click(accessReport);
    }
    return;
  }
  function accessReport() {
    var courseId = getCourseId();
    var url = '/api/v1/courses/' + courseId + '/users?enrollment_type[]=student&per_page=100';
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
    pending++;
    $.getJSON(url, function (udata, status, jqXHR) {
      url = nextURL(jqXHR.getResponseHeader('Link'));
      for (var i = 0; i < udata.length; i++) {
        userData[udata[i].id] = udata[i];
      }
      if (url) {
        getStudents(courseId, url);
      }
      pending--;
      if (pending <= 0) {
        getAccessReport(courseId);
      }
    }).fail(function () {
      pending--;
      alert('Failed to load list of students');
      return;
    });
  }
  function getAccessReport(courseId) {
    pending = 0;
    for (var id in userData) {
      if (userData.hasOwnProperty(id)) {
        var url = '/courses/' + courseId + '/users/' + id + '/usage.json?per_page=100';
        getAccesses(courseId, url);
      }
    }
  }
  function getAccesses(courseId, url) {
    console.log(url);
    pending++;
    $.getJSON(url, function (adata, status, jqXHR) {
      url = nextURL(jqXHR.getResponseHeader('Link'));
      accessData.push.apply(accessData, adata);
      if (url) {
        getAccesses(courseId, url);
      }
      pending--;
      if (pending <= 0) {
        makeReport();
      }
    }).fail(function () {
      pending--;
      console.log('Some information failed to load');
      if (pending <= 0) {
        makeReport();
      }
    });
  }
  function getCourseId() {
    var courseRegex = new RegExp('/courses/([0-9]+)');
    var courseId = null;
    var matches = courseRegex.exec(window.location.href);
    if (matches) {
      courseId = matches[1];
    }
    return courseId;
  }
  function makeReport() {
    var csv = createCSV();
    if (csv) {
      var btoa = escape(encodeURIComponent(csv));
      btoa = window.btoa(csv);
      var csvData = 'data:text/csv;charset=utf-8;base64,' + btoa;
      var el = document.createElement('a');
      el.setAttribute('download', 'access-report.csv');
      el.setAttribute('href', csvData);
      el.style.display = 'none';
      document.body.appendChild(el);
      el.click();
      document.body.removeChild(el);
    } 
    else {
      alert('Problem creating report!');
    }
  }
  function createCSV() {
    var fields = [
      {
        'name': 'User ID',
        'src': 'u.id'
      },
      {
        'name': 'Display Name',
        'src': 'u.name'
      },
      {
        'name': 'Sortable Name',
        'src': 'u.sortable_name'
      },
      {
        'name': 'Category',
        'src': 'a.asset_category'
      },
      {
        'name': 'Class',
        'src': 'a.asset_class_name'
      },
      {
        'name': 'Title',
        'src': 'a.readable_name'
      },
      {
        'name': 'Views',
        'src': 'a.view_score'
      },
      {
        'name': 'Participations',
        'src': 'a.participate_score'
      },
      {
        'name': 'Last Access',
        'src': 'a.last_access',
        'fmt': 'date'
      },
      {
        'name': 'First Access',
        'src': 'a.created_at',
        'fmt': 'date'
      },
      {
        'name': 'Action',
        'src': 'a.action_level'
      },
      {
        'name': 'Code',
        'src': 'a.asset_code'
      },
      {
        'name': 'Group Code',
        'src': 'a.asset_group_code'
      },
      {
        'name': 'Context Type',
        'src': 'a.context_type'
      },
      {
        'name': 'Context ID',
        'src': 'a.context_id'
      },
      {
        'name': 'Login ID',
        'src': 'u.login_id'
      },
      {
        'name': 'SIS Login ID',
        'src': 'u.sis_login_id',
        'sis': true
      },
      {
        'name': 'SIS User ID',
        'src': 'u.sis_user_id',
        'sis': true
      }
    ];
    var canSIS = false;
    for (var k = 0; k < userData.length; k++) {
      if (typeof userData[k].sis_user_id !== 'undefined' && userData[k].sis_user_id) {
        canSIS = true;
        break;
      }
    }
    var CRLF = '\r\n';
    var hdr = [
    ];
    fields.map(function (e) {
      if (typeof e.sis === 'undefined' || (e.sis && canSIS)) {
        hdr.push(e.name);
      }
    });
    var t = hdr.join(',') + CRLF;
    var item,
    user,
    userId,
    fieldInfo,
    value;
    var fieldRegex = new RegExp('^([au])[.](.*)$');
    for (var i = 0; i < accessData.length; i++) {
      item = accessData[i].asset_user_access;
      userId = item.user_id;
      user = userData[userId];
      for (var j = 0; j < fields.length; j++) {
        if (typeof fields[j].sis !== 'undefined' && fields[j].sis && !canSIS) {
          continue;
        }
        fieldInfo = fields[j].src.split('.');
        value = fieldInfo[0] == 'a' ? item[fieldInfo[1]] : user[fieldInfo[1]];
        if (value == null) {
          value = '';
        } 
        else {
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
            if (value.indexOf('"') > - 1) {
              value = value.replace('"', '""');
              quote = true;
            }
            if (value.indexOf(',') > - 1) {
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
    if (!timestamp) {
      return '';
    }
    timestamp = timestamp.replace('Z', '.000Z');
    var dt = new Date(timestamp);
    if (typeof dt !== 'object') {
      return '';
    }
    var d = dt.getFullYear() + '-' +
    pad(1 + dt.getMonth()) + '-' +
    pad(dt.getDate()) + ' ' +
    pad(dt.getHours()) + ':' +
    pad(dt.getMinutes()) + ':' +
    pad(dt.getSeconds());
    return d;
    function pad(n) {
      return n < 10 ? '0' + n : n;
    }
  }
}) ();
