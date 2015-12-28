/**
* @fileoverview This Google Sheets script will count the number of discussion posts and all discussions in a Canvas course
* @author james@richland.edu [James Jones]
* @license Copyright 2015 Standard ISC License
* @OnlyCurrentDoc
*/

function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Canvas')
  .addItem('Specify Course', 'getCourseDialog')
  .addItem('Refresh All Discussions', 'discussionCounts')
  .addItem('Append New Discussions', 'discussionPartialCounts')
  .addSeparator()
  .addItem('Configure API Settings', 'configurationDialog')
  .addItem('Forget API Settings', 'resetApiSettings')
  .addSeparator()
  .addItem('Show Help', 'helpDialog')
  .addToUi();
  return;
}

function dethreadList(entries, e) {
  for (var i = 0; i < e.length; i++) {
    var entry = e[i];
    if (typeof entry.deleted == 'undefined' || entry.deleted === false) {
      entries.push({
        'id' : entry.id, 
        'userId' : entry.user_id
      });
    }
    if (typeof entry.replies !== 'undefined') {
      dethreadList(entries, entry.replies);
    }
  }
  return entries;
}

function getCourseEnrollments(courseId) {
  // Fetch list of students
  var students = {};
  var roleRegex = new RegExp('^(.*)Enrollment$');
  try {
    var opts = {
      ':course_id' : courseId,
      'include': ['enrollments'],
      //      'enrollment_type': ['student','teacher','ta'],
      'enrollment_state': ['active','completed']
    };
    var studentList = canvasAPI('GET /api/v1/courses/:course_id/users', opts);
    if (typeof studentList === 'undefined')  {
      throw ('Unable to obtain list of students');
    }
    
    for (var i = 0; i < studentList.length; i++) {
      var user = studentList[i];
      var userId = user.id;
      var role = 'Student';
      var status = 'completed';
      if (typeof user.enrollments !== 'undefined') {
        for (var k = 0; k < user.enrollments.length; k++) {
          var enrollment = user.enrollments[k];
          var roleMatch = roleRegex.exec(enrollment.role);
          if (roleMatch != null) {
            if (k ==0 || roleMatch[1] != 'Student') {
              role = roleMatch[1];
              status = enrollment.enrollment_state;
            }
          }
        }
      }
      students[userId] = {
        'id' : userId,
        'name' : user.sortable_name || user.name,
        'login': user.login_id || '',
        'sisid': user.sis_user_id || '',
        'role': role,
        'status' : status
      };
    }
  } catch(e) {
    Logger.log(e);
    return;
  }
  return students;
}

function discussionPartialCounts() {
  discussionCounts(false);
}

function discussionCounts(clearFirst) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (typeof ss === 'undefined') {
      throw 'No active spreadsheet';
    }
    var userProperties = PropertiesService.getUserProperties();
    var courseId = userProperties.getProperty('courseid');
    if (typeof courseId === 'undefined' || !courseId) {
      throw 'You must specify the course ID before you can analyze the discussions.';
    }
    var courseName = userProperties.getProperty('coursename') || '';
    var dsheet = ss.getSheetByName('Data');
    if (dsheet == null) {
      ss.insertSheet('Data', 0);
      dsheet = ss.getSheetByName('Data');
    }
    if (typeof clearFirst === 'undefined' || clearFirst) {
      dsheet.clear();
    }
    else {
      clearFirst = false;
    }
    if (dsheet === null) {
      throw 'Unable to create "Data" sheet';
    }
    
    // Fetch list of discussions
    var discussionList = canvasAPI(
      'GET /api/v1/courses/:course_id/discussion_topics', {
        ':course_id' : courseId
      }, [ 'id', 'title', 'published' ]);
    if (typeof discussionList === 'undefined') {
      throw ('Unable to obtain list of discussions');
    }
    var hasHeader = dsheet.getLastRow() > 0 ? true : false;
    var existingDiscussions = [];
    if (hasHeader) {
      var lastId = 0;
      var topicIds = dsheet.getRange(2,7,dsheet.getLastRow()-1).getValues();
      for (var i = 0 ; i < topicIds.length; i++) {
        var usedTopicId = topicIds[i][0];
        if (usedTopicId != lastId && existingDiscussions.indexOf(usedTopicId) == -1) {
          existingDiscussions.push(Number(usedTopicId));
        }
        lastId = usedTopicId;
      }
    }
    var discussions = {};
    var discussionCount = 0;
    for (var col = 0; col < discussionList.length; col++) {
      var discussionId = discussionList[col].id;
      if (discussionList[col].published && existingDiscussions.indexOf(discussionId) == -1) {
        discussions[discussionId] = {
          'id' : discussionId,
          'name' : discussionList[col].title
        };
        discussionCount++;
      }
    }
    
    var users = getCourseEnrollments(courseId);
    for ( var topicId in discussions) {
      if (discussions.hasOwnProperty(topicId)) {
        var discussionItems = canvasAPI(
          'GET /api/v1/courses/:course_id/discussion_topics/:topic_id/view',
          {
            ':course_id' : courseId,
            ':topic_id' : topicId
          }, [ 'view' ]);
        
        if (typeof discussionItems !== 'undefined') {
          var j = discussions[topicId].k;
          var entries = [];
          entries = dethreadList(entries, discussionItems.view);
          var counts = {};
          for (var entry = 0; entry < entries.length; entry++) {
            var userId = entries[entry].userId;
            if (typeof users[userId] !== 'undefined') {
              if (typeof counts[userId] === 'undefined') {
                counts[userId] = 1;
              }
              else {
                counts[userId]++;
              }
            }
          }
          for ( var userId in counts) {
            if (counts.hasOwnProperty(userId)) {
              var user = users[userId];
              var item = [user.name,discussions[topicId].name,counts[userId],user.role,user.status,userId,topicId,courseId,courseName];
              addRow(item);
            }
          }
          
        }
      }
    }
  } catch (e) {
    Logger.log(e);
    return;
  }
  return;
  function addRow(item) {
    if (!hasHeader) {
      dsheet.appendRow(['User','Discussion','Count','Role','Status','UserID','DiscussionId','CourseId','CourseName']);
      dsheet.getRange(1,1,1,9).setFontWeight('bold');
      dsheet.getRange(1,3).setHorizontalAlignment('right');
      dsheet.getRange(1,6,1,3).setHorizontalAlignment('right');
      dsheet.setFrozenRows(1);
      hasHeader = true;
    }
    dsheet.appendRow(item);
  }
}

