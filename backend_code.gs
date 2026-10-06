/**
 * ============================================================================
 * KAITHANGU / OURSUPPORT.IN — GOOGLE APPS SCRIPT BACKEND ENGINE
 * 100% Free & Serverless Cloud Database for All 7 Services
 * ============================================================================
 * 
 * HOW TO DEPLOY (2 MINUTES):
 * 1. Open your Google Drive (drive.google.com).
 * 2. Click "+ New" -> "Google Sheets" -> Name it "OurSupport_Central_Database".
 * 3. In the menu, click "Extensions" (എക്സ്റ്റൻഷൻസ്) -> "Apps Script".
 * 4. Delete any code in Code.gs and paste THIS ENTIRE FILE.
 * 5. Click "Deploy" (ഡിപ്ലോയ്) -> "New deployment".
 * 6. Select type: "Web app".
 * 7. Set:
 *    - Description: "OurSupport Central API"
 *    - Execute as: "Me" (നിങ്ങളുടെ ഇമെയിൽ)
 *    - Who has access: "Anyone" (ഏവർക്കും അപേക്ഷിക്കാൻ)
 * 8. Click "Deploy" -> Authorize access.
 * 9. Copy the "Web app URL" (starts with https://script.google.com/macros/s/...)
 * 10. Paste that URL into the CLOUD_URL in `cloud_db.js`.
 * 
 * ALL 7 SERVICES ARE AUTOMATICALLY CREATED AND MANAGED IN SEPARATE TABS!
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var rawData = e.postData ? e.postData.contents : "{}";
    var payload = JSON.parse(rawData);
    
    var service = payload.service || "general";
    var type = payload.type || "request";
    var data = payload.data || {};
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = getSheetName(service, type);
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      setupHeaders(sheet, sheetName);
    }
    
    var row = formatRow(sheetName, data);
    sheet.appendRow(row);
    
    // If emergency or urgent blood request, send instant Gmail alert to admin
    if (service === "emergency" || (service === "health" && data.type === "blood")) {
      sendEmailAlert(service, data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      ref: data.id || "",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var p = e.parameter || {};
    var service = p.service;
    var phone = p.phone;
    var ref = p.ref;
    
    if (!service) {
      return ContentService.createTextOutput(JSON.stringify({ status: "alive", name: "OurSupport API" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = getSheetName(service, p.type || "request");
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ status: "empty", records: [] })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ status: "empty", records: [] })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = data[0];
    var records = [];
    
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = row[j];
      }
      
      // Filter by phone or ref if provided
      if (phone && String(rowObj["Phone"] || "").indexOf(phone) === -1) continue;
      if (ref && String(rowObj["Reference"] || "").indexOf(ref) === -1) continue;
      
      records.push(rowObj);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      count: records.length,
      records: records
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetName(service, type) {
  var map = {
    "matrimony_profile": "Matrimony_Profiles",
    "matrimony_interest": "Matrimony_Interests",
    "education_request": "Education_Requests",
    "jobs_seeker": "Job_Seekers",
    "jobs_employer": "Job_Postings",
    "health_request": "Health_Requests",
    "health_donor": "Health_Blood_Donors",
    "health_camp": "Health_Medical_Camps",
    "legal_request": "Legal_Requests",
    "support_request": "Support_Requests",
    "support_volunteer": "Support_Volunteers",
    "emergency_request": "Emergency_Triage",
    "emergency_offer": "Emergency_Help_Offers"
  };
  var key = service + "_" + type;
  return map[key] || (service.toUpperCase() + "_" + type.toUpperCase());
}

function setupHeaders(sheet, sheetName) {
  var headers = ["Timestamp", "Reference", "Status", "District", "Name", "Phone"];
  
  if (sheetName.indexOf("Matrimony") !== -1) {
    headers.push("Gender", "Age", "Education", "Job", "MaritalStatus", "About", "PhotoData");
  } else if (sheetName.indexOf("Education") !== -1) {
    headers.push("Age", "Class", "Type", "GuardianName", "GuardianPhone", "Details");
  } else if (sheetName.indexOf("Job_Seekers") !== -1) {
    headers.push("Age", "Education", "Skills", "PreferredSector", "ExperienceYears");
  } else if (sheetName.indexOf("Job_Postings") !== -1) {
    headers.push("Organisation", "ContactPerson", "JobTitle", "Pay", "HowToApply");
  } else if (sheetName.indexOf("Blood") !== -1) {
    headers.push("BloodGroup", "Age", "UnitsNeeded", "Hospital", "Urgency");
  } else if (sheetName.indexOf("Emergency") !== -1) {
    headers.push("Urgency", "Location", "PeopleCount", "NeedCategory", "Details");
  } else if (sheetName.indexOf("Volunteer") !== -1) {
    headers.push("Age", "Availability", "Skills", "BackgroundCheckConsent");
  } else {
    headers.push("Category", "Details", "Notes");
  }
  
  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#12504B");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function formatRow(sheetName, d) {
  var now = new Date();
  var ts = Utilities.formatDate(now, "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
  var ref = d.id || d.ref || "";
  var status = d.status || "New";
  var dist = d.district || d.d || "";
  var name = d.name || "";
  var phone = d.phone || d.ph || "";
  
  var base = [ts, ref, status, dist, name, phone];
  
  if (sheetName.indexOf("Matrimony") !== -1) {
    base.push(d.gender || d.g || "", d.age || "", d.education || d.edu || "", d.job || "", d.maritalStatus || d.st || "", d.about || "", d.photo || "");
  } else if (sheetName.indexOf("Education") !== -1) {
    base.push(d.age || "", d.cls || "", d.type || d.ty || "", d.guardianName || d.gn || "", d.guardianPhone || d.gp || "", d.note || "");
  } else if (sheetName.indexOf("Job_Seekers") !== -1) {
    base.push(d.age || "", d.education || d.edu || "", d.skills || d.skl || "", d.psec || "", d.years || "");
  } else if (sheetName.indexOf("Job_Postings") !== -1) {
    base.push(d.org || "", d.contactPerson || d.cpn || "", d.jobTitle || d.jt || "", d.pay || "", d.how || "");
  } else if (sheetName.indexOf("Blood") !== -1) {
    base.push(d.bloodGroup || d.bg || "", d.age || "", d.units || "", d.hospital || d.hosp || "", d.urgency || d.urg || "");
  } else if (sheetName.indexOf("Emergency") !== -1) {
    base.push(d.urgency || d.urg || "", d.location || d.loc || "", d.people || d.ppl || "", d.category || d.cat || "", d.note || "");
  } else if (sheetName.indexOf("Volunteer") !== -1) {
    base.push(d.age || "", d.availability || d.av || "", d.skills || d.sk || "", d.consent ? "Yes" : "No");
  } else {
    base.push(d.category || d.cat || "", JSON.stringify(d), d.note || "");
  }
  
  return base;
}

function sendEmailAlert(service, data) {
  try {
    var adminEmail = Session.getActiveUser().getEmail();
    if (!adminEmail) return;
    
    var subject = "[OURSUPPORT.IN ALERT] New " + service.toUpperCase() + " Request: " + (data.id || "");
    var body = "A new urgent request has been received on OurSupport.in:\n\n" +
               "Service: " + service + "\n" +
               "Reference: " + (data.id || "N/A") + "\n" +
               "Name: " + (data.name || "N/A") + "\n" +
               "Phone: " + (data.phone || data.ph || "N/A") + "\n" +
               "District: " + (data.district || data.d || "N/A") + "\n" +
               "Time: " + new Date().toLocaleString() + "\n\n" +
               "Please check the Google Sheet for full details.";
               
    MailApp.sendEmail(adminEmail, subject, body);
  } catch (e) {
    Logger.log("Email alert failed: " + e.toString());
  }
}
