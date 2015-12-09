/**
 * @fileoverview This Google Sheets script will provide Canvas API functionality for other scripts.
 * @author james@richland.edu [James Jones]
 * @license Copyright 2015 Standard ISC License
 * @OnlyCurrentDoc
 */

/**
 * @function This will test the API settings and try to determine the name of
 *           the user
 */
function checkApiSettings() {
  var name;
  try {
    var props = getApiSettings();
    if (props === false) {
      return false;
    }
    var ui = SpreadsheetApp.getUi();
    var profile = canvasAPI('GET /api/v1/users/self/profile');
    Logger.log(profile);
    Logger.log(ui);
    if (typeof profile === 'undefined') {
      var mesg = 'Unable to connect to ' + props.host;
      ui.alert('Failure', mesg, ui.ButtonSet.OK);
      throw mesg;
    }
    name = profile.name ? profile.name : 'Unknown User';
    ui.alert('Success!', 'Connected to ' + props.host + ' as ' + name
        + '\nYou may now use the API calls.', ui.ButtonSet.OK);
  } catch (e) {
    Logger.log(e);
    return;
  }
  Logger.log('Done with checkApiSettings');
  return name;
}

/**
 * @function This opens the Configuration Dialog. This should be added to your
 *           menu
 */
function configurationDialog() {
  var html = HtmlService.createTemplateFromFile('canvasConfig').evaluate()
      .setSandboxMode(HtmlService.SandboxMode.NATIVE);
  var props = SpreadsheetApp.getUi().showModalDialog(html,
      'Canvas API Configuration');
  return;
}

/**
 * @function Process the submission from the Configuration form
 * @param {Object}
 *          formObject - the data returned by the form submission
 */
function processConfigurationForm(formObject) {
  var host = determineCanvasHost(formObject.canvas_host);
  var token = formObject.canvas_token;
  var userProperties = PropertiesService.getUserProperties();
  if (host !== false) {
    if (host != '') {
      userProperties.setProperty('host', host);
    } else {
      userProperties.deleteProperty('host');
    }
  }
  if (typeof token !== 'undefined' && token) {
    userProperties.setProperty('token', token);
  } else {
    userProperties.deleteProperty('token');
  }
  checkApiSettings();
  return;
}

/**
 * @function Tries to parse the URL and determine the Canvas Host
 * @param {String}
 *          text - The value to parse
 * @returns
 */
function determineCanvasHost(text) {
  if (typeof text === 'undefined') {
    return false;
  }
  text = text.toLowerCase().trim();
  if (text == '') {
    return '';
  }
  try {
    var ui = SpreadsheetApp.getUi();
    var hostRegex = new RegExp(
        '^(?:https:\\/\\/)?([a-z0-9][-a-z0-9]*$|[a-z0-9][-a-z0-9]*(?:\.[a-z0-9][-a-z0-9]*)+)(?:\/|$)',
        'i');
    var match = hostRegex.exec(text);
    if (match != null) {
      var value = match[1];
      if (!/[.]/.test(value)) {
        value += '.instructure.com';
      }
      if (value != text) {
        var alertResponse = ui.alert('Notice', 'Using "' + value
            + '" for your Canvas Hostname.\n'
            + ' If this is not correct, then click Cancel.',
            ui.ButtonSet.OK_CANCEL);
        if (alertResponse == ui.Button.CANCEL) {
          text = false;
        } else {
          text = value;
        }
      }
    } else {
      text = false;
      ui
          .alert(
              'Error',
              'Sorry, I did not understand what you entered for the Canvas Hostname',
              ui.ButtonSet.OK);
      throw ('Bad Hostname');
    }
  } catch (e) {
    Logger.log(e);
    return;
  }
  return text;
}

/**
 * @function This function fetches your Canvas instance and your access token.
 *           If you don't have them saved, it will prompt you for them. It uses
 *           Google's UserProperties() so it is specific to a user and a
 *           spreadsheet and sharing the spreadsheet with someone else should
 *           not transfer your credentials.
 * 
 */
function getApiSettings() {
  var required_properties = [ 'host', 'token' ];
  try {
    var userProperties = PropertiesService.getUserProperties();
    var properties = userProperties.getProperties();
    var openDialog = false;
    for (var i = 0; i < required_properties.length; i++) {
      if (typeof properties[required_properties[i]] === 'undefined') {
        openDialog = true;
      }
    }
    if (openDialog) {
      configurationDialog();
      return false;
    }
    var valid = true;
    if (typeof properties.host === 'undefined' || properties.host == '') {
      valid = false;
    }
    if (typeof properties.token === 'undefined' || properties.token == '') {
      valid = false;
    }
    if (!valid) {
      properties = false;
    }
  } catch (e) {
    Logger.log(e);
    return;
  }
  return properties;
}

/**
 * @function reset user properties
 */
function resetApiSettings() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteAllProperties();
}

/**
 * @function convert the parameters into a Query String
 * @param {Object}
 *          obj - the parameters to include
 * @returns {String} the query string
 */
function makeQueryString(obj) {
  var q = [];
  for ( var i in obj) {
    if (obj.hasOwnProperty(i)) {
      var item = obj[i];
      if (typeof item == 'object') {
        if (Array.isArray(item)) {
          for (var j = 0; j < item.length; j++) {
            q.push(i + '[]=' + item[j]);
          }
        } else {
          for ( var j in item) {
            if (item.hasOwnProperty(j)) {
              q.push(i + '[' + j + ']=' + item[j]);
            }
          }
        }
      } else {
        q.push(i + '=' + item);
      }
    }
  }
  return q.join('&');
}

