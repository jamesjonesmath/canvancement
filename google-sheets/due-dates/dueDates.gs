function onOpen() {
	var ui = SpreadsheetApp.getUi();
	ui.createMenu('Canvas')
	  .addItem('Load Due Dates', 'listDueDates')
		.addItem('Save Due Dates', 'setDueDates')
		.addSeparator()
		.addItem('Reformat Dates', 'formatDueDates')
		.addItem('Configure API Settings', 'configurationDialog')
    .addItem('Forget API Settings', 'resetApiSettings')
		.addToUi();
}

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

function toIso8601(datetime) {
	if (typeof datetime == 'string') {
		return '';
	}
	return Utilities.formatDate(datetime, 'UTC', "yyyy-MM-dd'T'HH:mm:ss'Z'");
}

function getHeaders(mode, list) {
	var headerList = [ 'Title', 'Due', 'Available from', 'Available until',
			'Show Answers', 'Hide Answers', 'Published', 'Type', 'Canvas ID' ];
	var fieldList = [ 'title', 'due_at', 'unlock_at', 'lock_at',
			'show_correct_answers_at', 'hide_correct_answers_at', 'published',
			'type', 'id' ];
	var typeList = [ 1, 2, 2, 2, 3, 3, 1, 11, 1 ];
	var obj = {};
	var hdr = [];
	for (var i = 0; i < fieldList.length; i++) {
		var key = fieldList[i].split('_')[0];
		var header = {
			'name' : headerList[i],
			'field' : fieldList[i],
			'type' : typeList[i],
			'key' : key,
			'c1' : i,
		};
		if (typeof list === 'object' && Array.isArray(list)) {
			var match = false;
			for (var j = 0; j < list.length; j++) {
				if (list[j] == headerList[i]) {
					header.c2 = j;
					break;
				}
			}
		}
		hdr.push(header);
		obj[key] = header;
	}
	if (typeof mode === 'undefined' || mode == 'array') {
		return hdr;
	} else {
		return obj;
	}
}

function itemToRow(item, type) {
	var headers;
	if (typeof headers === 'undefined') {
		headers = getHeaders();
	}
	var row = [];
	for (var j = 0; j < headers.length; j++) {
		var hdr = headers[j];
		var key = hdr.key;
		var field = hdr.field;
		var value = item[field];
		if (key == 'title' && type != 'Quiz') {
			value = item.name;
		} else if (key == 'type') {
			value = type;
		} else if (key == 'published') {
			value = item.published ? 1 : 0;
		}
		if (typeof value === 'undefined') {
			row.push('');
		} else {
			if (hdr.type > 1 && hdr.type < 5) {
				var dt = fromIso8601(value);
				row.push(dt ? value : '');
			} else {
				row.push(value);
			}
		}
	}
	return row;
}

function getCourseId() {
	try {
		var ss = SpreadsheetApp.getActiveSpreadsheet();
		if (typeof ss === 'undefined') {
			throw 'No active spreadsheet';
		}
		var sheet = ss.getSheetByName('Setup');
		if (sheet === null) {
			throw 'You must have a sheet called "Setup" with a course_id in cell A1';
		}
		var courseId = sheet.getRange(1, 1).getValue();
		if (!courseId) {
			throw 'You must specify a course_id in cell A1 of a sheet called "Setup"';
		}
	} catch (e) {
		Logger.log(e);
		return;
	}
	return courseId;
}

function getDueDates(courseId) {
	var data = [];
	try {
		if (userConfiguration() === false) {
			return;
		}
		if (typeof courseId === 'undefined') {
			throw 'You must specify a course ID, which means you should not run this function directly';
		}
		var quizList = canvasAPI('GET /api/v1/courses/:course_id/quizzes', {
			':course_id' : courseId
		}, [ 'id', 'title', 'due_at', 'unlock_at', 'lock_at',
				'show_correct_answers_at', 'hide_correct_answers_at',
				'published' ]);
		if (typeof quizList !== 'undefined') {
			for (var i = 0; i < quizList.length; i++) {
				row = itemToRow(quizList[i], 'Quiz');
				data.push(row);
			}
		}
		var assignmentList = canvasAPI(
				'GET /api/v1/courses/:course_id/assignments', {
					':course_id' : courseId
				}, [ 'id', 'name', 'due_at', 'unlock_at', 'lock_at',
						'published' ]);
		if (typeof assignmentList !== 'undefined') {
			for (var i = 0; i < assignmentList.length; i++) {
				row = itemToRow(assignmentList[i], 'Assignment');
				data.push(row);
			}
		}
	} catch (e) {
		Logger.log(e);
		return;
	}
	return data;
}

