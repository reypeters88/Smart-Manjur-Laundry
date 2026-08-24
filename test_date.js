function parseDateString(dateStr) {
    if (!dateStr) return null;
    let d;
    try {
        if (dateStr.includes('/')) {
            const parts = dateStr.split(' ')[0].split('/');
            if (parts.length === 3) {
                let y = parts[0].length === 4 ? parseInt(parts[0]) : parseInt(parts[2]);
                if (y < 100) y += 2000;
                let m = parseInt(parts[1]) - 1;
                let day = parts[0].length === 4 ? parseInt(parts[2]) : parseInt(parts[0]);
                d = new Date(y, m, day);
            }
        }
        if (!d || isNaN(d.getTime())) {
            const p = dateStr.split(' ')[0].split('-');
            if (p.length === 3) {
                d = new Date(p[0], parseInt(p[1]) - 1, parseInt(p[2]));
            }
        }
        return d;
    } catch(e) { return null; }
}

function isDateInRange(dateObj, filterVal, startStr = null, endStr = null) {
    if (!filterVal || filterVal === 'semua') return true;
    if (!dateObj || isNaN(dateObj)) return false;

    if (filterVal === 'per-tanggal') {
        if (!startStr) return true;
        const startD = parseDateString(startStr);
        if (startD) startD.setHours(0,0,0,0);
        const endD = endStr ? parseDateString(endStr) : parseDateString(startStr);
        if (endD) endD.setHours(23,59,59,999);
        if (!startD || !endD || isNaN(startD) || isNaN(endD)) return false;
        
        console.log("startD:", startD);
        console.log("endD:", endD);
        console.log("dateObj:", dateObj);
        
        return dateObj >= startD && dateObj <= endD;
    }
    return true;
}

const itemDate = "2026-08-01"; // Format in db_pemasukan
const dateObj = parseDateString(itemDate);
console.log("itemDate parsed:", dateObj);

const result = isDateInRange(dateObj, 'per-tanggal', '01/08/2026', '15/08/2026');
console.log("result:", result);