/**
 * @function This function calls the CanvasAPI and returns any information as an
 *           object.
 * @param {string}
 *          endpoint - The endpoint from the Canvas API Documentation, including
 *          the GET, POST, PUT, or DELETE the /api/v1 version is optional and
 *          will add the value specified within the function as a default if not
 * @param {Object}
 *          [opts] - The parameters that need passed to the API call Variable
 *          substitution is done for values in the endpoint that begin with :
 *          SIS variables can be specified as ":sis_user_id: 123" rather than
 *          "user_id: ':sis_user_id:123'" Any other variables are added to the
 *          querystring for a GET or the payload for a PUT or POST
 * @param {Object[]}
 *          [filter] - An array containing values to return. This allows you to
 *          reduce storage by eliminating unnecessary objects
 */
function canvasAPI(endpoint, opts, filter) {
  if (typeof endpoint === 'undefined') {
    return;
  }
  if (typeof opts === 'undefined') {
    opts = {};
  }

  var PER_PAGE = 100;
  var API_VERSION = 1;

  var endpointRegex = /^(GET|POST|PUT|DELETE|HEAD)\s+(.*)$/i;
  var tokenRegex = new RegExp('^:([a-z_]+)$');
  var nextLinkRegex = new RegExp('<(.*?)>; rel="next"');
  var integerRegex = new RegExp('^[0-9]+$');

  try {
    var userProperties = getApiSettings();
    if (userProperties === false) {
      throw 'You need to specify a full set of credentials.';
    }
    var parms = { 'headers' : { 'Authorization' : 'Bearer '
        + userProperties.token }, };

    if (typeof endpoint !== 'string') {
      throw 'Endpoint specification must be a string. Received: '
          + typeof endpoint;
    }
    var endpointMatches = endpointRegex.exec(endpoint);
    if (endpointMatches === null) {
      throw 'Invalid endpoint specified: ' + endpoint;
    }
    parms.method = endpointMatches[1].toLowerCase();
    var routes = endpointMatches[2].split('/');
    var route = [];
    for (var i = 0; i < routes.length; i++) {
      if (routes[i]) {
        if (route.length == 0 && routes[i] != 'api') {
          route.push('api');
          route.push('v' + API_VERSION);
          i++;
        }
        var matches = tokenRegex.exec(routes[i]);
        if (matches !== null) {
          if (typeof opts !== 'object') {
            throw 'Options is not an object but variable substitutions is needed';
          }
          var tokens = [ routes[i], matches[1], ':sis_' + matches[1],
              'sis_' + matches[1] ];
          var tokenMatch = false;
          var j = 0;
          while (!tokenMatch && j < tokens.length) {
            var token = tokens[j++];
            if (typeof opts[token] !== 'undefined') {
              tokenMatch = true;
              route.push(opts[token]);
              opts[token] = null;
            }
          }
          if (!tokenMatch) {
            throw 'Unable to find substitution for :' + matches[1] + ' in '
                + endpointMatches[2];
          }
        } else {
          route.push(routes[i]);
        }
      }
    }
    var payload = {};
    if (typeof opts === 'object') {
      for ( var field in opts) {
        if (opts.hasOwnProperty(field) && opts[field] !== null
            && !/^:/.test(field)) {
          payload[field] = opts[field];
        }
      }
    }
    var url = 'https://' + userProperties.host + '/' + route.join('/');
    var data = []
    if (parms.method == 'get' || parms.method == 'delete') {
      if (parms.method == 'get' && !payload.per_page) {
        payload.per_page = PER_PAGE;
      }
      var queryStr = makeQueryString(payload);
      if (queryStr) {
        url += '?' + queryStr;
        url = encodeURI(url);
      }
    } else if (parms.method == 'post' || parms.method == 'put') {
      // Use JSON encoding.
      parms.headers['content-type'] = 'application/json';
      parms.payload = JSON.stringify(payload);
    }
    while (url !== null) {
      var response = UrlFetchApp.fetch(url, parms);
      url = null;
      if (response.getResponseCode() == 200) {
        var headers = response.getAllHeaders();
        if (parms.method == 'get' && typeof headers.Link !== 'undefined') {
          var links = headers.Link.split(',');
          if (typeof links === 'object') {
            for (var l = 0; l < links.length; l++) {
              var linkMatch = nextLinkRegex.exec(links[l]);
              if (linkMatch !== null) {
                url = linkMatch[1];
              }
            }
          }
        }
        var json = JSON.parse(response.getContentText());
        if (typeof json === 'object') {
          if (Array.isArray(json)) {
            for ( var item in json) {
              if (json.hasOwnProperty(item)) {
                var entry = json[item];
                if (typeof filter !== 'undefined') {
                  var row = {};
                  for ( var j in filter) {
                    if (filter.hasOwnProperty(j)) {
                      var key = filter[j];
                      if (typeof entry[key] !== 'undefined') {
                        if (Array.isArray(entry[key])) {
                          row[key] = entry[key].slice(0);
                        } else {
                          row[key] = entry[key];
                        }
                      }
                    }
                  }
                  data.push(row);
                } else {
                  data.push(entry);
                }
              }
            }
          } else {
            if (typeof filter === 'undefined') {
              data = json;
            } else {
              for ( var j in filter) {
                if (filter.hasOwnProperty(j)) {
                  var key = filter[j];
                  if (typeof json[key] !== 'undefined') {
                    if (Array.isArray(json[key])) {
                      data[key] = json[key].slice(0);
                    } else {
                      data[key] = json[key];
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (e) {
    Logger.log(e);
    return;
  }
  return data;
}

