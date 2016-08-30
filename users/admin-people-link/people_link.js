/*
 * This script can be added to your Canvas custom JavaScript file
 * It will add a "People" link to the course search page
 */
(function() {
  var locationRegex = new RegExp('^/accounts/[0-9]+(/?$|/courses)');
  if (!locationRegex.test(window.location.pathname)) {
    return;
  }
  var courseIdRegex = new RegExp('^course_([0-9]+)$');
  var items = document.querySelectorAll('div#content > ul.courses > li');
  if (items) {
    for (var i = 0; i < items.length; i++) {
      var match = courseIdRegex.exec(items[i].id);
      if (match) {
        var courseId = match[1];
        var span = items[i].querySelector('div.info > span.links');
        if (span) {
          var spacer = document.createTextNode(' | ');
          span.appendChild(spacer);
          var link = document.createElement('a');
          link.href = '/courses/' + courseId + '/users';
          link.textContent = 'People';
          span.appendChild(link);
        }
      }
    }
  }
})();
