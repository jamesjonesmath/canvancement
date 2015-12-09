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

function getSheet(name, clear) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (typeof ss === 'undefined') {
      throw 'No active spreadsheet';
    }
    if (typeof name === 'undefined') {
      name = 'Data';
    }
    var sheet = ss.getSheetByName(name);
    if (sheet !== null && typeof clear !== 'undefined' && clear) {
      ss.deleteSheet(sheet);
      sheet = null;
    }
    if (sheet === null) {
      sheet = ss.insertSheet(name,0);
    }
    if (sheet === null) {
      throw 'Unable to obtain "' + name + '" sheet';
    }
  } catch (e) {
    Logger.log(e);
    return;
  }
  return sheet;
}

function listSubAdmins() {
  listAdmins(false);
}
function listAdmins(rootAdmins) {
  var ui = SpreadsheetApp.getUi();
  var settings = getApiSettings();
  if (settings === false) {
    return false;
  }
  try {
    var accountList = canvasAPI('GET /api/v1/accounts');
    if (typeof accountList == 'undefined') {
      throw 'Not an admin';
    }
    var sheet = getSheet('admins', true);
    var hasHeader = false;
    var accounts = {};
    for (var acctIdx = 0; acctIdx < accountList.length ; acctIdx++) {
      var rootAccount = accountList[acctIdx];
      var rootAccountId = rootAccount.id;
      accounts[rootAccountId] = {id: rootAccount.id, name: rootAccount.name};
      if (typeof rootAdmins == 'undefined' || rootAdmins) {
        var rootAdminList = canvasAPI('GET /api/v1/accounts/:account/admins', {':account': rootAccountId});
        for (var i=0; i < rootAdminList.length; i++) {
          add_user(rootAdminList[i], false, false, rootAccountId);
        }
      }
      var subaccountList = canvasAPI('GET /api/v1/accounts/:account/sub_accounts', {':account': rootAccountId, 'recursive': true});
      if (typeof subaccountList == 'undefined') {
        continue;
      }
      for (var subIdx = 0; subIdx < subaccountList.length; subIdx++) {
        var subAccount = subaccountList[subIdx];
        var subAccountId = subAccount.id;
        accounts[subAccountId] = {id: subAccount.id, name: subAccount.name};
        var adminList = canvasAPI('GET /api/v1/accounts/:account/admins', {':account': subAccountId});
        if (typeof adminList == 'undefined') {
          continue;
        }
        for (var j=0; j < adminList.length; j++) {
          add_user(adminList[j],subAccount.id, subAccount.parent_account_id, subAccount.root_account_id);
        }
      }
    }
  }
  catch (e) {
    Logger.log(e)
  }
  return;
  function add_user(admin, subAcct, parentAcct, rootAcct) {
    if (!hasHeader) {
      sheet.appendRow(['Name','Login','Role','Sub Account','Parent Account','Root Account']);
      sheet.setFrozenRows(1);
      hasHeader = true;
    }
    sheet.appendRow([admin.user.sortable_name ? admin.user.sortable_name : admin.user.name, admin.user.login_id, admin.role, subAcct ? accounts[subAcct].name : '', parentAcct ? accounts[parentAcct].name : '', rootAcct ? accounts[rootAcct].name : '']);
    return;
  }
}

