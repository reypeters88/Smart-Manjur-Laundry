// Laporan Module
// Handles data fetching and rendering for all Laporan layouts

(function() {
    window.globalApiData = {
        pemasukan: [],
        pengeluaran: [],
        isLoaded: false
    };

    const API_URL = 'https://script.google.com/macros/s/AKfycbyUtbsr0GX4NfEZxtHCzPvonj3qHIjLpZhHtuMmrEDjVieMoWVTJPu94997FP-HQGtw/exec';

    async function fetchApiData() {
        try {
            if (typeof window.showToast === 'function') window.showToast('Menarik data dari server...');
            const response = await fetch(API_URL);
            const result = await response.json();
            if (result.status === 'success' && result.data) {
                // --- FIX: Google Sheets US Locale Date Swapping (MM/DD vs DD/MM) ---
                const fixDateData = (arr) => {
                    if (!arr) return;
                    arr.forEach(item => {
                        if (item.id && item.date && typeof item.date === 'string') {
                            const parts = String(item.id).split('-');
                            if (parts.length >= 3 && parts[1].length === 4) {
                                const expectedMonth = parseInt(parts[1].substring(0, 2), 10);
                                const expectedYear = parseInt(parts[1].substring(2, 4), 10) + 2000;
                                const d = new Date(item.date);
                                if (!isNaN(d.getTime())) {
                                    // If the month from date doesn't match the month in the ID
                                    if (d.getMonth() + 1 !== expectedMonth || d.getFullYear() !== expectedYear) {
                                        // Check if they were swapped (Day is the expected Month)
                                        if (d.getDate() === expectedMonth) {
                                            const realDay = d.getMonth() + 1;
                                            d.setMonth(expectedMonth - 1, realDay);
                                            item.date = d.toISOString();
                                        }
                                    }
                                }
                            }
                        }
                    });
                };
                fixDateData(result.data.pemasukan);
                fixDateData(result.data.pengeluaran);
                // -------------------------------------------------------------------

                window.globalApiData.pemasukan = result.data.pemasukan || [];
                window.globalApiData.pengeluaran = result.data.pengeluaran || [];
                window.globalApiData.isLoaded = true;
                if (typeof window.showToast === 'function') window.showToast('Data berhasil dimuat!');
                // Re-render current reports if any are active
                if(window.renderLaporanTransaksiAccordion) window.renderLaporanTransaksiAccordion();
                if(window.renderLaporanOmzet) window.renderLaporanOmzet();
                if(window.renderLaporanArusKeuangan) window.renderLaporanArusKeuangan();
                if(window.renderLaporanPendapatan) {
                    window.renderLaporanPendapatan('hari-ini', 'transaksi');
                    window.renderLaporanPendapatan('hari-ini', 'lainnya');
                }
                if(window.renderLaporanPengeluaran) window.renderLaporanPengeluaran();
                if(window.renderLaporanLabaRugi) window.renderLaporanLabaRugi();
            }
        } catch (err) {
            console.error('Failed to fetch data:', err);
            if (typeof window.showToast === 'function') window.showToast('Gagal menarik data dari server.');
        }
    }

    // Utilities
    function parseDateString(dateStr) {
        if (!dateStr) return null;
        
        // Handle ISO string from Google Sheets directly
        if (dateStr.includes('T') && dateStr.endsWith('Z')) {
            return new Date(dateStr);
        }

        const parts = dateStr.split(' ');
        const dateParts = parts[0].split(/[/-]/);
        if (dateParts.length < 3) return null;
        let day = parseInt(dateParts[0], 10);
        let month = parseInt(dateParts[1], 10) - 1;
        let year = parseInt(dateParts[2], 10);
        
        if (year < 100) year += 2000;
        else if (dateParts[0].length === 4) { // YYYY-MM-DD
            year = parseInt(dateParts[0], 10);
            month = parseInt(dateParts[1], 10) - 1;
            day = parseInt(dateParts[2], 10);
        }
        
        let hours = 0;
        let minutes = 0;
        if (parts.length > 1) {
            const timeParts = parts[1].split(':');
            if (timeParts.length >= 2) {
                hours = parseInt(timeParts[0], 10);
                minutes = parseInt(timeParts[1], 10);
            }
        }
        return new Date(year, month, day, hours, minutes);
    }
    window.parseDateString = parseDateString;

    window.isDateInRange = function(dateObj, filterType, customStart, customEnd) {
        if (!dateObj) return false;
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const target = new Date(dateObj);
        target.setHours(0,0,0,0);
        
        if (filterType.startsWith('CUSTOM_MONTH_')) {
            // Format: CUSTOM_MONTH_YYYY-MM
            const parts = filterType.split('_')[2].split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            return dateObj.getFullYear() === year && dateObj.getMonth() === month;
        }

        switch (filterType) {
            case 'hari-ini':
                return target.getTime() === today.getTime();
            case 'kemarin':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return target.getTime() === yesterday.getTime();
            case '7-hari':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                return target >= sevenDaysAgo && target <= today;
            case '30-hari':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
                return target >= thirtyDaysAgo && target <= today;
            case 'bulan-ini':
                return target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear();
            case 'per-bulan':
                // For simplicity assuming current month if per-bulan is triggered without specific month selector
                return target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear();
            case 'per-tanggal':
                if (!customStart || !customEnd) return true;
                const start = parseDateString(customStart);
                if (start) start.setHours(0,0,0,0);
                const end = parseDateString(customEnd);
                if (end) end.setHours(23,59,59,999);
                if (!start || !end) return false;
                return target >= start && target <= end;
            case 'semua':
            default:
                return true;
        }
    }

    function getDB(keyPrefix) {
        if (keyPrefix === 'db_pemasukan') return window.globalApiData.pemasukan;
        if (keyPrefix === 'db_pengeluaran') return window.globalApiData.pengeluaran;
        return [];
    }

    function formatRupiah(number) {
        return new Intl.NumberFormat('id-ID').format(number);
    }
    
    function formatDateDisplay(dateObj) {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(dateObj.getDate())}/${pad(dateObj.getMonth() + 1)}/${dateObj.getFullYear()}`;
    }
    
    function formatTimeDisplay(dateObj) {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`;
    }

    function hookFilterEvents(prefix, renderFn) {
        const filterSel = document.getElementById(prefix + '-date-filter');
        const dateTxt = document.getElementById(prefix + '-date-text');
        if (filterSel && dateTxt) {
            filterSel.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'per-tanggal') {
                    const datePickerModal = document.getElementById('custom-date-picker-modal');
                    if (datePickerModal) {
                        datePickerModal.style.display = 'flex';
                        window.activeCustomDatePickerFilter = filterSel;
                        window.activeCustomDatePickerText = dateTxt;
                        window.activeCustomDatePickerRender = renderFn;
                    }
                } else if (val === 'per-bulan') {
                    if (typeof window.openMonthPicker === 'function') {
                        window.openMonthPicker(e.target);
                    }
                    return;
                } else if (val) {
                    if (val === 'hari-ini') dateTxt.innerText = formatDateDisplay(new Date());
                    else if (val === 'kemarin') {
                        let d = new Date(); d.setDate(d.getDate() - 1);
                        dateTxt.innerText = formatDateDisplay(d);
                    }
                    else if (val === '7-hari') dateTxt.innerText = '7 Hari Terakhir';
                    else if (val === '30-hari') dateTxt.innerText = '30 Hari Terakhir';
                    else if (val === 'bulan-ini') {
                        let d = new Date();
                        dateTxt.innerText = `01/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()} - ${new Date(d.getFullYear(), d.getMonth()+1, 0).getDate()}/${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getFullYear()}`;
                    }
                    else if (val.startsWith('CUSTOM_MONTH_')) {
                        const parts = val.split('_')[2].split('-');
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                        dateTxt.innerText = `${monthNames[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
                    }

                    if (typeof window.showToast === 'function') window.showToast('Memperbarui data laporan...');
                    if (renderFn) renderFn(val);
                }
            });
        }
    }

    // --- 1. LAPORAN TRANSAKSI ---
    window.renderLaporanTransaksiAccordion = function () {
        const container = document.getElementById('lap-transaksi-accordion-container');
        const emptyState = document.getElementById('lap-transaksi-empty-state');
        const dataState = document.getElementById('lap-transaksi-data-state');
        const totalCount = document.getElementById('lap-transaksi-total-count');
        const totalSub = document.getElementById('lap-transaksi-total-sub');
        const filterSel = document.getElementById('lap-transaksi-date-filter');

        if (!container) return;

        let dbPemasukan = getDB('db_pemasukan');
        const type = window.currentLaporanTransaksiType || 'Semua Transaksi';
        
        let filterVal = filterSel ? filterSel.value : '';
        if (filterVal === 'per-bulan') filterVal = 'bulan-ini';

        let filtered = dbPemasukan.filter(item => {
            if (item.type) return false; // Exclude pendapatan manual
            const dateObj = parseDateString(item.date);
            if (!dateObj) return false;

            if (filterVal && filterVal !== 'semua') {
                if (filterVal === 'per-tanggal') {
                    const start = filterSel ? filterSel.getAttribute('data-start') : null;
                    const end = filterSel ? filterSel.getAttribute('data-end') : null;
                    if (!window.isDateInRange(dateObj, filterVal, start, end)) return false;
                } else {
                    if (!window.isDateInRange(dateObj, filterVal)) return false;
                }
            }
            if (type === 'Transaksi Belum Lunas') {
                return (item.dibayar || 0) < (item.total || 0) && item.status !== 'batal';
            } else if (type === 'Transaksi Batal') {
                return item.status === 'batal' || item.status === 'Batal';
            } else {
                const secondaryFilterSel = document.getElementById('lap-transaksi-filter-select');
                const secondaryFilterVal = secondaryFilterSel ? secondaryFilterSel.value : 'Semua';
                const isBatal = item.status === 'batal' || item.status === 'Batal';
                const isLunas = (item.dibayar || 0) >= (item.total || 0);
                
                if (secondaryFilterVal === 'Lunas') return !isBatal && isLunas;
                if (secondaryFilterVal === 'Belum Lunas') return !isBatal && !isLunas;
                if (secondaryFilterVal === 'Batal') return isBatal;
                return !isBatal;
            }
        });

        if (filtered.length === 0) {
            if(dataState) dataState.style.display = 'flex';
            if(emptyState) emptyState.style.display = 'flex';
            if(container) container.style.display = 'none';
            if(totalCount) totalCount.innerText = '0';
            if(totalSub) totalSub.innerText = '(0 Total Qty)';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(container) container.style.display = 'flex';
        if(dataState) dataState.style.display = 'flex';

        const grouped = {};
        filtered.forEach(trx => {
            const d = parseDateString(trx.date);
            const dStr = formatDateDisplay(d);
            if (!grouped[dStr]) grouped[dStr] = [];
            grouped[dStr].push(trx);
        });

        let html = '';
        let totalQty = 0;
        let totalItems = 0;

        Object.keys(grouped).sort((a, b) => parseDateString(b) - parseDateString(a)).forEach((dateStr, index) => {
            let rowHtml = '';
            grouped[dateStr].forEach(trx => {
                totalItems++;
                const isLunas = (trx.dibayar || 0) >= (trx.total || 0);
                const statusStr = trx.status === 'batal' ? 'Batal' : (isLunas ? 'Lunas' : 'Belum Lunas');
                const pillStyle = statusStr === 'Lunas' ? 'background:#dcfce7; color:#16a34a;' : (statusStr === 'Batal' ? 'background:#fee2e2; color:#ef4444;' : 'background:#fee2e2; color:#991b1b;');
                const icon = trx.items && trx.items.length > 0 && trx.items[0].category === 'Satuan' ? 'https://cdn-icons-png.flaticon.com/512/3133/3133391.png' : 'https://cdn-icons-png.flaticon.com/512/8205/8205166.png';
                
                trx.items && trx.items.forEach(it => {
                    totalQty += (parseFloat(it.qty) || 0);
                });

                rowHtml += `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #f1f5f9;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <div style="width:45px; height:45px; border:1px solid #e2e8f0; border-radius:10px; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#f8fafc;">
                                <img src="${icon}" style="width:30px; object-fit:contain;" alt="item">
                            </div>
                            <div style="display:flex; flex-direction:column; gap:3px;">
                                <div style="font-size:0.95rem; color:#1e293b; font-weight:600;">${trx.id}</div>
                                <div style="font-size:0.75rem; color:#64748b;">Pelanggan : ${trx.customerName || trx.customer || 'Guest'}</div>
                                <div style="font-size:0.75rem; color:#64748b;">Status : <span style="color:#0ea5e9;">${trx.status || 'Baru'}</span></div>
                            </div>
                        </div>
                        <div style="padding:4px 10px; border-radius:12px; font-size:0.65rem; font-weight:700; ${pillStyle}">
                            ${statusStr}
                        </div>
                    </div>
                `;
            });

            html += `
                <div class="acc-item ${index === 0 ? 'active' : ''}" style="border-bottom:1px solid #f1f5f9; background:#fff; border-radius:0; border:none; margin:0;">
                    <div class="acc-header" style="background:#f8fafc; padding:10px 20px; font-size:0.85rem; font-weight:600; color:#3b82f6; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <i class="fa-solid fa-chevron-down acc-arrow" style="font-size:0.75rem; transition:transform 0.3s;"></i> ${dateStr}
                        </div>
                        <span style="color:#64748b; font-weight:500;">${grouped[dateStr].length} Transaksi</span>
                    </div>
                    <div class="acc-content" style="padding:0; max-height:none; overflow:visible; ${index === 0 ? 'display:block;' : 'display:none;'}">
                        ${rowHtml}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        if(totalCount) totalCount.innerText = totalItems;
        if(totalSub) totalSub.innerText = `(${Number.isInteger(totalQty) ? totalQty : totalQty.toFixed(2)} Total Qty)`;

        const accItems = container.querySelectorAll('.acc-item');
        accItems.forEach(item => {
            const header = item.querySelector('.acc-header');
            const content = item.querySelector('.acc-content');
            const arrow = item.querySelector('.acc-arrow');
            header.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                if (isActive) {
                    item.classList.remove('active');
                    content.style.display = 'none';
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                } else {
                    item.classList.add('active');
                    content.style.display = 'block';
                    if (arrow) arrow.style.transform = 'rotate(-180deg)';
                }
            });
            if (item.classList.contains('active') && arrow) arrow.style.transform = 'rotate(-180deg)';
        });

        // Expand/Collapse All Logic
        const btnExpandAll = document.getElementById('btn-lap-transaksi-expand-all');
        const btnCollapseAll = document.getElementById('btn-lap-transaksi-collapse-all');
        if (btnExpandAll) {
            // Remove old listeners by replacing element (simple trick to avoid multiple bindings if re-rendered)
            const newBtnE = btnExpandAll.cloneNode(true);
            btnExpandAll.parentNode.replaceChild(newBtnE, btnExpandAll);
            newBtnE.addEventListener('click', () => {
                accItems.forEach(item => {
                    item.classList.add('active');
                    item.querySelector('.acc-content').style.display = 'block';
                    const arrow = item.querySelector('.acc-arrow');
                    if (arrow) arrow.style.transform = 'rotate(-180deg)';
                });
            });
        }
        if (btnCollapseAll) {
            const newBtnC = btnCollapseAll.cloneNode(true);
            btnCollapseAll.parentNode.replaceChild(newBtnC, btnCollapseAll);
            newBtnC.addEventListener('click', () => {
                accItems.forEach(item => {
                    item.classList.remove('active');
                    item.querySelector('.acc-content').style.display = 'none';
                    const arrow = item.querySelector('.acc-arrow');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                });
            });
        }

        // Prepare Export Data
        const exportData = [];
        filtered.forEach(trx => {
            const d = parseDateString(trx.date);
            const tgl = ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + d.getFullYear();
            const waktu = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':00';
            
            let kategori = 'Kiloan';
            let qty = 0;
            let satuan = 'KG';
            if (trx.items && trx.items.length > 0) {
                const first = trx.items[0];
                kategori = first.category || (trx.items.some(i => (i.category||'').toLowerCase() === 'satuan') ? 'Satuan' : 'Kiloan');
                satuan = first.satuan || (kategori === 'Satuan' ? 'Pcs' : 'KG');
                trx.items.forEach(it => qty += (parseFloat(it.qty) || 0));
            }
            
            const isLunas = (trx.dibayar || 0) >= (trx.total || 0);
            
            exportData.push({
                'Tanggal': tgl,
                'Waktu': waktu,
                'No. Nota': trx.id,
                'Nama Pelanggan': trx.customerName || trx.customer || 'Guest',
                'Kategori (KG)/(Satuan)': kategori,
                'Spooting': trx.spooting ? 'Ya' : '-',
                'Status Pengambilan': trx.status === 'selesai' ? 'Diambil' : 'Belum Diambil',
                'Status Pembayaran': isLunas ? 'Lunas' : 'Belum Lunas',
                'Qty': qty,
                'Satuan/KG': satuan,
                'Harga': trx.total || 0,
                'Dibayar': trx.dibayar || 0,
                'Metode Pembayaran': (trx.dibayar > 0) ? (trx.cashbox || trx.metodeBayar || 'Tunai') : '-'
            });
        });
        window.currentLaporanTransaksiExportData = exportData;
    };

    // --- 2. OMZET ---
    window.renderLaporanOmzet = function (filterVal = 'hari-ini') {
        const layout = document.getElementById('layout-omzet');
        if (!layout) return;
        const emptyState = document.getElementById('omzet-empty-state');
        const dataState = document.getElementById('omzet-data-state');
        const filterSel = document.getElementById('omzet-date-filter');
        
        let dbPemasukan = getDB('db_pemasukan');
        let filtered = dbPemasukan.filter(item => {
            if (item.type) return false; // POS only
            if (item.status === 'batal' || item.status === 'Batal') return false; // Ignore batal
            const dateObj = parseDateString(item.date);
            if (filterVal === 'per-tanggal') {
                const start = filterSel ? filterSel.getAttribute('data-start') : null;
                const end = filterSel ? filterSel.getAttribute('data-end') : null;
                return window.isDateInRange(dateObj, filterVal, start, end);
            }
            return window.isDateInRange(dateObj, filterVal);
        });

        if (filtered.length === 0) {
            if(emptyState) emptyState.style.display = 'flex';
            if(dataState) dataState.style.display = 'none';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(dataState) dataState.style.display = 'flex';

        let totalOmzet = 0;
        let isPerJam = (filterVal === 'hari-ini' || filterVal === 'kemarin');

        const grouped = {};
        filtered.forEach(trx => {
            const val = parseFloat(trx.total) || 0;
            totalOmzet += val;
            const d = parseDateString(trx.date);
            let key = isPerJam ? `${formatDateDisplay(d)} ${d.getHours().toString().padStart(2, '0')}:00` : formatDateDisplay(d);
            
            if (!grouped[key]) grouped[key] = { count: 0, nominal: 0 };
            grouped[key].count++;
            grouped[key].nominal += val;
        });

        // Update Total Omzet UI
        const spanTotal = layout.querySelector('span[style*="1.8rem"]');
        if (spanTotal) spanTotal.innerText = formatRupiah(totalOmzet);

        // Update Table
        const tbody = document.getElementById('omzet-tbody');
        const thWaktu = document.getElementById('omzet-th-waktu');
        if (thWaktu) thWaktu.innerText = isPerJam ? 'Jam' : 'Tanggal';

        let html = '';
        const sortedKeys = Object.keys(grouped).sort(); // Sort chronologically
        let chartLabels = [];
        let chartData = [];

        sortedKeys.forEach(k => {
            let label = isPerJam ? k.split(' ')[1] : k;
            chartLabels.push(label);
            chartData.push(grouped[k].nominal);

            html += `
                <tr>
                    <td style="padding-bottom:15px;">${label}</td>
                    <td style="padding-bottom:15px; text-align:center;">${grouped[k].count}</td>
                    <td style="padding-bottom:15px; text-align:right;">${formatRupiah(grouped[k].nominal)}</td>
                </tr>
            `;
        });
        if (tbody) tbody.innerHTML = html;

        // Render Chart
        let ctx = document.getElementById('omzetChart');
        if (ctx) {
            let newCtx = document.createElement('canvas');
            newCtx.id = 'omzetChart';
            ctx.parentNode.replaceChild(newCtx, ctx);
            ctx = newCtx;
            window.omzetChartInstance = new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: 'Omzet',
                        data: chartData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false } },
                        y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { callback: v => (v/1000)+'k' } }
                    }
                }
            });
        }
    };

    // --- 3. ARUS KEUANGAN ---
    window.renderLaporanArusKeuangan = function (filterVal = 'hari-ini') {
        const layout = document.getElementById('layout-arus-keuangan');
        if (!layout) return;
        const emptyState = document.getElementById('arus-empty-state');
        const dataState = document.getElementById('arus-data-state');
        const filterSel = document.getElementById('arus-date-filter');
        
        let dbPem = getDB('db_pemasukan');
        let dbPeng = getDB('db_pengeluaran');

        let allData = [];
        dbPem.forEach(x => allData.push({...x, isMasuk: true}));
        dbPeng.forEach(x => allData.push({...x, isMasuk: false}));
        
        // Sort ascending
        allData.sort((a, b) => {
            const da = parseDateString(a.date);
            const db = parseDateString(b.date);
            return da - db;
        });

        const filterStartDates = {
            'hari-ini': new Date().setHours(0,0,0,0),
            'kemarin': new Date(new Date().setDate(new Date().getDate()-1)).setHours(0,0,0,0),
            '7-hari': new Date(new Date().setDate(new Date().getDate()-6)).setHours(0,0,0,0),
            '30-hari': new Date(new Date().setDate(new Date().getDate()-29)).setHours(0,0,0,0),
            'bulan-ini': new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
        };

        const cutoffTime = filterStartDates[filterVal] || 0;

        let saldoSebelum = 0;
        let totalMasuk = 0;
        let totalKeluar = 0;
        let filtered = [];

        allData.forEach(item => {
            const itemTime = parseDateString(item.date).getTime();
            let amount = parseFloat(item.type ? item.nominal : (item.dibayar || 0)) || 0;
            
            if (filterVal !== 'semua' && itemTime < cutoffTime) {
                if (item.isMasuk) saldoSebelum += amount;
                else saldoSebelum -= amount;
            } else {
                let inRange = false;
                if (filterVal === 'per-tanggal') {
                    const start = filterSel ? filterSel.getAttribute('data-start') : null;
                    const end = filterSel ? filterSel.getAttribute('data-end') : null;
                    inRange = window.isDateInRange(parseDateString(item.date), filterVal, start, end);
                } else {
                    inRange = window.isDateInRange(parseDateString(item.date), filterVal);
                }
                if (inRange) {
                    filtered.push(item);
                    if (item.isMasuk) totalMasuk += amount;
                    else totalKeluar += amount;
                }
            }
        });

        if (filtered.length === 0 && saldoSebelum === 0) {
            if(emptyState) emptyState.style.display = 'flex';
            if(dataState) dataState.style.display = 'none';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(dataState) dataState.style.display = 'flex';

        const spans = layout.querySelectorAll('span[style*="1.2rem"]');
        if(spans.length >= 2) {
            spans[0].innerText = formatRupiah(totalMasuk);
            spans[1].innerText = formatRupiah(totalKeluar);
        }

        const tbody = document.getElementById('arus-tbody');
        let html = '';
        filtered.reverse().forEach(item => {
            let amount = parseFloat(item.type ? item.nominal : (item.dibayar || 0)) || 0;
            let ket = item.type ? (item.keterangan || item.category || 'Manual') : `Transaksi ${item.id}`;
            let dateD = formatDateDisplay(parseDateString(item.date));

            html += `
                <tr>
                    <td style="padding-bottom:15px; vertical-align:top;">${dateD}</td>
                    <td style="padding-bottom:15px; vertical-align:top;">${ket}</td>
                    <td style="padding-bottom:15px; text-align:right; vertical-align:top; color:${item.isMasuk?'#16a34a':''};">${item.isMasuk ? formatRupiah(amount) : '-'}</td>
                    <td style="padding-bottom:15px; text-align:right; vertical-align:top; color:${!item.isMasuk?'#ef4444':''};">${!item.isMasuk ? formatRupiah(amount) : '-'}</td>
                </tr>
            `;
        });
        if (tbody) tbody.innerHTML = html;
    };

    // --- 4. PENDAPATAN ---
    window.renderLaporanPendapatan = function (filterVal = 'hari-ini', mode = 'transaksi') {
        const isTransaksi = mode === 'transaksi';
        const layoutId = isTransaksi ? 'layout-pendapatan-transaksi' : 'layout-pendapatan-lainnya';
        const layout = document.getElementById(layoutId);
        if (!layout) return;

        const emptyState = document.getElementById(isTransaksi ? 'pendapatan-empty-state' : 'lainnya-empty-state');
        const dataState = document.getElementById(isTransaksi ? 'pendapatan-data-state' : 'lainnya-data-state');
        const filterSel = document.getElementById(isTransaksi ? 'pendapatan-date-filter' : 'lainnya-date-filter');
        
        let db = getDB('db_pemasukan');
        let total = 0;
        let filtered = db.filter(item => {
            if (isTransaksi && item.type) return false;
            if (!isTransaksi && !item.type) return false;
            if (item.status === 'batal' || item.status === 'Batal') return false;

            const dateObj = parseDateString(item.date);
            if (filterVal === 'per-tanggal') {
                const start = filterSel ? filterSel.getAttribute('data-start') : null;
                const end = filterSel ? filterSel.getAttribute('data-end') : null;
                return window.isDateInRange(dateObj, filterVal, start, end);
            }
            return window.isDateInRange(dateObj, filterVal);
        });

        if (filtered.length === 0) {
            if(emptyState) emptyState.style.display = 'flex';
            if(dataState) dataState.style.display = 'none';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(dataState) dataState.style.display = 'flex';

        const exportData = [];
        filtered.forEach(item => {
            total += parseFloat(isTransaksi ? (item.dibayar || 0) : (item.nominal || 0));
            
            if (isTransaksi) {
                const d = parseDateString(item.date) || new Date();
                const tgl = ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth()+1)).slice(-2) + '-' + d.getFullYear();
                exportData.push({
                    'Tanggal': tgl,
                    'Nama': item.customerName || item.customer || 'Guest',
                    'Kode': item.id || '-',
                    'Metode': item.cashbox || item.metodeBayar || 'Tunai',
                    'Nominal': parseFloat(item.dibayar || item.total || 0)
                });
            }
        });

        if (isTransaksi) {
            window.currentPendapatanTransaksiExportData = exportData;
        }

        const spanTotal = layout.querySelector('span[style*="1.6rem"]');
        if (spanTotal) spanTotal.innerText = formatRupiah(total);
        
        // Dynamically define the renderer to replace the dummy ones in index.html
        const renderFunc = function(cashboxFilter = 'Semua') {
            const container = document.getElementById(isTransaksi ? 'pendapatan-accordion-container' : 'lainnya-accordion-container');
            if (!container) return;

            const grouped = {};
            exportData.forEach(item => {
                if (!grouped[item.Tanggal]) grouped[item.Tanggal] = { dateText: item.Tanggal, items: [] };
                grouped[item.Tanggal].items.push({
                    nama: item.Nama,
                    kode: item.Kode,
                    metode: item.Metode,
                    nominal: item.Nominal
                });
            });
            const groupedDataRaw = Object.values(grouped);

            let html = '';
            let globalTotal = 0;

            groupedDataRaw.forEach((group) => {
                let filteredItems = group.items;
                if (cashboxFilter !== 'Semua') {
                    filteredItems = group.items.filter(item => item.metode === cashboxFilter);
                }
                if (filteredItems.length > 0) {
                    let groupTotal = 0;
                    let itemsHtml = '';
                    filteredItems.forEach(item => {
                        const isQris = item.metode === 'QRIS';
                        groupTotal += item.nominal;
                        itemsHtml += `
                          <div style="display:flex; justify-content:space-between; align-items:center; padding:15px 20px; border-bottom:1px solid #f1f5f9;">
                              <div>
                                  <div style="color:#334155; font-weight:500; font-size:0.9rem; margin-bottom:4px;">${isTransaksi ? 'Pembayaran dari ' : ''}${item.nama}</div>
                                  <div style="color:#94a3b8; font-size:0.75rem;">Kode : ${item.kode} (<span style="color:${isQris ? '#ef4444' : (item.metode === 'Tunai' ? '#8b5cf6' : '#3b82f6')}; font-weight:600;">${item.metode}</span>)</div>
                              </div>
                              <div style="color:#1e293b; font-weight:600; font-size:0.95rem;">
                                  ${item.nominal.toLocaleString('en-US')}
                              </div>
                          </div>
                      `;
                    });
                    globalTotal += groupTotal;
                    html += `
                      <div class="pendapatan-group">
                          <div class="pendapatan-header" style="display:flex; justify-content:space-between; align-items:center; padding:12px 20px; background:#f0f9ff; cursor:pointer;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'; const icon = this.querySelector('i'); icon.style.transform = this.nextElementSibling.style.display === 'none' ? 'rotate(-90deg)' : 'rotate(0deg)';">
                              <div style="color:#0ea5e9; font-weight:600; font-size:0.85rem; display:flex; align-items:center; gap:8px;">
                                  <i class="fa-solid fa-chevron-down" style="transition:transform 0.3s;"></i> ${group.dateText}
                              </div>
                              <div style="color:#0ea5e9; font-weight:700; font-size:0.95rem;">
                                  ${groupTotal.toLocaleString('en-US')}
                              </div>
                          </div>
                          <div class="pendapatan-items" style="display:block; background:#ffffff;">
                              ${itemsHtml}
                          </div>
                      </div>
                  `;
                }
            });

            container.innerHTML = html;
            const totalTextElement = document.querySelector(isTransaksi ? '#pendapatan-data-state div > span[style*="font-size:1.6rem"]' : '#lainnya-data-state div > span[style*="font-size:1.6rem"]');
            if (totalTextElement) {
                totalTextElement.innerText = globalTotal.toLocaleString('en-US');
            }
        };

        if (isTransaksi) {
            window.renderPendapatanAccordion = renderFunc;
            window.renderPendapatanAccordion();
        } else {
            window.renderLainnyaAccordion = renderFunc;
            window.renderLainnyaAccordion();
        }
    };

    // --- 5. PENGELUARAN ---
    window.renderLaporanPengeluaran = function (filterVal = 'hari-ini') {
        const layout = document.getElementById('layout-pengeluaran');
        if (!layout) return;

        const emptyState = document.getElementById('pengeluaran-empty-state');
        const dataState = document.getElementById('pengeluaran-data-state');
        const filterSel = document.getElementById('pengeluaran-date-filter');
        
        let db = getDB('db_pengeluaran');
        let total = 0;
        let filtered = db.filter(item => {
            if (filterVal === 'per-tanggal') {
                const start = filterSel ? filterSel.getAttribute('data-start') : null;
                const end = filterSel ? filterSel.getAttribute('data-end') : null;
                return window.isDateInRange(parseDateString(item.date), filterVal, start, end);
            }
            return window.isDateInRange(parseDateString(item.date), filterVal);
        });
        if (filtered.length === 0) {
            if(emptyState) emptyState.style.display = 'flex';
            if(dataState) dataState.style.display = 'none';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(dataState) dataState.style.display = 'flex';

        filtered.forEach(item => total += (parseFloat(item.nominal) || 0));

        const spanTotal = layout.querySelector('span[style*="1.8rem"]');
        if (spanTotal) spanTotal.innerText = formatRupiah(total);
        
        const container = document.getElementById('pengeluaran-accordion-container');
        if (container) {
            let html = '';
            filtered.forEach(item => {
                html += `
                    <div style="padding:15px 20px; border-bottom:1px solid #f1f5f9; display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:600; color:#1e293b;">${item.category || 'Manual'}</div>
                            <div style="font-size:0.8rem; color:#64748b;">${formatDateDisplay(parseDateString(item.date))} - ${item.keterangan || '-'}</div>
                        </div>
                        <div style="font-weight:700; color:#ef4444;">Rp ${formatRupiah(item.nominal)}</div>
                    </div>
                `;
            });
            container.innerHTML = html;
        }
    };

    // --- 6. LABA RUGI ---
    window.renderLaporanLabaRugi = function (filterVal = 'hari-ini') {
        const layout = document.getElementById('layout-laba-rugi');
        if (!layout) return;

        const emptyState = document.getElementById('laba-rugi-empty-state');
        const dataState = document.getElementById('laba-rugi-data-state');
        const filterSel = document.getElementById('laba-rugi-date-filter');
        
        let dbPem = getDB('db_pemasukan');
        let dbPeng = getDB('db_pengeluaran');

        let totalPemasukan = 0;
        let totalPengeluaran = 0;

        let pemFilter = dbPem.filter(item => {
            if (item.status === 'batal') return false;
            if (filterVal === 'per-tanggal') {
                const start = filterSel ? filterSel.getAttribute('data-start') : null;
                const end = filterSel ? filterSel.getAttribute('data-end') : null;
                return window.isDateInRange(parseDateString(item.date), filterVal, start, end);
            }
            return window.isDateInRange(parseDateString(item.date), filterVal);
        });
        let pengFilter = dbPeng.filter(item => {
            if (filterVal === 'per-tanggal') {
                const start = filterSel ? filterSel.getAttribute('data-start') : null;
                const end = filterSel ? filterSel.getAttribute('data-end') : null;
                return window.isDateInRange(parseDateString(item.date), filterVal, start, end);
            }
            return window.isDateInRange(parseDateString(item.date), filterVal);
        });
        pemFilter.forEach(x => totalPemasukan += (parseFloat(x.type ? x.nominal : x.dibayar) || 0));
        pengFilter.forEach(x => totalPengeluaran += (parseFloat(x.nominal) || 0));

        if (totalPemasukan === 0 && totalPengeluaran === 0) {
            if(emptyState) emptyState.style.display = 'flex';
            if(dataState) dataState.style.display = 'none';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(dataState) dataState.style.display = 'flex';

        const lPendapatan = document.getElementById('lr-total-pendapatan');
        const lPengeluaran = document.getElementById('lr-total-pengeluaran');
        
        if (lPendapatan) lPendapatan.innerText = formatRupiah(totalPemasukan);
        if (lPengeluaran) lPengeluaran.innerText = formatRupiah(totalPengeluaran);
        
        // Find Laba Bersih ID, currently missing ID in index, but we can do a selector
        // The Laba Bersih is the last massive span with 1.8rem
        const spans = layout.querySelectorAll('span[style*="1.8rem"]');
        if (spans.length > 0) {
            const laba = totalPemasukan - totalPengeluaran;
            spans[spans.length - 1].innerText = formatRupiah(Math.abs(laba));
            // You can also change the label to 'Rugi Bersih' if laba < 0, but Laba Bersih is standard
        }
    };

    // --- BIND EVENT LISTENERS ---
    setTimeout(() => {
        // Global hook for custom date picker apply
        const btnModalOkeGlobal = document.getElementById('btn-modal-oke');
        if (btnModalOkeGlobal) {
            btnModalOkeGlobal.addEventListener('click', () => {
                if (window.activeCustomDatePickerFilter) {
                    setTimeout(() => {
                        const txt = window.activeCustomDatePickerText ? window.activeCustomDatePickerText.innerText : '';
                        const filterSel = window.activeCustomDatePickerFilter;
                        if (txt.includes('-')) {
                            const parts = txt.split('-');
                            filterSel.setAttribute('data-start', parts[0].trim());
                            filterSel.setAttribute('data-end', parts[1].trim());
                        } else {
                            filterSel.setAttribute('data-start', txt.trim());
                            filterSel.setAttribute('data-end', txt.trim());
                        }
                        if (typeof window.activeCustomDatePickerRender === 'function') {
                            window.activeCustomDatePickerRender();
                        }
                    }, 50); // wait for index.html to update the text
                }
            });
        }

        hookFilterEvents('omzet', window.renderLaporanOmzet);
        hookFilterEvents('arus', window.renderLaporanArusKeuangan);
        hookFilterEvents('pendapatan', (val) => window.renderLaporanPendapatan(val, 'transaksi'));
        hookFilterEvents('lainnya', (val) => window.renderLaporanPendapatan(val, 'lainnya'));
        hookFilterEvents('pengeluaran', window.renderLaporanPengeluaran);
        hookFilterEvents('laba-rugi', window.renderLaporanLabaRugi);
        hookFilterEvents('lap-transaksi', () => { window.renderLaporanTransaksiAccordion(); });
        
        const lapSecondaryFilter = document.getElementById('lap-transaksi-filter-select');
        if (lapSecondaryFilter) {
            lapSecondaryFilter.addEventListener('change', (e) => {
                const textEl = document.getElementById('lap-transaksi-filter-text');
                if (textEl) textEl.innerText = e.target.options[e.target.selectedIndex].text;
                if (typeof window.renderLaporanTransaksiAccordion === 'function') window.renderLaporanTransaksiAccordion();
            });
        }
        
        // Initial Fetch which triggers renders
        fetchApiData();
    }, 1000);

})();
