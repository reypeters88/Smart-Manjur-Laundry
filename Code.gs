/**
 * Backend Google Apps Script untuk Manjur Laundry
 * Fungsi ini menangani komunikasi dengan aplikasi Manjur Laundry.
 */

const SHEET_NAMES = [
  "pemasukan",
  "pengeluaran",
  "pelanggan",
  "inventory",
  "Layanan",
  "user",
  "Bank"
];

// Menangani request GET (Tarik Data dari Sheets ke Aplikasi)
function doGet(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    let responseData = {};
    
    SHEET_NAMES.forEach(sheetName => {
      const sheet = doc.getSheetByName(sheetName);
      if (sheet) {
        responseData[sheetName] = readSheetData(sheet);
      } else {
        responseData[sheetName] = []; // Kirim array kosong jika sheet belum dibuat
      }
    });

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: responseData
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Menangani request POST (Kirim Data dari Aplikasi ke Sheets)
function doPost(e) {
  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    
    // Parse data JSON yang dikirim dari aplikasi
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    const data = payload.data; // Object berisi { pemasukan: [...], pelanggan: [...] }

    if (action === "sync" && data) {
      SHEET_NAMES.forEach(sheetName => {
        if (data[sheetName] && Array.isArray(data[sheetName])) {
          let sheet = doc.getSheetByName(sheetName);
          
          // Jika sheet belum ada, buat otomatis
          if (!sheet) {
            sheet = doc.insertSheet(sheetName);
          }
          
                    let sheetData = data[sheetName];
          
          // Khusus untuk sheet pemasukan, urai keranjang pesanan (items) menjadi kolom per layanan
          if (sheetName === 'pemasukan') {
            sheetData = sheetData.map(trx => {
              let flatTrx = Object.assign({}, trx);
              let items = flatTrx.items;
              delete flatTrx.items; // Hapus kolom JSON aslinya
              
              if (typeof items === 'string') {
                try { items = JSON.parse(items); } catch(e) { items = []; }
              }
              
              if (Array.isArray(items)) {
                // Ekstrak nama layanan dan isikan ke kolom terpisah
                items.forEach(item => {
                  let serviceName = item.name || 'Layanan Tidak Diketahui';
                  let qty = item.qty || 1;
                  let subtotal = item.subtotal || (item.price * qty) || 0;
                  
                  flatTrx['Layanan: ' + serviceName + ' (Qty)'] = qty;
                  flatTrx['Layanan: ' + serviceName + ' (Subtotal)'] = subtotal;
                });
              }
              
              return flatTrx;
            });
          }
          
          writeSheetData(sheet, sheetData);
        }
      });
      
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        message: "Sinkronisasi berhasil. Data tersimpan di Google Sheets."
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Action tidak dikenali atau data kosong."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fungsi bantuan untuk membaca data sheet menjadi Array of Objects
 */
function readSheetData(sheet) {
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  if (values.length <= 1) return []; // Hanya header atau kosong
  
  const headers = values[0];
  let records = [];
  
  for (let i = 1; i < values.length; i++) {
    let row = values[i];
    let record = {};
    for (let j = 0; j < headers.length; j++) {
      if (headers[j]) {
        record[headers[j]] = row[j];
      }
    }
    records.push(record);
  }
  return records;
}

/**
 * Fungsi bantuan untuk menulis/menimpa data Array of Objects ke Sheet
 */
function writeSheetData(sheet, dataArray) {
  // Kosongkan sheet sebelum ditimpa data baru
  sheet.clear();
  
  if (dataArray.length === 0) return;
  
  // Kumpulkan semua keys unik untuk dijadikan header
  let headerSet = new Set();
  dataArray.forEach(obj => {
    Object.keys(obj).forEach(key => headerSet.add(key));
  });
  
  const headers = Array.from(headerSet);
  
  // Siapkan baris data
  let rows = [headers]; // Baris pertama adalah header
  
  dataArray.forEach(obj => {
    let row = [];
    headers.forEach(h => {
      // Jika objek tidak punya nilai untuk header ini, beri string kosong
            let val = obj[h];
      if (val !== undefined && val !== null) {
        if (typeof val === 'object') {
          val = JSON.stringify(val);
        }
      } else {
        val = "";
      }
      row.push(val);
    });
    rows.push(row);
  });
  
  // Tulis sekaligus ke Spreadsheet (sangat cepat)
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
}


