
        // --- MULTI-OUTLET LOCALSTORAGE INTERCEPTOR ---
        const originalGetItem = localStorage.getItem.bind(localStorage);
        const originalSetItem = localStorage.setItem.bind(localStorage);

        const prefixKeys = ['db_pemasukan', 'db_pengeluaran', 'db_pelanggan'];

        localStorage.getItem = function (key) {
            const activeOutlet = originalGetItem('active_outlet_id') || 'PUSAT';

            if (prefixKeys.includes(key)) {
                if (activeOutlet !== 'PUSAT') {
                    return originalGetItem(key + '_' + activeOutlet);
                }
            }

            if (activeOutlet !== 'PUSAT') {
                if (key === 'company_name' || key === 'company_address' || key === 'company_phone') {
                    const dbOutlets = JSON.parse(originalGetItem('db_outlets') || '[]');
                    const outlet = dbOutlets.find(o => o.id === activeOutlet);
                    if (outlet) {
                        if (key === 'company_name' && outlet.nama) return outlet.nama;
                        if (key === 'company_address' && outlet.alamat) return outlet.alamat;
                        if (key === 'company_phone' && outlet.telepon) return outlet.telepon;
                    }
                }
            }

            return originalGetItem(key);
        };

        localStorage.setItem = function (key, value) {
            const activeOutlet = originalGetItem('active_outlet_id') || 'PUSAT';
            if (prefixKeys.includes(key)) {
                if (activeOutlet !== 'PUSAT') {
                    return originalSetItem(key + '_' + activeOutlet, value);
                }
            }
            return originalSetItem(key, value);
        };
        // ---------------------------------------------

        window.addEventListener('error', function (e) {
            console.error("JS Error:\n" + e.message + "\nLine: " + e.lineno + "\nFile: " + e.filename);
        });
    
