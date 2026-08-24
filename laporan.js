// Laporan Module
// Handles data fetching and rendering for all Laporan layouts

(function() {
    window.formatRupiah = function(angka) {
        if (angka === undefined || angka === null || isNaN(angka)) return '0';
        return Number(angka).toLocaleString('id-ID');
    };
    const formatRupiah = window.formatRupiah;window.globalApiData = {
        pemasukan: [],
        pengeluaran: [],
        isLoaded: false
    };

    window.getDB = function(key) {
        const activeOutlet = localStorage.getItem('active_outlet_id') || 'PUSAT';
        const finalKey = activeOutlet === 'PUSAT' ? key : key + '_' + activeOutlet;
        return JSON.parse(localStorage.getItem(finalKey) || '[]');
    };

    window.getMergedPemasukan = function() {
        const localPem = window.getDB('db_pemasukan');
        const dbPemMap = new Map();
        (window.globalApiData.pemasukan || []).forEach(x => { if(x.id) dbPemMap.set(x.id, x); });
        localPem.forEach(x => { if(x.id) dbPemMap.set(x.id, x); });
        return Array.from(dbPemMap.values());
    };

    window.getMergedPengeluaran = function() {
        const localPeng = window.getDB('db_pengeluaran');
        const dbPengMap = new Map();
        (window.globalApiData.pengeluaran || []).forEach(x => { if(x.id) dbPengMap.set(x.id, x); });
        localPeng.forEach(x => { if(x.id) dbPengMap.set(x.id, x); });
        return Array.from(dbPengMap.values());
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
                window.globalApiData = result.data;
                window.globalApiData.isLoaded = true;
                
                if(window.renderLaporanPendapatan) window.renderLaporanPendapatan();
                if(window.renderLaporanPengeluaran) window.renderLaporanPengeluaran();
                if(window.renderLaporanLabaRugi) window.renderLaporanLabaRugi();
                if(window.renderLaporanTransaksiAccordion) window.renderLaporanTransaksiAccordion();
            }

        } catch (err) {
            console.error('Failed to fetch data:', err);
            if (typeof window.showToast === 'function') window.showToast('Gagal menarik data dari server.');
        }
    }

    // Utilities
    window.isDateInRange = function(dateObj, filterVal, startStr = null, endStr = null) {
        if (!filterVal || filterVal === 'semua') return true;
        if (!dateObj || isNaN(dateObj)) return false;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const dDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        
        if (filterVal === 'hari-ini') {
            return dDate.getTime() === today.getTime();
        } else if (filterVal === 'kemarin') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return dDate.getTime() === yesterday.getTime();
        } else if (filterVal === '7-hari') {
            const past7 = new Date(today);
            past7.setDate(past7.getDate() - 6);
            return dDate >= past7 && dDate <= today;
        } else if (filterVal === '30-hari') {
            const past30 = new Date(today);
            past30.setDate(past30.getDate() - 29);
            return dDate >= past30 && dDate <= today;
        } else if (filterVal === 'bulan-ini') {
            return dateObj.getFullYear() === now.getFullYear() && dateObj.getMonth() === now.getMonth();
        } else if (filterVal.startsWith('CUSTOM_MONTH_')) {
            const parts = filterVal.split('_')[2].split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            return dateObj.getFullYear() === year && dateObj.getMonth() === month;
        } else if (filterVal === 'per-tanggal' || filterVal === 'CUSTOM_DATE_RANGE') {
            if (!startStr) return true;
            const startD = window.parseDateString(startStr);
            if (startD) startD.setHours(0,0,0,0);
            const endD = endStr ? window.parseDateString(endStr) : window.parseDateString(startStr);
            if (endD) endD.setHours(23,59,59,999);
            if (!startD || !endD || isNaN(startD) || isNaN(endD)) return false;
            return dateObj >= startD && dateObj <= endD;
        }
        return true;
    };

    window.parseDateString = function(dateStr, notaId) {
        if (!dateStr) return null;
        let d;
        try {
            if (typeof dateStr === 'number') {
                return new Date(dateStr);
            }
            if (dateStr instanceof Date) {
                return dateStr;
            }
            dateStr = String(dateStr).trim();
            if (dateStr.includes('T')) {
                d = new Date(dateStr);
            } else {
                const parts = dateStr.split(' ');
                const dateParts = parts[0].split(/[/-]/);
                if (dateParts.length >= 3) {
                    let day = parseInt(dateParts[0], 10);
                    let month = parseInt(dateParts[1], 10) - 1;
                    let year = parseInt(dateParts[2], 10);
                    if (year < 100) year += 2000;
                    else if (dateParts[0].length === 4) {
                        year = parseInt(dateParts[0], 10);
                        month = parseInt(dateParts[1], 10) - 1;
                        day = parseInt(dateParts[2], 10);
                    }
                    let hours = 0, minutes = 0;
                    if (parts.length > 1) {
                        const timeParts = parts[1].split(':');
                        if (timeParts.length >= 2) {
                            hours = parseInt(timeParts[0], 10);
                            minutes = parseInt(timeParts[1], 10);
                        }
                    }
                    d = new Date(year, month, day, hours, minutes, 0);
                } else {
                    d = new Date(dateStr);
                }
            }
        } catch (err) {
            d = new Date(dateStr);
        }
        
        let valid = d && !isNaN(d);
        if (!valid) return null;

        if (notaId) {
            if (notaId.startsWith('MJL-')) {
                let match = notaId.match(/MJL-(\d{2})(\d{2})-/);
                if (match) {
                    let trueMonthIdx = parseInt(match[1], 10) - 1;
                    let trueMonthNum = parseInt(match[1], 10);
                    let trueYear = 2000 + parseInt(match[2], 10);
                    let pd = d.getDate();
                    let pm = d.getMonth() + 1;
                    let py = d.getFullYear();
                    
                    if (py === trueYear) {
                        if (pm === trueMonthNum) return d;
                        if (pd === trueMonthNum) {
                            return new Date(trueYear, trueMonthIdx, pm, d.getHours(), d.getMinutes(), 0);
                        }
                    }
                }
            } else if (notaId.match(/^(TRF-OUT|TRF-IN|KOR-IN|KOR-OUT)-/)) {
                let ts = parseInt(notaId.split('-').pop(), 10);
                if (!isNaN(ts) && ts > 1600000000000) {
                    return new Date(ts);
                }
            }
        }
        return d;
    }
    function formatDateDisplay(dateObj) {
        if (!dateObj || isNaN(dateObj)) return '-';
        return dateObj.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'});
    }
    window.formatDateDisplay = formatDateDisplay;

    function formatTimeDisplay(dateObj) {
        const pad = (n) => n.toString().padStart(2, '0');
        return pad(dateObj.getHours()) + ':' + pad(dateObj.getMinutes());
    }

    function hookFilterEvents(prefix, renderFn) {
        const filterSel = document.getElementById(prefix + '-date-filter');
        const dateTxt = document.getElementById(prefix + '-date-text');
        const cashboxSel = document.getElementById(prefix + '-cashbox-filter');

        if (cashboxSel) {
            const cloneCb = cashboxSel.cloneNode(true);
            cashboxSel.parentNode.replaceChild(cloneCb, cashboxSel);
            const newCashboxSel = document.getElementById(prefix + '-cashbox-filter');
            const cbTxt = document.getElementById(prefix + '-cashbox-text');
            if (newCashboxSel && cbTxt) {
                newCashboxSel.addEventListener('change', (e) => {
                    cbTxt.innerText = e.target.value;
                    if (typeof renderFn === 'function') {
                        renderFn(document.getElementById(prefix + '-date-filter').value);
                    }
                });
            }
        }

        if (filterSel && dateTxt) {
            const clone = filterSel.cloneNode(true);
            filterSel.parentNode.replaceChild(clone, filterSel);
            const newFilterSel = document.getElementById(prefix + '-date-filter');
            newFilterSel.addEventListener('change', (e) => {
                const val = e.target.value;
                if (val === 'per-tanggal') {
                    const datePickerModal = document.getElementById('custom-date-picker-modal');
                    if (datePickerModal) {
                        datePickerModal.style.display = 'flex';
                        window.activeCustomDatePickerFilter = newFilterSel;
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

        let dbPemasukan = window.getMergedPemasukan();
        const type = window.currentLaporanTransaksiType || 'Semua Transaksi';
        
        let filterVal = filterSel ? filterSel.value : '';
        if (filterVal === 'per-bulan') filterVal = 'bulan-ini';

        let filtered = dbPemasukan.filter(item => {
            if (item.type) return false; // Exclude pendapatan manual
            const dateObj = parseDateString(item.date);
            if (!dateObj) return false;

            if (filterVal && filterVal !== 'semua') {
                if (filterVal === 'per-tanggal' || filterVal === 'CUSTOM_DATE_RANGE') {
                    const start = filterSel ? filterSel.getAttribute('data-start') : null;
                    const end = filterSel ? filterSel.getAttribute('data-end') : null;
                    if (!window.isDateInRange(dateObj, filterVal, start, end)) return false;
                } else {
                    if (!window.isDateInRange(dateObj, filterVal)) return false;
                }
            }
            const secondaryFilterSel = document.getElementById('lap-transaksi-filter-select');
            const secondaryFilterVal = secondaryFilterSel ? secondaryFilterSel.value : 'Semua';
            const isBatal = item.status === 'batal' || item.status === 'Batal';
            const dibayar = parseFloat(item.dibayar) || 0;
            const total = parseFloat(item.total) || 0;
            const isLunas = dibayar >= total;
            
            if (secondaryFilterVal === 'Lunas') return !isBatal && isLunas;
            if (secondaryFilterVal === 'Belum Lunas') return !isBatal && !isLunas;
            if (secondaryFilterVal === 'Batal') return isBatal;
            return !isBatal;
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

        if (totalCount) totalCount.innerText = totalItems.toString();
        if (totalSub) totalSub.innerText = '(' + totalQty + ' Total Qty)';

        container.innerHTML = html;

        const accItems = container.querySelectorAll('.acc-item');
        accItems.forEach(item => {
            const header = item.querySelector('.acc-header');
            if (header) {
                header.addEventListener('click', () => {
                    item.classList.toggle('active');
                    const content = item.querySelector('.acc-content');
                    const arrow = item.querySelector('.acc-arrow');
                    const isActive = item.classList.contains('active');
                    if (content) content.style.display = isActive ? 'block' : 'none';
                    if (arrow) arrow.style.transform = isActive ? 'rotate(-180deg)' : 'rotate(0deg)';
                });
            }
        });

        const btnExpandAll = document.getElementById('btn-lap-transaksi-expand-all');
        const btnCollapseAll = document.getElementById('btn-lap-transaksi-collapse-all');
        
        if (btnExpandAll) {
            const newBtnE = btnExpandAll.cloneNode(true);
            btnExpandAll.parentNode.replaceChild(newBtnE, btnExpandAll);
            newBtnE.addEventListener('click', () => {
                accItems.forEach(item => {
                    item.classList.add('active');
                    const content = item.querySelector('.acc-content');
                    if (content) content.style.display = 'block';
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
                    const content = item.querySelector('.acc-content');
                    if (content) content.style.display = 'none';
                    const arrow = item.querySelector('.acc-arrow');
                    if (arrow) arrow.style.transform = 'rotate(0deg)';
                });
            });
        }
    }

    window.renderLaporanPendapatan = function (filterVal = 'hari-ini', type = 'transaksi') {
        const layout = document.getElementById(type === 'transaksi' ? 'layout-pendapatan-transaksi' : 'layout-pendapatan-lainnya');
        if (!layout) return;

        const emptyState = document.getElementById(type === 'transaksi' ? 'pendapatan-empty-state' : 'lainnya-empty-state');
        const dataState = document.getElementById(type === 'transaksi' ? 'pendapatan-data-state' : 'lainnya-data-state');
        const filterSel = document.getElementById(type === 'transaksi' ? 'pendapatan-date-filter' : 'lainnya-date-filter');
        
        let dbPemasukan = window.getMergedPemasukan();
        let globalTotal = 0;
        let isTransaksi = (type === 'transaksi');

        const renderFunc = function() {
            let filtered = dbPemasukan.filter(item => {
                if (isTransaksi) {
                    if (item.type) return false;
                } else {
                    if (!item.type) return false;
                }
                if (filterVal === 'per-tanggal' || filterVal === 'CUSTOM_DATE_RANGE') {
                    const start = filterSel ? filterSel.getAttribute('data-start') : null;
                    const end = filterSel ? filterSel.getAttribute('data-end') : null;
                    if (!window.isDateInRange(parseDateString(item.date), filterVal, start, end)) return false;
                } else {
                    if (!window.isDateInRange(parseDateString(item.date), filterVal)) return false;
                }
                
                // Check Cashbox filter
                const cashboxFilterEl = document.getElementById(isTransaksi ? 'pendapatan-cashbox-filter' : 'lainnya-cashbox-filter');
                const cashboxVal = cashboxFilterEl ? cashboxFilterEl.value : 'Semua';
                if (cashboxVal !== 'Semua') {
                    const metode = item.metode_pembayaran || item.cashbox || 'Tunai';
                    if (metode.toUpperCase() !== cashboxVal.toUpperCase()) return false;
                }
                
                return true;
            });

            if (filtered.length === 0) {
                if (emptyState) emptyState.style.display = 'flex';
                if (dataState) dataState.style.display = 'none';
                return;
            }

            if (emptyState) emptyState.style.display = 'none';
            if (dataState) dataState.style.display = 'block';

            globalTotal = 0;
            const grouped = {};
            filtered.forEach(item => {
                const itemNominal = isTransaksi ? (parseFloat(item.dibayar) || parseFloat(item.total) || 0) : (parseFloat(item.nominal) || 0);
                globalTotal += itemNominal;
                const d = parseDateString(item.date);
                const dStr = formatDateDisplay(d);
                if (!grouped[dStr]) grouped[dStr] = [];
                grouped[dStr].push(item);
            });

            const container = document.getElementById(isTransaksi ? 'pendapatan-accordion-container' : 'lainnya-accordion-container');
            if (!container) return;
            
            let html = '';
            Object.keys(grouped).sort((a, b) => parseDateString(b) - parseDateString(a)).forEach((dateStr, index) => {
                let rowHtml = '';
                let dailyTotal = 0;
                grouped[dateStr].forEach(item => {
                    const itemNominal = isTransaksi ? (parseFloat(item.dibayar) || parseFloat(item.total) || 0) : (parseFloat(item.nominal) || 0);
                    dailyTotal += itemNominal;
                    rowHtml += `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #f1f5f9;">
                            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                <span style="font-weight:600; color:#1e293b;">${item.id}</span>
                                <span style="font-size:0.8rem; color:#64748b;">- ${typeof formatTimeDisplay === 'function' ? formatTimeDisplay(parseDateString(item.date)) : (item.date ? item.date.substring(11,16) : '')} - ${item.customerName || item.customer || 'Guest'}</span>
                            </div>
                            <div style="font-weight:700; color:#10b981;">Rp ${formatRupiah(itemNominal)}</div>
                        </div>
                    `;
                });

                html += `
                    <div class="acc-item ${index === 0 ? 'active' : ''}" style="border-bottom:1px solid #f1f5f9; background:#fff; margin-bottom:10px; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden;">
                        <div class="acc-header" style="background:#f8fafc; padding:15px 20px; font-weight:600; color:#1e293b; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-chevron-down acc-arrow" style="font-size:0.85rem; color:#64748b; transition:transform 0.3s; transform:${index === 0 ? 'rotate(-180deg)' : 'rotate(0deg)'}"></i>
                                ${dateStr}
                            </div>
                            <div style="color:#10b981; font-weight:700;">Rp ${formatRupiah(dailyTotal)}</div>
                        </div>
                        <div class="acc-content" style="padding:0; ${index === 0 ? 'display:block;' : 'display:none;'}">
                            ${rowHtml}
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            const accItems = container.querySelectorAll('.acc-item');
            accItems.forEach(item => {
                const header = item.querySelector('.acc-header');
                if (header) {
                    header.addEventListener('click', () => {
                        item.classList.toggle('active');
                        const content = item.querySelector('.acc-content');
                        const arrow = item.querySelector('.acc-arrow');
                        const isActive = item.classList.contains('active');
                        if (content) content.style.display = isActive ? 'block' : 'none';
                        if (arrow) arrow.style.transform = isActive ? 'rotate(-180deg)' : 'rotate(0deg)';
                    });
                }
            });

            const totalTextElement = document.querySelector(isTransaksi ? '#pendapatan-data-state div > span[style*="font-size:1.6rem"]' : '#lainnya-data-state div > span[style*="font-size:1.6rem"]');
            if (totalTextElement) {
                totalTextElement.innerText = globalTotal.toLocaleString('en-US');
            }

            // --- EXPAND ALL / COLLAPSE ALL LOGIC ---
            const prefix = isTransaksi ? 'pendapatan' : 'lainnya';
            const btnExpandAll = document.getElementById('btn-' + prefix + '-expand-all');
            const btnCollapseAll = document.getElementById('btn-' + prefix + '-collapse-all');
            
            if (btnExpandAll) {
                const newBtnE = btnExpandAll.cloneNode(true);
                btnExpandAll.parentNode.replaceChild(newBtnE, btnExpandAll);
                newBtnE.addEventListener('click', () => {
                    accItems.forEach(item => {
                        item.classList.add('active');
                        const content = item.querySelector('.acc-content');
                        if (content) content.style.display = 'block';
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
                        const content = item.querySelector('.acc-content');
                        if (content) content.style.display = 'none';
                        const arrow = item.querySelector('.acc-arrow');
                        if (arrow) arrow.style.transform = 'rotate(0deg)';
                    });
                });
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

    window.renderLaporanPengeluaran = function (filterVal = 'hari-ini') {
        const layout = document.getElementById('layout-pengeluaran');
        if (!layout) return;

        const emptyState = document.getElementById('pengeluaran-empty-state');
        const dataState = document.getElementById('pengeluaran-data-state');
        const filterSel = document.getElementById('pengeluaran-date-filter');
        
        let db = window.getMergedPengeluaran();
        let total = 0;
        let filtered = db.filter(item => {
            if (filterVal === 'per-tanggal' || filterVal === 'CUSTOM_DATE_RANGE') {
                const start = filterSel ? filterSel.getAttribute('data-start') : null;
                const end = filterSel ? filterSel.getAttribute('data-end') : null;
                if (!window.isDateInRange(parseDateString(item.date), filterVal, start, end)) return false;
            } else {
                if (!window.isDateInRange(parseDateString(item.date), filterVal)) return false;
            }
            
            // Check Cashbox filter
            const cashboxFilterEl = document.getElementById('pengeluaran-cashbox-filter');
            const cashboxVal = cashboxFilterEl ? cashboxFilterEl.value : 'Semua';
            if (cashboxVal !== 'Semua') {
                const metode = item.cashbox || item.payment_method || 'Tunai';
                if (metode.toUpperCase() !== cashboxVal.toUpperCase()) return false;
            }
            
            return true;
        });

        if (filtered.length === 0) {
            if(emptyState) emptyState.style.display = 'flex';
            if(dataState) dataState.style.display = 'none';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(dataState) dataState.style.display = 'flex';

        total = 0;
        const grouped = {};
        filtered.forEach(item => {
            const itemNominal = parseFloat(item.nominal) || 0;
            total += itemNominal;
            const d = parseDateString(item.date);
            const dStr = formatDateDisplay(d);
            if (!grouped[dStr]) grouped[dStr] = [];
            grouped[dStr].push({ ...item, itemNominal });
        });

        const spanTotal = layout.querySelector('span[style*="1.8rem"]');
        if (spanTotal) spanTotal.innerText = formatRupiah(total);
        
        const container = document.getElementById('pengeluaran-accordion-container');
        if (container) {
            let html = '';
            Object.keys(grouped).forEach((dateStr, index) => {
                let dailyTotal = 0;
                let rowHtml = '';
                grouped[dateStr].forEach(item => {
                    dailyTotal += item.itemNominal;
                    rowHtml += `
                        <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #f1f5f9;">
                            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                                <span style="font-weight:600; color:#1e293b;">${item.category || 'Manual'}</span>
                                <span style="font-size:0.8rem; color:#64748b;">- ${typeof formatTimeDisplay === 'function' ? formatTimeDisplay(parseDateString(item.date)) : (item.date ? item.date.substring(11,16) : '')} - ${item.keterangan || '-'}</span>
                            </div>
                            <div style="font-weight:700; color:#ef4444;">Rp ${formatRupiah(item.itemNominal)}</div>
                        </div>
                    `;
                });

                html += `
                    <div class="acc-item ${index === 0 ? 'active' : ''}" style="border-bottom:1px solid #f1f5f9; background:#fff; margin-bottom:10px; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden;">
                        <div class="acc-header" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc;">
                            <div style="font-weight:600; color:#0f172a; display:flex; align-items:center; gap:8px;">
                                <i class="fa-solid fa-chevron-down acc-arrow" style="font-size:0.75rem; transition:transform 0.3s;"></i> ${dateStr}
                            </div>
                            <div style="font-weight:700; color:#ef4444;">Rp ${formatRupiah(dailyTotal)}</div>
                        </div>
                        <div class="acc-content" style="padding:0; max-height:none; overflow:visible; ${index === 0 ? 'display:block;' : 'display:none;'}">
                            ${rowHtml}
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            const accItems = container.querySelectorAll('.acc-item');
            accItems.forEach(item => {
                const header = item.querySelector('.acc-header');
                if (header) {
                    header.addEventListener('click', () => {
                        item.classList.toggle('active');
                        const content = item.querySelector('.acc-content');
                        const arrow = item.querySelector('.acc-arrow');
                        const isActive = item.classList.contains('active');
                        if (content) content.style.display = isActive ? 'block' : 'none';
                        if (arrow) arrow.style.transform = isActive ? 'rotate(-180deg)' : 'rotate(0deg)';
                    });
                }
            });

            // --- EXPAND ALL / COLLAPSE ALL LOGIC ---
            const btnExpandAll = document.getElementById('btn-pengeluaran-expand-all');
            const btnCollapseAll = document.getElementById('btn-pengeluaran-collapse-all');
            
            if (btnExpandAll) {
                const newBtnE = btnExpandAll.cloneNode(true);
                btnExpandAll.parentNode.replaceChild(newBtnE, btnExpandAll);
                newBtnE.addEventListener('click', () => {
                    accItems.forEach(item => {
                        item.classList.add('active');
                        const content = item.querySelector('.acc-content');
                        if (content) content.style.display = 'block';
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
                        const content = item.querySelector('.acc-content');
                        if (content) content.style.display = 'none';
                        const arrow = item.querySelector('.acc-arrow');
                        if (arrow) arrow.style.transform = 'rotate(0deg)';
                    });
                });
            }
        }
    };

    // --- 6. LABA RUGI ---
    window.renderLaporanLabaRugi = function (filterVal = 'hari-ini') {
        const layout = document.getElementById('layout-laba-rugi');
        if (!layout) return;

        const emptyState = document.getElementById('laba-rugi-empty-state');
        const dataState = document.getElementById('laba-rugi-data-state');
        const filterSel = document.getElementById('laba-rugi-date-filter');
        
        let dbPem = window.getMergedPemasukan();
        let dbPeng = window.getMergedPengeluaran();

        let totalPemasukan = 0;
        let totalPengeluaran = 0;

        let pemFilter = dbPem.filter(item => {
            if (item.status === 'batal') return false;
            if (filterVal === 'per-tanggal' || filterVal === 'CUSTOM_DATE_RANGE') {
                const start = filterSel ? filterSel.getAttribute('data-start') : null;
                const end = filterSel ? filterSel.getAttribute('data-end') : null;
                return window.isDateInRange(parseDateString(item.date), filterVal, start, end);
            }
            return window.isDateInRange(parseDateString(item.date), filterVal);
        });
        let pengFilter = dbPeng.filter(item => {
            if (filterVal === 'per-tanggal' || filterVal === 'CUSTOM_DATE_RANGE') {
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
        if (lPendapatan) lPendapatan.innerText = window.formatRupiah(totalPemasukan);
        if (lPengeluaran) lPengeluaran.innerText = window.formatRupiah(totalPengeluaran);

        // Find Laba Bersih ID, currently missing ID in index, but we can do a selector
        // The Laba Bersih is the last massive span with 1.8rem
        const spans = layout.querySelectorAll('span[style*="1.8rem"]');
        if (spans.length > 0) {
            const laba = totalPemasukan - totalPengeluaran;
            spans[spans.length - 1].innerText = window.formatRupiah(Math.abs(laba));
        }
    };

    window.omzetChartInstance = null;
    window.renderLaporanOmzet = function(filterVal = 'hari-ini') {
        const layout = document.getElementById('layout-omzet');
        if (!layout) return;

        const dbPem = window.getMergedPemasukan();
        const emptyState = document.getElementById('omzet-empty-state');
        const dataState = document.getElementById('omzet-data-state');
        
        let startStr = null, endStr = null;
        const filterSel = document.getElementById('omzet-date-filter');
        if ((filterVal === 'per-tanggal' || filterVal === 'CUSTOM_DATE_RANGE') && filterSel) {
            startStr = filterSel.getAttribute('data-start');
            endStr = filterSel.getAttribute('data-end');
        }

        const filtered = dbPem.filter(item => {
            if (item.type) return false;
            return window.isDateInRange(window.parseDateString(item.date), filterVal, startStr, endStr);
        });

        if (filtered.length === 0) {
            if(emptyState) emptyState.style.display = 'flex';
            if(dataState) dataState.style.display = 'none';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(dataState) dataState.style.display = 'flex';

        let totalOmzet = 0;
        filtered.forEach(x => totalOmzet += (parseFloat(x.dibayar) || 0));

        const spans = layout.querySelectorAll('span[style*="1.8rem"]');
        if (spans.length > 0) {
            spans[0].innerText = window.formatRupiah(totalOmzet);
        }

        const chartData = { labels: [], data: [] };
        const grouped = {};
        filtered.forEach(item => {
            const d = window.parseDateString(item.date);
            const dStr = window.formatDateDisplay(d);
            if (!grouped[dStr]) grouped[dStr] = { nominal: 0, count: 0 };
            grouped[dStr].nominal += (parseFloat(item.dibayar) || 0);
            grouped[dStr].count += 1;
        });

        const tbody = document.getElementById('omzet-tbody');
        if (tbody) {
            let html = '';
            Object.keys(grouped).sort((a,b) => window.parseDateString(b) - window.parseDateString(a)).forEach(dStr => {
                const g = grouped[dStr];
                html += `
                <tr>
                    <td style="padding-bottom:15px; border-bottom:1px solid #f1f5f9; padding-top:10px;">${dStr}</td>
                    <td style="padding-bottom:15px; border-bottom:1px solid #f1f5f9; padding-top:10px; text-align:center;">${g.count}</td>
                    <td style="padding-bottom:15px; border-bottom:1px solid #f1f5f9; padding-top:10px; text-align:right;">${window.formatRupiah(g.nominal)}</td>
                </tr>`;
                chartData.labels.unshift(dStr);
                chartData.data.unshift(g.nominal);
            });
            tbody.innerHTML = html;
        }

        const ctx = document.getElementById('omzetChart');
        if (ctx) {
            if (window.omzetChartInstance) {
                window.omzetChartInstance.destroy();
            }
            if (window.Chart) {
                window.omzetChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: chartData.labels,
                        datasets: [{
                            label: 'Omzet',
                            data: chartData.data,
                            borderColor: '#0ea5e9',
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
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
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        }
    };

    window.renderLaporanArusKeuangan = function(filterVal = 'hari-ini') {
        const layout = document.getElementById('layout-arus-keuangan');
        if (!layout) return;

        const dbPem = window.getMergedPemasukan();
        const dbPeng = window.getMergedPengeluaran();
        const emptyState = document.getElementById('arus-empty-state');
        const dataState = document.getElementById('arus-data-state');
        
        let startStr = null, endStr = null;
        const filterSel = document.getElementById('arus-date-filter');
        if ((filterVal === 'per-tanggal' || filterVal === 'CUSTOM_DATE_RANGE') && filterSel) {
            startStr = filterSel.getAttribute('data-start');
            endStr = filterSel.getAttribute('data-end');
        }

        const cashboxSel = document.getElementById('arus-cashbox-filter');
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
        });

        if (filteredPem.length === 0 && filteredPeng.length === 0) {
            if(emptyState) emptyState.style.display = 'flex';
            if(dataState) dataState.style.display = 'none';
            return;
        }

        if(emptyState) emptyState.style.display = 'none';
        if(dataState) dataState.style.display = 'flex';

        let totalMasuk = 0;
        let totalKeluar = 0;
        const combined = [];

        filteredPem.forEach(x => {
            const nom = parseFloat(x.type ? x.nominal : x.dibayar) || 0;
            if (nom > 0) {
                totalMasuk += nom;
                combined.push({
                    date: window.parseDateString(x.date),
                    ket: x.type ? (x.category || 'Pendapatan Lain') : 'Pendapatan Transaksi',
                    debit: nom,
                    kredit: 0
                });
            }
        });

        filteredPeng.forEach(x => {
            const nom = parseFloat(x.nominal) || 0;
            if (nom > 0) {
                totalKeluar += nom;
                combined.push({
                    date: window.parseDateString(x.date),
                    ket: (x.category || 'Pengeluaran') + (x.keterangan ? '<br><span style="color:#94a3b8;">'+x.keterangan+'</span>' : ''),
                    debit: 0,
                    kredit: nom
                });
            }
        });

        const masukSpan = layout.querySelector('div[style*="eab308"]')?.parentElement?.nextElementSibling?.querySelector('span');
        const keluarSpan = layout.querySelector('div[style*="0ea5e9"]')?.parentElement?.nextElementSibling?.querySelector('span');
        if (masukSpan) masukSpan.innerText = window.formatRupiah(totalMasuk);
        if (keluarSpan) keluarSpan.innerText = window.formatRupiah(totalKeluar);

        combined.sort((a,b) => b.date - a.date);
        const tbody = document.getElementById('arus-tbody');
        if (tbody) {
            let html = '';
            combined.forEach(item => {
                html += `
                <tr>
                    <td style="padding-bottom:15px; border-bottom:1px solid #f1f5f9; padding-top:10px; vertical-align:top;">${window.formatDateDisplay(item.date)}</td>
                    <td style="padding-bottom:15px; border-bottom:1px solid #f1f5f9; padding-top:10px; vertical-align:top;">${item.ket}</td>
                    <td style="padding-bottom:15px; border-bottom:1px solid #f1f5f9; padding-top:10px; text-align:right; vertical-align:top; color:#eab308;">${item.debit > 0 ? window.formatRupiah(item.debit) : '0'}</td>
                    <td style="padding-bottom:15px; border-bottom:1px solid #f1f5f9; padding-top:10px; text-align:right; vertical-align:top; color:#0ea5e9;">${item.kredit > 0 ? window.formatRupiah(item.kredit) : '0'}</td>
                </tr>`;
            });
            tbody.innerHTML = html;
        }
        
        const elTotalKas = document.getElementById('arus-total-kas-text');
        if (elTotalKas) {
            elTotalKas.innerText = (totalMasuk - totalKeluar).toLocaleString('id-ID');
        }
        
        window.currentArusData = combined;
    };

    // --- BIND EVENT LISTENERS ---
    setTimeout(() => {
        // Global hook for custom date picker apply
        const btnModalOkeGlobal = document.getElementById('btn-modal-oke');
        if (btnModalOkeGlobal) {
            btnModalOkeGlobal.addEventListener('click', () => {
            if (window.activeCustomDatePickerFilter) {
                setTimeout(() => {
                    const filterSel = window.activeCustomDatePickerFilter;
                    const txtEl = window.activeCustomDatePickerText;
                    
                    if (window.calStartDay !== undefined && window.calStartDay !== null) {
                        const pad = (n) => String(n).padStart(2, '0');
                        let startStr = `${pad(window.calStartDay)}/${pad(window.calStartMonth + 1)}/${window.calStartYear}`;
                        let endStr = startStr;
                        if (window.calEndDay !== undefined && window.calEndDay !== null) {
                            endStr = `${pad(window.calEndDay)}/${pad(window.calEndMonth + 1)}/${window.calEndYear}`;
                        }
                        const finalTxt = startStr === endStr ? startStr : `${startStr} - ${endStr}`;
                        if (txtEl) txtEl.innerText = finalTxt;
                        
                        filterSel.setAttribute('data-start', startStr);
                        filterSel.setAttribute('data-end', endStr);
                    }

                    if (typeof window.activeCustomDatePickerRender === 'function') {
                        window.activeCustomDatePickerRender('per-tanggal');
                    }
                }, 50);
            }
        });
        }

        hookFilterEvents('omzet', window.renderLaporanOmzet);
        hookFilterEvents('arus', window.renderLaporanArusKeuangan);
        hookFilterEvents('pendapatan', (val) => window.renderLaporanPendapatan(val, 'transaksi'));
        hookFilterEvents('lainnya', (val) => window.renderLaporanPendapatan(val, 'lainnya'));
        hookFilterEvents('pengeluaran', window.renderLaporanPengeluaran);
        hookFilterEvents('laba-rugi', window.renderLaporanLabaRugi);
        hookFilterEvents('lap-transaksi', (val) => { window.renderLaporanTransaksiAccordion(val); });
        
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