function getDataSheet(create) {
	try {
		var ss = SpreadsheetApp.getActiveSpreadsheet();
		if (typeof ss === 'undefined') {
			throw 'No active spreadsheet';
		}
		var sheet = ss.getSheetByName('Setup');
		if (sheet === null) {
			throw 'You must have a sheet called "Setup" with a course_id in cell A1';
		}
		var courseId = sheet.getRange(1, 1).getValue();
		if (!courseId) {
			throw 'You must specify a course_id in cell A1 of a sheet called "Setup"';
		}
		var dsheet = ss.getSheetByName('Data');
		if (typeof create !== 'undefined' && create) {
			if (dsheet !== null) {
				ss.deleteSheet(dsheet);
			}
			ss.insertSheet('Data', 0);
			dsheet = ss.getSheetByName('Data');
		}
		if (dsheet === null) {
			throw 'Unable to obtain "Data" sheet';
		}
	} catch (e) {
		Logger.log(e);
		return;
	}
	return dsheet;
}

function listDueDates() {
	try {
		var courseId = getCourseId();
		var existingData = getDueDates(courseId);
		if (typeof existingData === 'undefined' || existingData.length == 0) {
			throw 'No data returned. Cowardly refusing to do anything stupid.';
		}
		var dsheet = getDataSheet(1);
		var hdrs = getHeaders();
		var headers = [];
		for (var k = 0; k < hdrs.length; k++) {
			headers.push(hdrs[k].name);
		}
		dsheet.appendRow(headers);
		var dateFields = [ 'due_at', 'unlock_at', 'lock_at',
				'show_correct_answers_at', 'hide_correct_answers_at' ];
		for (var i = 0; i < existingData.length; i++) {
			var row = existingData[i];
			for (var j = 0; j < hdrs.length; j++) {
				var hdr = hdrs[j];
				if (hdr.type > 1 && hdr.type < 5) {
					var dt = fromIso8601(row[hdr.c1]);
					row[j] = dt ? dt : '';
				}
			}
			dsheet.appendRow(row);
		}
		formatDueDates();
	} catch (e) {
		Logger.log(e);
		return;
	}
	return;
}

function formatDueDates() {
	var dateFormat = 'mmm" "dd" at "hh":"mma/p';
	try {
		var dsheet = getDataSheet();
		if (dsheet.getRange(1, 1).isBlank()) {
			throw 'You have no data to process. Refusing to continue';
		}
		dsheet.setActiveRange(dsheet.getRange(1, 1));
		var range = dsheet.getDataRange();
		var rowCount = range.getNumRows() - 1;
		var colCount = range.getNumColumns();
		var rows = range.getValues();
		var sheetHeaders = rows[0];
		var headers = getHeaders('array', sheetHeaders);
		var hdrs = getHeaders('object', sheetHeaders);
		dsheet.setFrozenRows(1);

		for (var j = 0; j < headers.length; j++) {
			var hdr = headers[j];
			if (typeof hdr.c2 === 'undefined') {
				continue;
			}
			var col = 1 + hdr.c2;
			dsheet.getRange(1, col, 1 + rowCount, 1).setHorizontalAlignment(
					hdr.key == 'title' ? 'left' : 'right');
			if (hdr.type > 1 && hdr.type < 5) {
				dsheet.getRange(2, col, rowCount, 1)
						.setNumberFormat(dateFormat);
			}
			dsheet.autoResizeColumn(col);
			var autowidth = dsheet.getColumnWidth(col);
			if (hdr.key == 'title' && autowidth > 200) {
				dsheet.setColumnWidth(col, 200);
			} else {
				dsheet.setColumnWidth(col, 10 + autowidth);
			}
		}
		dsheet.getRange(1, 1, 1, colCount).setFontWeight('bold');
		dsheet.getRange(2, 1, rowCount, colCount).sort([ {
			'column' : 1 + hdrs.due.c2,
			'ascending' : true
		}, {
			'column' : 1 + hdrs.title.c2,
			'ascending' : true
		} ]);
	} catch (e) {
		Logger.log(e);
		return;
	}
	return;
}

