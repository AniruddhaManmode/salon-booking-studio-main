# Google Sheets Integration Setup

## Step 1: Create Google Apps Script

1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Delete any existing code and paste this code:

```javascript
function doPost(e) {
  try {
    // Handle CORS
    const cors = ContentService.createTextOutput("")
      .setMimeType(ContentService.MimeType.JSON)
      .setContent(JSON.stringify({status: "success"}));
    
    // Set CORS headers
    cors.addHeader("Access-Control-Allow-Origin", "*");
    cors.addHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    cors.addHeader("Access-Control-Allow-Headers", "Content-Type");
    
    // Handle preflight OPTIONS request
    if (e.requestMethod === "OPTIONS") {
      return cors;
    }
    
    const data = JSON.parse(e.postData.contents);
    
    // Get your Google Sheet ID (replace with your actual Sheet ID)
    const sheetId = "YOUR_SPREADSHEET_ID";
    const sheetName = "Bookings";
    
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Name", "Phone", "Email", "Service", "Message", "Timestamp"]);
    }
    
    // Add new booking
    sheet.appendRow([
      data.name,
      data.phone,
      data.email,
      data.service,
      data.message,
      data.timestamp
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*")
      .addHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .addHeader("Access-Control-Allow-Headers", "Content-Type");
    
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader("Access-Control-Allow-Origin", "*")
      .addHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
      .addHeader("Access-Control-Allow-Headers", "Content-Type");
  }
}

function doGet(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader("Access-Control-Allow-Origin", "*")
    .addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    .addHeader("Access-Control-Allow-Headers", "Content-Type");
}
```

## Step 2: Deploy as Web App

1. Save the script (Ctrl + S)
2. Click "Deploy" → "New deployment"
3. Click gear icon → "Web app"
4. Configuration:
   - Description: "Salon Booking API"
   - Execute as: "Me"
   - Who has access: "Anyone" (required for web requests)
5. Click "Deploy"
6. Copy the Web app URL (it will look like: `https://script.google.com/macros/s/.../exec`)

## Step 3: Get Your Spreadsheet ID

1. Create a new Google Sheet
2. Create a tab named "Bookings"
3. From the URL, copy the ID (between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/`**`1abc123def456ghi789`**`/edit`
   - Your ID is: `1abc123def456ghi789`

## Step 4: Update the Script

Replace `YOUR_SPREADSHEET_ID` in the script with your actual spreadsheet ID.

## Step 5: Update Your React App

Replace the localStorage code in BookingForm.tsx with:

```javascript
const googleSheetsUrl = "https://script.google.com/macros/s/AKfycbwd2RfN52Q4XUcla-kiDZXa7pcyrgAVBda3ot05rLhG8DL48uf1v7EsmJeTJ0vbdfup/exec"; // Paste your Web app URL here

await fetch(googleSheetsUrl, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(submitData),
});
```

## Testing

1. Submit a booking form
2. Check your Google Sheet - you should see the booking data appear
3. Check browser console for any errors

## Important Notes

- The Web app URL is different from your Google Sheet URL
- You must set access to "Anyone" for the web app to work
- Test in incognito mode if you get CORS errors
- Keep your Web app URL private - it's like an API key
