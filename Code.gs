/** Google Apps Script — Web App untuk tulis data ke Sheet Master */
const SHEET_ID   = "GANTI_DENGAN_SHEET_ID";
const SHEET_NAME = "Master";
const TZ = "Asia/Jakarta";

function doPost(e) {
  try {
    const ct = e?.postData?.type || "";
    let data = {};
    if (ct.includes("application/json")) data = JSON.parse(e.postData.contents);
    else data = e.parameter || {};

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();

    const header = ["Timestamp","Kecamatan","Kelurahan","Spreadsheet","Nama","Email","Status","Catatan"];
    const firstRow = sh.getRange(1,1,1,header.length).getValues()[0];
    const needHeader = firstRow.filter(String).length === 0;
    if (needHeader) sh.getRange(1,1,1,header.length).setValues([header]);

    const now = Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd HH:mm:ss");
    const row = [ now, data.kecamatan||"", data.kelurahan||"", data.spreadsheetLink||"", data.nama||"", data.email||"", "", "" ];
    sh.appendRow(row);

    return jsonResponse(200, { ok:true, message:"Data tersimpan", ts: now });
  } catch (err) {
    return jsonResponse(500, { ok:false, error:String(err) });
  }
}

function doGet() {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
    const data = sh.getDataRange().getValues();
    const header = data.shift();
    const rows = data.map(r => Object.fromEntries(header.map((h,i)=>[h, r[i]])));
    return jsonResponse(200, { ok:true, data: rows });
  } catch (err) {
    return jsonResponse(500, { ok:false, error:String(err) });
  }
}

function jsonResponse(status, obj) {
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  out.setMimeType(ContentService.MimeType.JSON);
  return out.setResponseCode ? out.setResponseCode(status) : out;
}
