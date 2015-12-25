function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Canvas')
  .addItem('Discussion Counts', 'discussionCounts')
  .addSeparator()
  .addItem('Configure API Settings', 'configurationDialog')
  .addItem('Forget API Settings', 'resetApiSettings')
  .addToUi();
  return;
}

function discussionCounts() {
	try {
		var ss = SpreadsheetApp.getActiveSpreadsheet();
		if (typeof ss === 'undefined') {
			throw 'No active spreadsheet';
		}
		var sheet = ss.getSheetByName('Setup');
		if (sheet === null) {
			throw 'You must have a sheet called "Setup" with a course_id in cell A1';
		}
		var range = sheet.getRange(1, 1, 2, 1);
		var courseId = range.getCell(1, 1).getValue();
		if (!courseId) {
			throw 'You must specify a course_id in cell A1 of a sheet called "Setup"';
		}
		var includeCompleted = range.getCell(2, 1).getValue();
		var dsheet = ss.getSheetByName('Data');
		if (dsheet !== null) {
			ss.deleteSheet(dsheet);
		}
		ss.insertSheet('Data', 0);
		dsheet = ss.getSheetByName('Data');
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
		var discussions = {};
		var discussionCount = 0;
		for (var col = 0; col < discussionList.length; col++) {
			var discussionId = discussionList[col].id;
			if (discussionList[col].published) {
				discussions[discussionId] = {
					'id' : discussionId,
					'n' : 0,
					'k' : col,
					'name' : discussionList[col].title
				};
				discussionCount++;
			}
		}

		// Fetch list of students
		var opts = {
			':course_id' : courseId,
			'enrollment_type' : 'student'
		};
		if (includeCompleted) {
			opts.enrollment_state = [ 'active', 'completed' ];
		}
		var studentList = canvasAPI('GET /api/v1/courses/:course_id/users',
				opts, [ 'id', 'sortable_name' ]);
		if (typeof studentList === 'undefined') {
			throw ('Unable to obtain list of students');
		}
		var students = {};
		var D = [];
		for (var row = 0; row < studentList.length; row++) {
			var userId = studentList[row].id;
			students[userId] = {
				'id' : userId,
				'n' : 0,
				'k' : row,
				'name' : studentList[row].sortable_name
			};
			D[row] = [];
			for (var j = 0; j < discussionCount; j++) {
				D[row][j] = 0;
			}
		}
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
					var view = discussionItems.view;
					for (var entry = 0; entry < view.length; entry++) {
						var userId = view[entry].user_id;
						if (typeof students[userId] !== 'undefined') {
							var i = students[userId].k;
							D[i][j]++;
							students[userId].n++;
							discussions[topicId].n++;
						}
						if (typeof view[entry].replies !== 'undefined') {
							for (var replyEntry = 0; replyEntry < view[entry].replies.length; replyEntry++) {
								var replyUserId = view[entry].replies[replyEntry].user_id;
								if (typeof students[replyUserId] !== 'undefined') {
									var i = students[replyUserId].k;
									D[i][j]++;
									students[replyUserId].n++;
									discussions[topicId].n++;
								}
							}
						}
					}
				}
			}
		}
		header = [ '' ];
		footer = [ 'Total' ];
		var sum = 0;
		for ( var topicId in discussions) {
			if (discussions.hasOwnProperty(topicId)) {
				header.push(discussions[topicId].name);
				footer.push(discussions[topicId].n);
				sum += discussions[topicId].n;
			}
		}
		header.push('Total');
		footer.push(sum);
		dsheet.appendRow(header);
		for ( var userId in students) {
			if (students.hasOwnProperty(userId)) {
				var dataRow = [ students[userId].name ];
				var i = students[userId].k;
				for ( var topicId in discussions) {
					if (discussions.hasOwnProperty(topicId)) {
						var j = discussions[topicId].k;
						dataRow.push(D[i][j]);
						j++;
					}
				}
				dataRow.push(students[userId].n);
				dsheet.appendRow(dataRow);
				i++;
			}
		}
		dsheet.appendRow(footer);
	} catch (e) {
		Logger.log(e);
		return;
	}
	return;
}