function helpDialog() {
  var html = HtmlService.createTemplateFromFile('help').evaluate()
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  var props = SpreadsheetApp.getUi().showModalDialog(html,'Count Discussion Posts');
  return;
}

function getCourseDialog() {
  try {
    var ui = SpreadsheetApp.getUi();
    var settings = getApiSettings();
    if (settings === false) {
      ui.alert('API Settings not configured', 'You must configure your API settings before trying to specify the course');
      return false;
    }
    var userProperties = PropertiesService.getUserProperties();
    var msg = 'Specify the Canvas Course ID for your course.\n\nYou may enter this as an integer or you may paste a URL from your course into the box.\nThe URL should look like this:\n https://' + settings.host + '/courses/123\n \n';
    var btnset = ui.ButtonSet.OK;
    var savedCourseId = userProperties.getProperty('courseid').trim();
    if (typeof savedCourseId !== 'undefined') {
      if (/^[0-9]+$/.test(savedCourseId)) {
        var savedCourse = canvasAPI('GET /api/v1/courses/' + savedCourseId );
        if (typeof savedCourse !== 'undefined') {
          msg += 'Press Cancel to keep the current information.\nCourse ID : ' + savedCourse.id + '\nCourse name: ' + savedCourse.name + '\n \n';
          btnset = ui.ButtonSet.OK_CANCEL;
        }
      }
      else {
        userProperties.deleteProperty('courseid');
      }
    }
    var response = ui.prompt('Specify Course ID', msg, btnset);
    if (response.getSelectedButton() == ui.Button.OK) {
      var txt = response.getResponseText().trim();
      txt = txt.trim();
      var courseId;
      var courseRegex = new RegExp('^https://.*/courses/([0-9]+)','i');
      var match = courseRegex.exec(txt);
      if (match) {
        courseId = match[1];
      }
      else if (/^[0-9]+$/.test(txt)) {
        courseId = txt;
      }
      if (typeof courseId !== 'undefined' && courseId) {
        var course;
        if (typeof savedCourseId !== 'undefined' && courseId == savedCourseId) {
          course = savedCourse;
        }
        else {
          course = canvasAPI('GET /api/v1/courses/' + courseId );
        }
        if (typeof course !== 'undefined') {
          var proceed = ui.alert(course.name,'Course ID : ' + course.id + '\nCourse name: ' + course.name + '\n\nWould you like to proceed?',ui.ButtonSet.YES_NO);
          if (proceed == ui.Button.YES) {
            userProperties.setProperty('courseid', courseId);
            userProperties.setProperty('coursename', course.name);
          }
        }
        else {
          ui.alert('Unknown Course','Your input looks like it should be a course, but Canvas does not return any information about it.',ui.ButtonSet.OK);
        }
      }
      else {
        ui.alert('Bad Input','I was unable to determine your Canvas Course ID.',ui.ButtonSet.OK);
      }
    }
  } catch(e) {
    Logger.log(e)
    return;
  }
  return;
}
