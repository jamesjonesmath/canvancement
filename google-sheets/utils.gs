/**
* @OnlyCurrentDoc
*/

/**
* @function Converts an ISO8601 timestamp into a Google time
* @params {String} timestamp - ISO8601 timestamp from Canvas
* @returns {String} Formatted Google date/time
*/
function fromIso8601(timestamp) {
  if (typeof timestamp === 'undefined' || timestamp == null) {
    return false;
  }
  var regex = /(:\d\d)Z$/;
  timestamp = timestamp.replace(regex, '$1.000Z');
  var dt = new Date(timestamp);
  if (isNaN(dt)) {
    return false;
  }
  var tz;
  if (!tz) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    tz = ss.getSpreadsheetTimeZone();
  }
  return Utilities.formatDate(dt, tz, 'yyyy-MM-dd HH:mm:ss');
}

/**
* @function Convert a Google date/time object to an ISO8601 timestamp
* @param {Object} datetime - Date object 
* @returns {String} ISO8601 timestamp
*/
function toIso8601(datetime) {
  if (typeof datetime == 'string') {
    return '';
  }
  return Utilities.formatDate(datetime, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

/**
* @function Obtain the course ID through the UI and save it into the user properties
*/
function getCourseDialog() {
  var courseId;
  try {
    var ui = SpreadsheetApp.getUi();
    var settings = getApiSettings();
    if (settings === false) {
      ui.alert('API Settings not configured', 'You must configure your API settings before trying to specify the course');
      return false;
    }
    var userProperties = PropertiesService.getUserProperties();
    var msg = 'Specify the Canvas Course ID for your course.\n\nYou may enter this as an integer or you may paste a URL from your course into the box.\nThe URL should look like this: https://' + settings.host + '/courses/123\n \n';
    var btnset = ui.ButtonSet.OK;
    var savedCourseId = userProperties.getProperty('courseid');
    if (savedCourseId) {
      savedCourseId = savedCourseId.trim();
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
      var txt = response.getResponseText();
      txt = txt.trim();
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
  return courseId;
}
