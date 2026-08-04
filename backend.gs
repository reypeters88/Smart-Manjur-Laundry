function doPost(e) {
  try {
    let payload = JSON.parse(e.postData.contents);
    if (payload.action === 'sync') {
      let data = payload.data;
      let ss = SpreadsheetApp.getActiveSpreadsheet();
      
      for (let sheetName in data) {
        let sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        }
        sheet.clear();
        
        let records = data[sheetName];
        if (records && records.length > 0) {
          let rows = [];
          
          if (sheetName === 'pemasukan') {
            // KHUSUS PEMASUKAN: Flatten items array ke dalam kolom-kolom Layanan
            let dynamicHeaders = new Set();
            let baseHeaders = new Set();
            
            // Kumpulkan semua kolom dasar (kecuali items) dan semua nama layanan unik
            records.forEach(rec => {
              Object.keys(rec).forEach(k => {
                if (k !== 'items') baseHeaders.add(k);
              });
              if (rec.items && Array.isArray(rec.items)) {
                rec.items.forEach(item => {
                  dynamicHeaders.add('Layanan: ' + item.name + ' (Qty)');
                  dynamicHeaders.add('Layanan: ' + item.name + ' (Subtotal)');
                });
              }
            });
            
            // Susun urutan Header: Kolom Dasar -> Kolom Layanan
            let allHeaders = [...Array.from(baseHeaders), ...Array.from(dynamicHeaders)];
            rows.push(allHeaders);
            
            // Isi baris data
            for (let i = 0; i < records.length; i++) {
              let rec = records[i];
              let row = [];
              let itemsMap = {};
              
              if (rec.items && Array.isArray(rec.items)) {
                rec.items.forEach(item => {
                  itemsMap['Layanan: ' + item.name + ' (Qty)'] = item.qty || 0;
                  itemsMap['Layanan: ' + item.name + ' (Subtotal)'] = item.total || (item.qty * item.price) || 0;
                });
              }
              
              for (let j = 0; j < allHeaders.length; j++) {
                let colName = allHeaders[j];
                let val = '';
                
                if (baseHeaders.has(colName)) {
                  val = rec[colName] !== undefined ? rec[colName] : '';
                  if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                } else {
                  val = itemsMap[colName] !== undefined ? itemsMap[colName] : '';
                }
                row.push(val);
              }
              rows.push(row);
            }
            
            sheet.getRange(1, 1, rows.length, allHeaders.length).setValues(rows);
            sheet.autoResizeColumns(1, allHeaders.length);
            
          } else {
            // UNTUK SHEET LAIN: Format Standar
            let headers = Object.keys(records[0]);
            rows.push(headers);
            
            for (let i = 0; i < records.length; i++) {
              let row = [];
              for (let j = 0; j < headers.length; j++) {
                let val = records[i][headers[j]];
                if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                row.push(val);
              }
              rows.push(row);
            }
            sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
            sheet.autoResizeColumns(1, headers.length);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    let ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Script belum terikat pada Spreadsheet'})).setMimeType(ContentService.MimeType.JSON);
    }
    
    let sheets = ss.getSheets();
    let resultData = {};
    
    for (let i = 0; i < sheets.length; i++) {
      let sheet = sheets[i];
      let sheetName = sheet.getName();
      let dataRange = sheet.getDataRange();
      let values = dataRange.getValues();
      
      let records = [];
      if (values.length > 1) {
        let headers = values[0];
        
        for (let r = 1; r < values.length; r++) {
          let row = values[r];
          
          if (sheetName === 'pemasukan') {
            // KHUSUS PEMASUKAN: Unflatten kolom-kolom Layanan menjadi array items
            let record = { items: [] };
            let tempItems = {};
            
            for (let c = 0; c < headers.length; c++) {
              let colName = headers[c];
              let val = row[c];
              
              if (colName.startsWith('Layanan: ')) {
                let match = colName.match(/^Layanan:\s+(.+?)\s+\((Qty|Subtotal)\)$/);
                if (match) {
                  let name = match[1];
                  let type = match[2];
                  if (!tempItems[name]) tempItems[name] = { name: name, qty: 0, total: 0, price: 0 };
                  if (type === 'Qty') tempItems[name].qty = Number(val) || 0;
                  if (type === 'Subtotal') tempItems[name].total = Number(val) || 0;
                }
              } else {
                if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                  try { val = JSON.parse(val); } catch(ex) {}
                }
                record[colName] = val;
              }
            }
            
            // Susun array items
            for (let name in tempItems) {
              if (tempItems[name].qty > 0 || tempItems[name].total > 0) {
                tempItems[name].price = tempItems[name].qty ? (tempItems[name].total / tempItems[name].qty) : 0;
                record.items.push(tempItems[name]);
              }
            }
            records.push(record);
            
          } else {
            // UNTUK SHEET LAIN: Format Standar
            let record = {};
            for (let c = 0; c < headers.length; c++) {
               let val = row[c];
               if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                   try { val = JSON.parse(val); } catch(ex) {}
               }
               record[headers[c]] = val;
            }
            records.push(record);
          }
        }
      }
      resultData[sheetName] = records;
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success', data: resultData})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

