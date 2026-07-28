    const btnExportPengeluaran = document.getElementById('btn-export-pengeluaran');
    if(btnExportPengeluaran) {
        btnExportPengeluaran.addEventListener('click', () => showToast('Mengekspor data Pengeluaran...'));
    }

    const pengeluaranDateFilter = document.getElementById('pengeluaran-date-filter');
    const pengeluaranDateText = document.getElementById('pengeluaran-date-text');
    const btnRefreshPengeluaran = document.getElementById('btn-refresh-pengeluaran');
    const pengeluaranEmptyState = document.getElementById('pengeluaran-empty-state');
    const pengeluaranDataState = document.getElementById('pengeluaran-data-state');
    const pengeluaranAccordionContainer = document.getElementById('pengeluaran-accordion-container');

    window.renderPengeluaranAccordion = function(cashboxFilter = 'Semua') {
        if(!pengeluaranAccordionContainer) return;
        
        // Dummy data for Pengeluaran matching screenshot
        const groupedDataRaw = [
            {
                dateText: '13-07-2026',
                items: [
                    { title: 'pengeluaran tgl 13 07 2026', itemsDesc: '1 gas yg 3kg ( 23.000 )', code: 'UK/260713/002', cashbox: 'Tunai', category: 'Biaya Operasional', total: 23000 }
                ]
            },
            {
                dateText: '10-07-2026',
                items: [
                    { title: 'pengeluaran 10 07 2026', itemsDesc: '2 tbg gas yg 3kg ( 46.000 )<br>1 pack tissu jolly ( 18.000 )<br>3 pack downy ( 120.000 )', code: 'UK/260713/001', cashbox: 'Tunai', category: 'Biaya Operasional', total: 184000 }
                ]
            },
            {
                dateText: '08-07-2026',
                items: [
                    { title: 'pengeluaran tgl 08 07 2026', itemsDesc: '2 bks sabun ekonomi ( 12.000 )<br>1 tbg gas yg 5,5kg ( 135.000 )', code: 'UK/260708/002', cashbox: 'Tunai', category: 'Biaya Operasional', total: 147000 },
                    { title: 'pengeluaran tgl 08 07 2026', itemsDesc: '2 tbg gas yg 3kg ( 46.000 )', code: 'UK/260708/001', cashbox: 'Tunai', category: 'Biaya Operasional', total: 46000 }
                ]
            }
        ];

        let html = '';
        let globalTotal = 0;

        const filteredGroups = groupedDataRaw.map(group => {
            const filteredItems = group.items.filter(item => {
                if(cashboxFilter === 'Semua') return true;
                return item.cashbox === cashboxFilter;
            });
            
            const groupTotal = filteredItems.reduce((sum, it) => sum + it.total, 0);
            return {
                ...group,
                items: filteredItems,
                groupTotal
            };
        }).filter(group => group.items.length > 0);

        if(filteredGroups.length === 0) {
            pengeluaranAccordionContainer.innerHTML = '<div style=\"padding:20px; text-align:center; color:#94a3b8;\">Tidak ada data pengeluaran untuk filter ini.</div>';
            const totalEl = document.querySelector('#pengeluaran-data-state div > span[style*=\"font-size:1.8rem\"]');
            if(totalEl) totalEl.innerText = '0';
            return;
        }

        filteredGroups.forEach((g, index) => {
            globalTotal += g.groupTotal;
            const isActive = index === 0 ? 'active' : ''; 
            
            let itemsHtml = '';
            g.items.forEach(it => {
                itemsHtml += 
                <div style=\"display:flex; justify-content:space-between; align-items:center; padding:15px 0; border-bottom:1px solid #f1f5f9;\">
                    <div style=\"font-size:0.9rem; color:#1e293b;\">
                        <div style=\"margin-bottom:3px;\"></div>
                        <div style=\"margin-bottom:3px;\"></div>
                        <div style=\"margin-bottom:3px; color:#64748b; font-size:0.85rem;\">Kode :  <span style=\"color:#ef4444; font-weight:500;\">()</span></div>
                        <div style=\"color:#64748b; font-size:0.85rem;\">Kategori : </div>
                    </div>
                    <div style=\"text-align:right;\">
                        <div style=\"color:#1e293b; font-weight:500; font-size:0.95rem;\"></div>
                    </div>
                </div>;
            });

            html += 
            <div class=\"accordion-item \" style=\"background:#fff; margin-bottom: 5px;\">
                <div class=\"accordion-header\" style=\"padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc;\" onclick=\"this.parentElement.classList.toggle('active')\">
                    <div style=\"display:flex; align-items:center; gap:10px;\">
                        <i class=\"fa-solid fa-chevron-down text-slate-400 transition-transform\" style=\"color:#0ea5e9;\"></i>
                        <div style=\"font-weight:600; color:#0ea5e9; font-size:0.9rem;\"></div>
                    </div>
                    <div style=\"font-weight:600; color:#0ea5e9; font-size:0.95rem;\"></div>
                </div>
                <div class=\"accordion-content\" style=\"padding: 0 20px; background:#ffffff; display:;\">
                    
                </div>
            </div>;
        });
        
        pengeluaranAccordionContainer.innerHTML = html;

        // Add inline style if not exists
        if(!document.getElementById('pengeluaran-accordion-style')) {
            const style = document.createElement('style');
            style.id = 'pengeluaran-accordion-style';
            style.innerHTML = 
                #pengeluaran-accordion-container .accordion-item.active .accordion-content { display: block !important; }
                #pengeluaran-accordion-container .accordion-item.active .fa-chevron-down { transform: rotate(180deg); }
            ;
            document.head.appendChild(style);
        }

        const totalTextElement = document.querySelector('#pengeluaran-data-state div > span[style*=\"font-size:1.8rem\"]');
        if(totalTextElement) {
            totalTextElement.innerText = globalTotal.toLocaleString('en-US');
        }
    };

    if (pengeluaranDateFilter && pengeluaranDateText && btnRefreshPengeluaran && pengeluaranEmptyState && pengeluaranDataState) {
        pengeluaranDateFilter.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'per-tanggal') {
                const datePickerModal = document.getElementById('custom-date-picker-modal');
                if(datePickerModal) datePickerModal.style.display = 'flex';
            } else if (val) {
                if (val === 'hari-ini') pengeluaranDateText.innerText = '23/07/2026';
                else if (val === 'kemarin') pengeluaranDateText.innerText = '22/07/2026';
                else if (val === '7-hari') pengeluaranDateText.innerText = '17/07/2026 - 23/07/2026';
                else if (val === '30-hari') pengeluaranDateText.innerText = '24/06/2026 - 23/07/2026';
                else if (val === 'bulan-ini') pengeluaranDateText.innerText = '01/07/2026 - 31/07/2026';
                else if (val === 'per-bulan') pengeluaranDateText.innerText = 'Juli 2026';

                pengeluaranDateText.style.display = 'block';
                btnRefreshPengeluaran.style.display = 'flex';
                pengeluaranEmptyState.style.display = 'none';
                pengeluaranDataState.style.display = 'flex';
                
                renderPengeluaranAccordion();
                btnRefreshPengeluaran.click();
            }
        });

        btnRefreshPengeluaran.addEventListener('click', () => {
            const icon = document.getElementById('pengeluaran-refresh-icon');
            if(icon) icon.classList.add('fa-spin');
            setTimeout(() => {
                if(icon) icon.classList.remove('fa-spin');
                showToast('Memperbarui data pengeluaran...');
            }, 800);
        });
    }

    const pengeluaranCashboxFilter = document.getElementById('pengeluaran-cashbox-filter');
    const pengeluaranCashboxText = document.getElementById('pengeluaran-cashbox-text');
    if(pengeluaranCashboxFilter && pengeluaranCashboxText) {
        pengeluaranCashboxFilter.addEventListener('change', (e) => {
            const val = e.target.value;
            pengeluaranCashboxText.innerText = val;
            renderPengeluaranAccordion(val);
            if(btnRefreshPengeluaran) btnRefreshPengeluaran.click();
        });
    }

    const btnTabPengeluaranTransaksi = document.getElementById('btn-tab-pengeluaran-transaksi');
    const btnTabPengeluaranKategori = document.getElementById('btn-tab-pengeluaran-kategori');
    const contentPengeluaranTransaksi = document.getElementById('pengeluaran-content-transaksi');
    const contentPengeluaranKategori = document.getElementById('pengeluaran-content-kategori');

    if(btnTabPengeluaranTransaksi && btnTabPengeluaranKategori) {
        btnTabPengeluaranTransaksi.addEventListener('click', () => {
            btnTabPengeluaranTransaksi.style.borderBottom = '2px solid #0ea5e9';
            btnTabPengeluaranTransaksi.style.color = '#0ea5e9';
            btnTabPengeluaranTransaksi.style.fontWeight = '600';
            
            btnTabPengeluaranKategori.style.borderBottom = '2px solid transparent';
            btnTabPengeluaranKategori.style.color = '#64748b';
            btnTabPengeluaranKategori.style.fontWeight = '500';
            
            contentPengeluaranTransaksi.style.display = 'block';
            contentPengeluaranKategori.style.display = 'none';
        });

        btnTabPengeluaranKategori.addEventListener('click', () => {
            btnTabPengeluaranKategori.style.borderBottom = '2px solid #0ea5e9';
            btnTabPengeluaranKategori.style.color = '#0ea5e9';
            btnTabPengeluaranKategori.style.fontWeight = '600';
            
            btnTabPengeluaranTransaksi.style.borderBottom = '2px solid transparent';
            btnTabPengeluaranTransaksi.style.color = '#64748b';
            btnTabPengeluaranTransaksi.style.fontWeight = '500';
            
            contentPengeluaranKategori.style.display = 'block';
            contentPengeluaranTransaksi.style.display = 'none';
        });
    }
