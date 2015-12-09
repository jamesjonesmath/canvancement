# Google Sheets
Google Sheets are a way to pull information from Canvas and put it into a spreadsheet.

## Available Spreadsheets

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
