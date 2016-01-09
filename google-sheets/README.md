# Google Sheets
Google Sheets are a way to pull information from Canvas and put it into a spreadsheet.

## Available Spreadsheets
* [List Canvas Admins](list-admins) generates a list of all users with administrative rolls for your accounts, including sub-accounts. The name, login, role, subaccount name, parent account name, and root account name are returned. You can return a list of admins for the entire account, including the root account admins, or just the subaccounts.
* [Discussion Counts](discussion-counts) counts the number of posts to each discussion in a course for each student.
* [Due Dates](due-dates) allows you to modify all of the due dates for a course from a single page.

## Code
This folder contains the code necessary to run the Google Sheets.

The code is included in the Google Sheet when you download it, but this creates a common repository for finding the latest version rather than having to worry about whether or not you have the latest code.

Every spreadsheet will need [canvasAPI.gs](canvasAPI.gs) and [canvasConfig.html](canvasConfig.html). The canvasAPI.gs sheet contains code for calling the API and for configuring the API settings. The canvasConfig.html file is a web form that asks for the Canvas instance and token.

Currently, you can only specify a token. The whole developer key / oAuth2 workflow is not supported at this time.

In addition, each spreadsheet should have at least one additional script that does the actual work. It will contain a function onOpen() that adds a menu to Google Sheets. The configurationDialog() and resetApiSettings() are contained in canvasAPI.gs.

```javascript
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Canvas')
  .addItem('List All Admins', 'listAdmins')
  .addItem('List Only Sub-Account Admins', 'listSubAdmins')
  .addSeparator()
  .addItem('Configure API Settings', 'configurationDialog')
  .addItem('Forget API Settings', 'resetApiSettings')
  .addToUi();
  return;
}
```
