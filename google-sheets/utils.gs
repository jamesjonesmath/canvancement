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