function setDueDates() {
	try {
		if (userConfiguration() === false) {
			return;
		}
		courseId = getCourseId();
		existingData = getDueDates(courseId);
		var dsheet = getDataSheet();
		dsheet.setActiveRange(dsheet.getRange(1, 1));
		var range = dsheet.getDataRange();
		var colCount = range.getNumColumns();
		var rows = range.getValues();
		var sheetHeaders = rows[0];
		var headers = getHeaders('array', sheetHeaders);
		var hdrs = getHeaders('object', sheetHeaders);
		if (typeof hdrs.id.c2 === 'undefined') {
			throw 'You do not have Canvas IDs in here and without those, I cannot do anything.';
		}
		if (typeof hdrs.type.c2 === 'undefined') {
			throw 'You do not have a column specifying whether this is a quiz or assignment.';
		}
		var changes = [];
		for (var i = 1; i < rows.length; i++) {
			var row = rows[i];
			var canvasId = row[hdrs.id.c2];
			var type = row[hdrs.type.c2];
			if (type != 'Quiz' && type != 'Assignment') {
				throw 'The type must be Quiz or Assignment in row ' + (i + 1);
			}
			var matched = false;
			var eRow;
			for (var j = 0; j < existingData.length; j++) {
				if (existingData[j][hdrs.id.c1] == canvasId
						&& existingData[j][hdrs.type.c1] == type) {
					matched = true;
					eRow = existingData[j];
					break;
				}
			}
			if (!matched) {
				throw 'You are trying to replace a quiz/assignment that is not in the system. Look for Canvas Id: '
						+ canvasId
						+ ' in row '
						+ (i + 1)
						+ ' of the spreadsheet.';
			}

			// We have a match, now it's time to look for any changes between
			// the original and the new
			var up = {};
			var hasChanges = false;
			for (k = 0; k < headers.length; k++) {
				var key = headers[k].key;
				var hdr = hdrs[key];
				if (hdr.type > 10 || typeof hdr.c2 === 'undefined') {
					continue;
				}
				var field = hdr.field;
				var value = (hdr.type > 1 && hdr.type < 5) ? toIso8601(row[hdr.c2])
						: row[hdr.c2];
				if (value != eRow[hdr.c1]) {
					if (type == 'Quiz') {
						up[field] = value;
						hasChanges = true;
					} else {
						if (key == 'title') {
							up.name = value;
							hasChanges = true;
						} else if (hdr.type < 3) {
							up[field] = value;
							hasChanges = true;
						}
					}
				}
			}
			if (hasChanges) {
				var ltype = type.toLowerCase();
				var item = {
					':course_id' : courseId,
					':id' : canvasId,
					'type' : ltype,
				};
				for (key in up) {
					if (up.hasOwnProperty(key)) {
						var fieldname = ltype + '[' + key + ']';
						item[fieldname] = up[key];
					}
				}
				changes.push(item);
			}
		}

		if (changes.length > 0) {
			Logger.log('Making changes');
			var apicalls = {
				'assignment' : 'PUT /api/v1/courses/:course_id/assignments/:id',
				'quiz' : 'PUT /api/v1/courses/:course_id/quizzes/:id'
			};
			for (var i = 0; i < changes.length; i++) {
				var item = changes[i];
				var type = item.type;
				delete item.type;
				Logger.log(item);
				var result = canvasAPI(apicalls[type], item);
				Logger.log(result);
			}
		}
		return;
	} catch (e) {
		Logger.log(e);
		return;
	}
	return;
}
