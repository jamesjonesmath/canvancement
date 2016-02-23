// ==UserScript==
// @name        Instructor Access Report Data
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Generates a .CSV download of the access report for faculty in current courses in an account
// @include     /^https://.*\.instructure\.com/accounts/[0-9]+$/
// @version     1
// @grant       none
// ==/UserScript==
(function() {
  'use strict';
  var courseData = {};
  var userData = {};
  var accessData = [];
  var pending = -1;
  addAccessReportButton();

  function addAccessReportButton() {
    if ($('#jj_access_report')
      .length === 0) {
      $('#right-side-wrapper div.rs-margin-all')
        .append('<a id="jj_access_report" class="btn button-sidebar button-sidebar-wide"><i class="icon-analytics"></i> Instructor Access Report Data</a>');
      $('#jj_access_report')
        .one('click', accessReport);
    }
    return;
  }

  function accessReport() {
    var accountId = getAccountId();
    var url = '/api/v1/accounts/' + accountId + '/courses?enrollment_type[]=teacher&include[]=teachers&include[]=term&per_page=100';
    pending = 0;
    getCourses(url);
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

  function getCourses(url) {
    try {
      pending++;
      $.getJSON(url, function(cdata, status, jqXHR) {
          url = nextURL(jqXHR.getResponseHeader('Link'));
          for (var i = 0; i < cdata.length; i++) {
            var course = cdata[i];
            var crs = {
              'id': course.id,
              'name': course.name,
              'account_id': course.account_id,
              'course_code': course.course_code,
              'term': course.term.name,
              'sis_course_id': course.sis_course_id,
              'teachers': []
            };
            if (course.teachers.length > 0) {
              for (var j = 0; j < course.teachers.length; j++) {
                var user = course.teachers[j];
                crs.teachers.push(user.id);
                if (typeof userData[user.id] === 'undefined') {
                  userData[user.id] = {
                    'id': user.id,
                    'display_name': user.display_name,
                    'courses': [
                      course.id
                    ]
                  };
                } else {
                  userData[user.id].courses.push(course.id);
                }
              }
            }
            courseData[course.id] = crs;
          }
          if (url) {
            getCourses(url);
          }
          pending--;
          if (pending <= 0) {
            getAccessReport();
          }
        })
        .fail(function() {
          pending--;
          throw new Error('Failed to load list of courses');
        });
    } catch (e) {
      errorHandler(e);
    }
  }

  function getAccessReport() {
    pending = 0;
    for (var courseId in courseData) {
      if (courseData.hasOwnProperty(courseId)) {
        var course = courseData[courseId];
        for (var i = 0; i < course.teachers.length; i++) {
          var userId = course.teachers[i];
          var url = '/courses/' + courseId + '/users/' + userId + '/usage.json?per_page=100';
          getAccesses(courseId, url);
        }
      }
    }
  }

  function getAccesses(courseId, url) {
    try {
      pending++;
      $.getJSON(url, function(adata, status, jqXHR) {
          url = nextURL(jqXHR.getResponseHeader('Link'));
          for (var i in adata) {
            if (adata.hasOwnProperty(i)) {
              adata[i].asset_user_access.course_id = courseId;
              accessData.push(adata[i]);
            }
          }
          if (url) {
            getAccesses(courseId, url);
          }
          pending--;
          if (pending <= 0) {
            makeReport();
          }
        })
        .fail(function() {
          pending--;
          console.log('Some access report data failed to load');
          if (pending <= 0) {
            makeReport();
          }
        });
    } catch (e) {
      errorHandler(e);
    }
  }

  function getAccountId() {
    var accountId = null;
    try {
      var accountRegex = new RegExp('/accounts/([0-9]+)$');
      var matches = accountRegex.exec(window.location.href);
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

  function makeReport() {
    try {
      var csv = createCSV();
      if (csv) {
        var csvData = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(csv);
        var el = document.createElement('a');
        el.setAttribute('download', 'access-report.csv');
        el.setAttribute('href', csvData);
        el.style.display = 'none';
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
        $('#jj_access_report')
          .one('click', accessReport);
      } else {
        throw new Error(Problemcreatingreport);
      }
    } catch (e) {
      errorHandler(e);
    }
  }

  function createCSV() {
    var fields = [{
      'name': 'Course ID',
      'src': 'c.id'
    }, {
      'name': 'Course Title',
      'src': 'c.name'
    }, {
      'name': 'User ID',
      'src': 'u.id'
    }, {
      'name': 'Display Name',
      'src': 'u.display_name'
    }, {
      'name': 'Category',
      'src': 'a.asset_category'
    }, {
      'name': 'Class',
      'src': 'a.asset_class_name'
    }, {
      'name': 'Title',
      'src': 'a.readable_name'
    }, {
      'name': 'Views',
      'src': 'a.view_score'
    }, {
      'name': 'Participations',
      'src': 'a.participate_score'
    }, {
      'name': 'Last Access',
      'src': 'a.last_access',
      'fmt': 'date'
    }, {
      'name': 'First Access',
      'src': 'a.created_at',
      'fmt': 'date'
    }, {
      'name': 'Action',
      'src': 'a.action_level'
    }, {
      'name': 'Code',
      'src': 'a.asset_code'
    }, {
      'name': 'Group Code',
      'src': 'a.asset_group_code'
    }, {
      'name': 'Context Type',
      'src': 'a.context_type'
    }, {
      'name': 'Context ID',
      'src': 'a.context_id'
    }, {
      'name': 'SIS Course ID',
      'src': 'c.sis_course_id',
      'sis': true
    }];
    var canSIS = false;
    for (var id in courseData) {
      if (courseData.hasOwnProperty(id)) {
        if (typeof courseData[id].sis_course_id !== 'undefined' && courseData[id].sis_course_id) {
          canSIS = true;
          break;
        }
      }
    }
    var CRLF = '\r\n';
    var hdr = [];
    fields.map(function(e) {
      if (typeof e.sis === 'undefined' || (e.sis && canSIS)) {
        hdr.push(e.name);
      }
    });
    var t = hdr.join(',') + CRLF;
    var item,
      user,
      course,
      userId,
      fieldInfo,
      value,
      field;
    var fieldRegex = new RegExp('^([au])[.](.*)$');
    for (var i = 0; i < accessData.length; i++) {
      item = accessData[i].asset_user_access;
      userId = item.user_id;
      user = userData[userId];
      course = courseData[item.course_id];
      for (var j = 0; j < fields.length; j++) {
        if (typeof fields[j].sis !== 'undefined' && fields[j].sis && !canSIS) {
          continue;
        }
        fieldInfo = fields[j].src.split('.');
        field = fieldInfo[1];
        switch (fieldInfo[0]) {
          case 'a':
            value = item[field];
            break;
          case 'c':
            value = course[field];
            break;
          case 'u':
            value = user[field];
            break;
        }
        if (value === null) {
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
    var d = '';
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

  function errorHandler(e) {
    console.log(e);
    alert(e.message);
  }
})();
