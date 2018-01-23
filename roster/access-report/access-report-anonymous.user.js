// ==UserScript==
// @name        Access Report Data Anonymous
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Generates a .CSV download of the access report for all students using anonymized user data
// @include     https://*.instructure.com/courses/*/users
// @require     https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/1.3.3/FileSaver.js
// @version     9
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
    if ($('#jj_access_report').length === 0) {
      $('#people-options > ul').append(
        '<li class="ui-menu-item" role="presentation"><a id="jj_access_report" class="ui-corner-all" role="menuitem" tabindex="-1"><i class="icon-analytics"></i> Access Report Data</a></li>');
      $('#jj_access_report').one('click', accessReport);
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
          if (section.students.length > 0) {
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
      anonymizeUsers();
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

  // This function will anonymize the user list so that you can make videos
  // To use, insert into the main enclosure, I suggest at the end, right after
  // errorHandler()
  // Then, add anonymizeUsers(); as the first line of the makeReport() function;
  // !!! This will fail if you have more users than names listed below !!!
  // The list of names came from namethingy.com
  function anonymizeUsers() {
    var randomData =
      [
        'Abnormal Code',
        'Absolute Eye',
        'Abstract Filth',
        'Absurd Fad',
        'Abundant Values',
        'Acidic Mob',
        'Addon Button',
        'Alpha Dollar',
        'American Spouse',
        'Aquatic Offer',
        'Automatic Difficulty',
        'Bent Geek',
        'Better Emotion',
        'Bizarre Ability',
        'Bleeding Rocket',
        'Broken Law',
        'Celebrity Budget',
        'Circular Wrap',
        'Clean Window',
        'Clicking Sentence',
        'Common Martyr',
        'Creative Check',
        'Cubic Dream',
        'Distant Language',
        'Doctor Stream',
        'Dynamic Creek',
        'Early Feet',
        'Eastern Card',
        'Energetic Dinner',
        'Exploding Function',
        'Fickle Goal',
        'Firm Plant',
        'First Bottle',
        'Fresh Male',
        'Friendly Vulture',
        'Frugal Widow',
        'Gifted Condition',
        'Glowing Envelope',
        'Groovy Viper',
        'Harmonic Fan',
        'Harmonious Pose',
        'Hot Spirit',
        'Imperial Profit',
        'Incurable Food',
        'Indigo Difference',
        'Innocent Paper',
        'Invisible Vamp',
        'Jolly Rule',
        'Light Eyeball',
        'Live Cat',
        'Long Elf',
        'Lost Levis',
        'Mad Fish',
        'Mini Tyrant',
        'Minute Economy',
        'Mister Flower',
        'Moist Tooth',
        'Natural Blouse',
        'Neanderthal Mix',
        'Normal Rockstar',
        'Nuclear Hotel',
        'Nutty Punk',
        'Odd Thingy',
        'Pacific State',
        'Padded Head',
        'Plastic Nut',
        'Powered Silence',
        'Precious Chaos',
        'Public Sword',
        'Puny Ego',
        'Radical Cartel',
        'Radioactive Baggage',
        'Rancid Tea',
        'Random Village',
        'Recycled Computer',
        'Red Investigation',
        'Regular Beast',
        'Rental Fashion',
        'Reptilian Bath',
        'Romantic Eyes',
        'Ruby Accolade',
        'Salty Air',
        'Second Medicine',
        'Selfish Hog',
        'Sharp Bed',
        'Shrinking Friendship',
        'Silicone Flag',
        'Skeptical Memory',
        'Skilled Brain',
        'Skinny Record',
        'Slick Space',
        'Sneaky Blame',
        'Social Tower',
        'Soggy Breakfast',
        'Solid Cash',
        'Spicy Mouse',
        'Spiritual Query',
        'Split Sanctuary',
        'Stellar Corn',
        'Stuck Reputation',
        'Suave Ship',
        'Suburban Kangaroo',
        'Super Wreck',
        'Tapered Jazz',
        'Tasty Term',
        'Tender Centipede',
        'This Rhyme',
        'Thoughtful Friction',
        'Tight Beer',
        'Ultimate Fleet',
        'Unspoken Slacker',
        'Unusual Alternative',
        'Urban Money',
        'Valid Spiral',
        'Velvet Attention',
        'Violent Pal',
        'Visiting Smell',
        'Weak Hacker',
        'Weathered College',
        'Western Chart',
        'Wet Crib',
        'Wild Father',
        'Zillion Stick' ];
    var nameData = shuffle(randomData);
    var userIds = [];
    var sisIds = [];
    var userNames = {};
    var i = 0;
    for ( var id in userData) {
      if (userData.hasOwnProperty(id)) {
        var name = nameData[i++];
        var names = name.split(' ');
        var login = names[0].substr(0, 1) + names[1];
        login = login.toLowerCase();
        var newId = 0;
        while (newId == 0 || userIds.indexOf(newId) > -1) {
          newId = 1234567 + Math.floor(100000 * Math.random());
        }
        userIds.push(newId);
        var sisId = 0;
        while (sisId == 0 || sisIds.indexOf(sisId) > -1) {
          sisId = 476246 + Math.floor(10000 * Math.random());
        }
        sisIds.push(sisId);
        userNames[userData[id].name] = name;
        userData[id].id = newId;
        userData[id].name = name;
        userData[id].sortable_name = names[1] + ', ' + names[0];
        userData[id].short_name = name;
        userData[id].sis_user_id = sisId;
        userData[id].sis_login_id = login;
        userData[id].login_id = login;
      }
    }
    if (typeof showViewStudent !== 'undefined' && showViewStudent) {
      for (var j = 0; j < accessData.length; j++) {
        if (accessData[j].asset_user_access.asset_category == 'roster' && accessData[j].asset_user_access.asset_class_name == 'student_enrollment') {
          var userName = accessData[j].asset_user_access.readable_name;
          if (typeof userNames[userName] !== 'undefined') {
            accessData[j].asset_user_access.readable_name = userNames[userName];
          }
        }
      }
    }
    function shuffle(A) {
      var m = A.length, t, i;
      while (m) {
        i = Math.floor(Math.random() * m--);
        t = A[m];
        A[m] = A[i];
        A[i] = t;
      }
      return A;
    }
  }
})();
