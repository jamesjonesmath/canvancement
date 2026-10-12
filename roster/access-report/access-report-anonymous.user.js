// ==UserScript==
// @name        Access Report Data Anonymous
// @namespace   https://github.com/jamesjonesmath/canvancement
// @description Generates a .CSV download of the access report for all students using anonymized user data
// @match       https://*.instructure.com/courses/*/users
// @version     12
// @grant       none
// ==/UserScript==
(function () {
  'use strict';

  // Some software doesn't like spaces in the headings. headingSpaces replaces
  // them: '' removes them and '_' turns them into underscores.
  var headingSpaces = ' ';

  // Viewing a student's profile page now counts as a participation.
  // This can confuse the faculty when student names show up as titles.
  // By default these are now removed from the data before downloading
  // Set showViewStudent = true to include these views in the data
  var showViewStudent = false;

  // The most usage requests to have running at one time
  var maxConcurrent = 10;

  var userData = {};
  var accessData = [];
  var fetched = 0;
  var needsFetched = 0;
  var controller = null;
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
        li.appendChild(anchor);
        parent.appendChild(li);
        activateLink();
      }
    }
  }

  function activateLink() {
    document
      .getElementById('jj_access_report')
      .addEventListener('click', accessReport, { once: true });
  }

  function abortAll() {
    aborted = true;
    controller.abort();
    activateLink();
  }

  function accessReport() {
    aborted = false;
    controller = new AbortController();
    userData = {};
    accessData = [];
    fetched = 0;
    needsFetched = 0;
    var courseId = getCourseId();
    var url = `/api/v1/courses/${courseId}/sections?include[]=students&per_page=100`;
    progressbar();
    progressMessage('Fetching enrollments');
    getStudents(url)
      .then(function () {
        return getAccessReport(courseId);
      })
      .then(makeReport)
      .catch(function (e) {
        // Cancel already closed the dialog and reset the link
        if (!aborted) {
          document.getElementById('jj_progress_dialog').close();
          activateLink();
          errorHandler(e);
        }
      });
  }

  function getJson(url) {
    var options = {
      headers: {
        accept: 'application/json',
      },
      credentials: 'same-origin',
      signal: controller.signal,
    };
    return fetch(url, options).then(function (res) {
      if (!res.ok) {
        throw new Error(`Got an HTTP status of ${res.status} for ${url}`);
      }
      var next = nextURL(res.headers.get('link'));
      return res.json().then(function (data) {
        return { data: data, next: next };
      });
    });
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

  function getStudents(url) {
    return getJson(url).then(function (res) {
      for (var i = 0; i < res.data.length; i++) {
        var section = res.data[i];
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
      if (res.next) {
        return getStudents(res.next);
      }
    });
  }

  // Runs maxConcurrent workers, each taking the next student off the list
  function getAccessReport(courseId) {
    var ids = Object.keys(userData);
    if (ids.length > randomData.length) {
      throw new Error(
        `There are ${ids.length} students, but only ${randomData.length} anonymous names. Add more names to randomData.`
      );
    }
    needsFetched = ids.length;
    progressMessage('Fetching access reports');
    progressbar(fetched, needsFetched);
    var workers = [];
    for (var i = 0; i < maxConcurrent; i++) {
      workers.push(nextStudent());
    }
    return Promise.all(workers);

    function nextStudent() {
      if (aborted || ids.length === 0) {
        return Promise.resolve();
      }
      var url = `/courses/${courseId}/users/${ids.shift()}/usage?per_page=100`;
      return getAccesses(url)
        .catch(function (e) {
          if (aborted) {
            throw e;
          }
          console.log(`Some access report data failed to load: ${e.message}`);
        })
        .then(function () {
          fetched++;
          progressbar(fetched, needsFetched);
          return nextStudent();
        });
    }
  }

  function getAccesses(url) {
    return getJson(url).then(function (res) {
      accessData.push.apply(accessData, res.data);
      if (res.next) {
        return getAccesses(res.next);
      }
    });
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
    // Requests that finished just before Cancel still end up here
    if (aborted) {
      return;
    }
    anonymizeUsers();
    progressbar();
    var csv = createCSV();
    // A byte order mark tells Excel the file is UTF-8, which only matters
    // when something in it isn't ASCII
    var bom = /[\u0080-\uffff]/.test(csv) ? '\ufeff' : '';
    var blob = new Blob([bom, csv], {
      type: 'text/csv;charset=utf-8',
    });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'access-report.csv';
    link.click();
    setTimeout(function () {
      URL.revokeObjectURL(link.href);
    }, 1000);
    activateLink();
  }

  function createCSV() {
    var fields = [
      {
        name: 'User ID',
        src: 'u.id',
      },
      {
        name: 'Display Name',
        src: 'u.name',
      },
      {
        name: 'Sortable Name',
        src: 'u.sortable_name',
      },
      {
        name: 'Category',
        src: 'a.asset_category',
      },
      {
        name: 'Class',
        src: 'a.asset_class_name',
      },
      {
        name: 'Title',
        src: 'a.readable_name',
      },
      {
        name: 'Views',
        src: 'a.view_score',
      },
      {
        name: 'Participations',
        src: 'a.participate_score',
      },
      {
        name: 'Last Access',
        src: 'a.last_access',
        fmt: 'date',
      },
      {
        name: 'First Access',
        src: 'a.created_at',
        fmt: 'date',
      },
      {
        name: 'Action',
        src: 'a.action_level',
      },
      {
        name: 'Code',
        src: 'a.asset_code',
      },
      {
        name: 'Group Code',
        src: 'a.asset_group_code',
      },
      {
        name: 'Context Type',
        src: 'a.context_type',
        disabled: true,
      },
      {
        name: 'Login ID',
        src: 'u.login_id',
      },
      {
        name: 'SIS Login ID',
        src: 'u.sis_login_id',
        sis: true,
      },
      {
        name: 'SIS User ID',
        src: 'u.sis_user_id',
        sis: true,
      },
      {
        name: 'Section',
        src: 'u.section_name',
      },
      {
        name: 'Section ID',
        src: 'u.section_id',
      },
      {
        name: 'SIS Section ID',
        src: 'u.sis_section_id',
        sis: true,
      },
      {
        name: 'Course ID',
        src: 'a.context_id',
      },
      {
        name: 'SIS Course ID',
        src: 'u.sis_course_id',
        sis: true,
      },
    ];
    fields = fields.filter(function (f) {
      return !f.disabled;
    });
    var canSIS = false;
    for (var id in userData) {
      if (userData.hasOwnProperty(id)) {
        if (
          typeof userData[id].sis_user_id !== 'undefined' &&
          userData[id].sis_user_id
        ) {
          canSIS = true;
          break;
        }
      }
    }
    var CRLF = '\r\n';
    var hdr = [];
    fields.forEach(function (e) {
      if (typeof e.sis === 'undefined' || (e.sis && canSIS)) {
        hdr.push(e.name.replaceAll(' ', headingSpaces));
      }
    });
    var rows = [hdr.join(',')];
    var item, user, userId, fieldInfo, value, row;
    for (var i = 0; i < accessData.length; i++) {
      item = accessData[i].asset_user_access;
      if (
        (typeof showViewStudent === 'undefined' || !showViewStudent) &&
        item.asset_category == 'roster' &&
        item.asset_class_name == 'student_enrollment'
      ) {
        continue;
      }
      userId = item.user_id;
      user = userData[userId];
      row = [];
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
          value = addQuotes(value);
        }
        row.push(value);
      }
      rows.push(row.join(','));
    }
    // The empty string ends the file with a line break
    rows.push('');
    return rows.join(CRLF);
  }

  function addQuotes(value) {
    if (typeof value === 'string') {
      // Keep a spreadsheet from treating text as a formula
      if (/^[=+\-@\t\r]/.test(value)) {
        value = `'${value}`;
      }
      if (/[",\r\n]/.test(value)) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
    }
    return value;
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
      var dPart = [
        dt.getFullYear(),
        pad(1 + dt.getMonth()),
        pad(dt.getDate()),
      ].join('-');
      var tPart = [
        pad(dt.getHours()),
        pad(dt.getMinutes()),
        pad(dt.getSeconds()),
      ].join(':');
      d = `${dPart} ${tPart}`;
    } catch (e) {
      errorHandler(e);
    }
    return d;

    function pad(n) {
      return n < 10 ? `0${n}` : n;
    }
  }

  function progressbar(x, n) {
    if (typeof x === 'undefined' || typeof n == 'undefined') {
      var dialog = document.getElementById('jj_progress_dialog');
      if (!dialog) {
        dialog = document.createElement('dialog');
        dialog.id = 'jj_progress_dialog';
        dialog.setAttribute('aria-labelledby', 'jj_progress_title');
        dialog.style.width = '25em';
        dialog.innerHTML = [
          '<h3 id="jj_progress_title">Access Report Data</h3>',
          // The message labels the bar and is read out when it changes
          '<label for="jj_progressbar" id="jj_progress_message"',
          ' aria-live="polite"></label>',
          '<div style="display: flex; align-items: center; gap: 0.5em;">',
          '<progress id="jj_progressbar" style="flex: 1;"></progress>',
          // Hidden from screen readers, which get the percentage from the bar
          '<span id="jj_progress_percent" aria-hidden="true"',
          ' style="min-width: 3em; text-align: right;"></span>',
          '</div>',
          '<p style="text-align: right;">',
          '<button type="button" class="btn">Cancel</button></p>',
        ].join('');
        dialog.querySelector('button').addEventListener('click', function () {
          dialog.close();
          abortAll();
        });
        // Esc closes a native dialog, so treat it the same as Cancel
        dialog.addEventListener('cancel', abortAll);
        document.body.appendChild(dialog);
      }
      if (dialog.open) {
        dialog.close();
      } else {
        document.getElementById('jj_progressbar').removeAttribute('value');
        document.getElementById('jj_progress_percent').textContent = '';
        dialog.showModal();
      }
    } else {
      if (!aborted) {
        var bar = document.getElementById('jj_progressbar');
        var percent = document.getElementById('jj_progress_percent');
        if (n > 0) {
          bar.max = n;
          bar.value = x;
          percent.textContent = `${Math.round((100 * x) / n)}%`;
        } else {
          bar.removeAttribute('value');
          percent.textContent = '';
        }
      }
    }
  }

  function progressMessage(msg) {
    document.getElementById('jj_progress_message').textContent = msg;
  }

  function errorHandler(e) {
    console.log(`${e.name}: ${e.message}`);
    alert(e.message);
  }

  // These names anonymize the user list so that you can make videos.
  // There must be at least as many names as students.
  // The list of names came from namethingy.com
  var randomData = [
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
    'Zillion Stick',
  ];

  function anonymizeUsers() {
    var nameData = shuffle(randomData.slice());
    var userIds = [];
    var sisIds = [];
    var userNames = {};
    var i = 0;
    for (var id in userData) {
      if (userData.hasOwnProperty(id)) {
        var name = nameData[i++];
        var names = name.split(' ');
        var login = `${names[0].charAt(0)}${names[1]}`;
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
        userData[id].sortable_name = `${names[1]}, ${names[0]}`;
        userData[id].short_name = name;
        userData[id].sis_user_id = sisId;
        userData[id].sis_login_id = login;
        userData[id].login_id = login;
      }
    }
    if (typeof showViewStudent !== 'undefined' && showViewStudent) {
      for (var j = 0; j < accessData.length; j++) {
        if (
          accessData[j].asset_user_access.asset_category == 'roster' &&
          accessData[j].asset_user_access.asset_class_name ==
            'student_enrollment'
        ) {
          var userName = accessData[j].asset_user_access.readable_name;
          if (typeof userNames[userName] !== 'undefined') {
            accessData[j].asset_user_access.readable_name = userNames[userName];
          }
        }
      }
    }
    function shuffle(A) {
      var m = A.length,
        t,
        i;
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
