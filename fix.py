import sys

def replace_in_file():
    with open('laporan.js', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replacement 1
    target1 = '''    window.globalApiData = {
        pemasukan: [],
        pengeluaran: [],
        isLoaded: false
    };'''
    
    repl1 = '''    window.globalApiData = {
        pemasukan: [],
        pengeluaran: [],
        isLoaded: false
    };

    window.getDB = function(key) {
        const activeOutlet = localStorage.getItem('active_outlet_id') || 'PUSAT';
        const finalKey = activeOutlet === 'PUSAT' ? key : key + '_' + activeOutlet;
        return JSON.parse(localStorage.getItem(finalKey) || '[]');
    };'''
    
    content = content.replace(target1, repl1)

    # Replacement 2
    target2 = '''        const dbPem = window.globalApiData.pemasukan || [];
        const dbPeng = window.globalApiData.pengeluaran || [];'''

    repl2 = '''        const dbPem = (typeof getDB === 'function') ? getDB('db_pemasukan') : (window.globalApiData.pemasukan || []);
        const dbPeng = (typeof getDB === 'function') ? getDB('db_pengeluaran') : (window.globalApiData.pengeluaran || []);'''

    content = content.replace(target2, repl2)

    # Replacement 3
    target3 = '''        const filteredPem = dbPem.filter(item => window.isDateInRange(window.parseDateString(item.date), filterVal, startStr, endStr));
        const filteredPeng = dbPeng.filter(item => window.isDateInRange(window.parseDateString(item.date), filterVal, startStr, endStr));'''

    repl3 = '''        const cashboxSel = document.getElementById('arus-cashbox-filter');
        const cashboxVal = cashboxSel ? cashboxSel.value : 'Semua';

        const filteredPem = dbPem.filter(item => {
            if (!window.isDateInRange(window.parseDateString(item.date), filterVal, startStr, endStr)) return false;
            if (cashboxVal !== 'Semua') {
                const cat = item.category || 'Tunai';
                return cat.toUpperCase().includes(cashboxVal.toUpperCase());
            }
            return true;
        });
        const filteredPeng = dbPeng.filter(item => {
            if (!window.isDateInRange(window.parseDateString(item.date), filterVal, startStr, endStr)) return false;
            if (cashboxVal !== 'Semua') {
                const cat = item.category || 'Tunai';
                return cat.toUpperCase().includes(cashboxVal.toUpperCase());
            }
            return true;
        });'''

    content = content.replace(target3, repl3)

    # Replacement 4
    target4 = '''            tbody.innerHTML = html;
        }
    };'''
    
    repl4 = '''            tbody.innerHTML = html;
        }
        window.currentArusData = combined;
    };'''

    content = content.replace(target4, repl4)

    with open('laporan.js', 'w', encoding='utf-8') as f:
        f.write(content)

replace_in_file()
