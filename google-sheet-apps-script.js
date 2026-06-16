/**
 * Google Apps Script for Editkaro.in Website Integration
 * 
 * Instructions:
 * 1. Create a Google Sheet. Rename the first sheet tab to "Newsletter" and create a second sheet tab named "Inquiries".
 * 2. In "Newsletter", set headers in row 1: [Timestamp, Email]
 * 3. In "Inquiries", set headers in row 1: [Timestamp, Name, Email, Phone, Category, Volume, Style, Details, EstimatedPrice]
 * 4. In the menu, click Extensions > Apps Script.
 * 5. Replace any existing code with this script.
 * 6. Click Deploy > New deployment. Select "Web app".
 * 7. Change "Who has access" to "Anyone". Click Deploy.
 * 8. Copy the Web App URL and paste it as the `CONFIG.GOOGLE_SHEETS_URL` value inside `app.js`.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // 10s timeout to prevent race conditions
    
    var sheetDb = SpreadsheetApp.getActiveSpreadsheet();
    var payload = JSON.parse(e.postData.contents);
    
    var timestamp = new Date();
    
    // Check form type to direct data to correct sheet tab
    if (payload.formType === 'newsletter') {
      var sheet = sheetDb.getSheetByName("Newsletter");
      if (!sheet) {
        sheet = sheetDb.insertSheet("Newsletter");
        sheet.appendRow(["Timestamp", "Email"]);
      }
      sheet.appendRow([timestamp, payload.email]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Email logged successfully to newsletter"
      })).setMimeType(ContentService.MimeType.JSON)
         .setHeader("Access-Control-Allow-Origin", "*");
         
    } else if (payload.formType === 'intake') {
      var sheet = sheetDb.getSheetByName("Inquiries");
      if (!sheet) {
        sheet = sheetDb.insertSheet("Inquiries");
        sheet.appendRow(["Timestamp", "Name", "Email", "Phone", "Category", "Volume", "Style", "Details", "EstimatedPrice"]);
      }
      
      sheet.appendRow([
        timestamp,
        payload.name,
        payload.email,
        payload.phone || "",
        payload.category,
        payload.volume,
        payload.style,
        payload.details,
        payload.estimatedPrice
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Inquiry logged successfully"
      })).setMimeType(ContentService.MimeType.JSON)
         .setHeader("Access-Control-Allow-Origin", "*");
    } else {
      throw new Error("Invalid form type");
    }
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON)
       .setHeader("Access-Control-Allow-Origin", "*");
  } finally {
    lock.releaseLock();
  }
}

// Enable CORS Preflight Requests
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
