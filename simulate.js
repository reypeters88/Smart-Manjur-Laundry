const fs = require('fs');
let data = JSON.parse(fs.readFileSync('pemasukan_dump.json', 'utf8'));

let corrupted = 0;
let fixed = 0;

data.forEach(trx => {
    if (trx.date) {
        let d = new Date(trx.date);
        if (!isNaN(d)) {
            let isCorrupted = false;
            if (trx.id && trx.id.includes('-0826-') && d.getMonth() !== 7) {
                isCorrupted = true;
                corrupted++;
            }
            if (isCorrupted) {
                let corruptMonth = d.getMonth();
                let corruptDay = d.getDate();
                let fixedDate = new Date(d.getFullYear(), corruptDay - 1, corruptMonth + 1, d.getHours(), d.getMinutes(), d.getSeconds());
                
                let pad = (n) => n.toString().padStart(2, '0');
                trx.date = fixedDate.getFullYear() + '-' + pad(fixedDate.getMonth() + 1) + '-' + pad(fixedDate.getDate()) + ' ' + pad(fixedDate.getHours()) + ':' + pad(fixedDate.getMinutes()) + ':00';
                fixed++;
            }
        }
    }
});
console.log(`Corrupted: ${corrupted}, Fixed: ${fixed}`);
console.log("Sample fixed date: ", data.find(x => x.id && x.id.includes('-0826-')).date);
