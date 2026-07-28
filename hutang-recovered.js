    const btnExporthutang = document.getElementById('btn-export-hutang');
    if(btnExporthutang) {
        btnExporthutang.addEventListener('click', () => showToast('Mengekspor data hutang...'));
    }

    const hutangDateFilter = document.getElementById('hutang-date-filter');
    const hutangDateText = document.getElementById('hutang-date-text');
    const btnRefreshhutang = document.getElementById('btn-refresh-hutang');
    const hutangEmptyState = document.getElementById('hutang-empty-state');
    const hutangDataState = document.getElementById('hutang-data-state');
    const hutangAccordionContainer = document.getElementById('hutang-accordion-container');

    window.renderhutangAccordion = function(cashboxFilter = 'Semua') {
        if(!hutangAccordionContainer) return;
        
        // Dummy data for hutang matching screenshot
        const groupedDataRaw = [
            {
                dateText: '13-07-2026',
                items: [
                    { title: 'hutang tgl 13 07 2026', itemsDesc: '1 gas yg 3kg ( 23.000 )', code: 'UK/260713/002', cashbox: 'Tunai', category: 'Biaya Operasional', total: 23000 }
                ]
            },
            {
                dateText: '10-07-2026',
                items: [
                    { title: 'hutang 10 07 2026', itemsDesc: '2 tbg gas yg 3kg ( 46.000 )<br>1 pack tissu jolly ( 18.000 )<br>3 pack downy ( 120.000 )', code: 'UK/260713/001', cashbox: 'Tunai', category: 'Biaya Operasional', total: 184000 }
                ]
            },
            {
                dateText: '08-07-2026',
                items: [
                    { title: 'hutang tgl 08 07 2026', itemsDesc: '2 bks sabun ekonomi ( 12.000 )<br>1 tbg gas yg 5,5kg ( 135.000 )', code: 'UK/260708/002', cashbox: 'Tunai', category: 'Biaya Operasional', total: 147000 },
                    { title: 'hutang tgl 08 07 2026', itemsDesc: '2 tbg gas yg 3kg ( 46.000 )', code: 'UK/260708/001', cashbox: 'Tunai', category: 'Biaya Operasional', total: 46000 }
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
            hutangAccordionContainer.innerHTML = '<div style=\"padding:20px; text-align:center; color:#94a3b8;\">Tidak ada data hutang untuk filter ini.</div>';
            const totalEl = document.querySelector('#hutang-data-state div > span[style*=\"font-size:1.8rem\"]');
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
        
        hutangAccordionContainer.innerHTML = html;

        // Add inline style if not exists
        if(!document.getElementById('hutang-accordion-style')) {
            const style = document.createElement('style');
            style.id = 'hutang-accordion-style';
            style.innerHTML = 
                #hutang-accordion-container .accordion-item.active .accordion-content { display: block !important; }
                #hutang-accordion-container .accordion-item.active .fa-chevron-down { transform: rotate(180deg); }
            ;
            document.head.appendChild(style);
        }

        const totalTextElement = document.querySelector('#hutang-data-state div > span[style*=\"font-size:1.8rem\"]');
        if(totalTextElement) {
            totalTextElement.innerText = globalTotal.toLocaleString('en-US');
        }
    };

    if (hutangDateFilter && hutangDateText && btnRefreshhutang && hutangEmptyState && hutangDataState) {
        hutangDateFilter.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === 'per-tanggal') {
                const datePickerModal = document.getElementById('custom-date-picker-modal');
                if(datePickerModal) datePickerModal.style.display = 'flex';
            } else if (val) {
                if (val === 'hari-ini') hutangDateText.innerText = '23/07/2026';
                else if (val === 'kemarin') hutangDateText.innerText = '22/07/2026';
                else if (val === '7-hari') hutangDateText.innerText = '17/07/2026 - 23/07/2026';
                else if (val === '30-hari') hutangDateText.innerText = '24/06/2026 - 23/07/2026';
                else if (val === 'bulan-ini') hutangDateText.innerText = '01/07/2026 - 31/07/2026';
                else if (val === 'per-bulan') hutangDateText.innerText = 'Juli 2026';

                hutangDateText.style.display = 'block';
                btnRefreshhutang.style.display = 'flex';
                hutangEmptyState.style.display = 'none';
                hutangDataState.style.display = 'flex';
                
                renderhutangAccordion();
                btnRefreshhutang.click();
            }
        });

        btnRefreshhutang.addEventListener('click', () => {
            const icon = document.getElementById('hutang-refresh-icon');
            if(icon) icon.classList.add('fa-spin');
            setTimeout(() => {
                if(icon) icon.classList.remove('fa-spin');
                showToast('Memperbarui data hutang...');
            }, 800);
        });
    }

    const hutangCashboxFilter = document.getElementById('hutang-cashbox-filter');
    const hutangCashboxText = document.getElementById('hutang-cashbox-text');
    if(hutangCashboxFilter && hutangCashboxText) {
        hutangCashboxFilter.addEventListener('change', (e) => {
            const val = e.target.value;
            hutangCashboxText.innerText = val;
            renderhutangAccordion(val);
            if(btnRefreshhutang) btnRefreshhutang.click();
        });
    }

    const btnTabhutangTransaksi = document.getElementById('btn-tab-hutang-transaksi');
    const btnTabhutangKategori = document.getElementById('btn-tab-hutang-kategori');
    const contenthutangTransaksi = document.getElementById('hutang-content-transaksi');
    const contenthutangKategori = document.getElementById('hutang-content-kategori');

    if(btnTabhutangTransaksi && btnTabhutangKategori) {
        btnTabhutangTransaksi.addEventListener('click', () => {
            btnTabhutangTransaksi.style.borderBottom = '2px solid #0ea5e9';
            btnTabhutangTransaksi.style.color = '#0ea5e9';
            btnTabhutangTransaksi.style.fontWeight = '600';
            
            btnTabhutangKategori.style.borderBottom = '2px solid transparent';
            btnTabhutangKategori.style.color = '#64748b';
            btnTabhutangKategori.style.fontWeight = '500';
            
            contenthutangTransaksi.style.display = 'block';
            contenthutangKategori.style.display = 'none';
        });

        btnTabhutangKategori.addEventListener('click', () => {
            btnTabhutangKategori.style.borderBottom = '2px solid #0ea5e9';
            btnTabhutangKategori.style.color = '#0ea5e9';
            btnTabhutangKategori.style.fontWeight = '600';
            
            btnTabhutangTransaksi.style.borderBottom = '2px solid transparent';
            btnTabhutangTransaksi.style.color = '#64748b';
            btnTabhutangTransaksi.style.fontWeight = '500';
            
            contenthutangKategori.style.display = 'block';
            contenthutangTransaksi.style.display = 'none';
        });
    }

