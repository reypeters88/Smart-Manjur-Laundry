const fs = require('fs');
const content = fs.readFileSync('g:/My Drive/Apiksi/Projek 2/index.html', 'utf8');

const startStr = 'window.bukaDetailRingkasan = function(tipe) {';
const endStr = '// Show Layout';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr, startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    const newLogic = window.bukaDetailRingkasan = function(tipe) {
                const layoutMain = document.getElementById('layout-main');
                const layoutDetail = document.getElementById('layout-detail-ringkasan');
                const title = document.getElementById('detail-ringkasan-title');
                const list = document.getElementById('detail-ringkasan-list');
                const empty = document.getElementById('detail-ringkasan-empty');
                
                if (!layoutMain || !layoutDetail) return;
                
                const titles = {
                    'omzet': 'Detail Total Omzet',
                    'pendapatan': 'Detail Pendapatan Transaksi',
                    'pengeluaran': 'Detail Pengeluaran',
                    'labarugi': 'Detail Laba Rugi',
                    'piutang': 'Detail Piutang'
                };
                if (title) title.innerText = titles[tipe] || 'Detail Data';
                
                const pemasukan = JSON.parse(localStorage.getItem('db_pemasukan')) || [];
                const pengeluaran = JSON.parse(localStorage.getItem('db_pengeluaran')) || [];
                let displayData = [];
                
                if (tipe === 'omzet') {
                    pemasukan.forEach(trx => {
                        if (trx.status !== 'batal' && trx.status !== 'Batal' && !trx.type) {
                            displayData.push({ date: trx.date, desc: trx.customerName || 'Pelanggan', nominal: trx.total || 0, isOut: false, id: trx.id });
                        }
                    });
                } else if (tipe === 'pendapatan') {
                    pemasukan.forEach(trx => {
                        if (trx.status !== 'batal' && trx.status !== 'Batal' && !trx.type) {
                            let dibayar = trx.dibayar !== undefined && trx.dibayar !== null && trx.dibayar !== '' ? parseFloat(trx.dibayar) : 0;
                            if (!isNaN(dibayar) && dibayar > 0) {
                                displayData.push({ date: trx.date, desc: trx.customerName || 'Pelanggan', nominal: dibayar, isOut: false, id: trx.id });
                            }
                        }
                    });
                } else if (tipe === 'piutang') {
                    pemasukan.forEach(trx => {
                        if (trx.status !== 'batal' && trx.status !== 'Batal' && !trx.type) {
                            let total = parseFloat(trx.total || 0);
                            let dibayar = trx.dibayar !== undefined && trx.dibayar !== null && trx.dibayar !== '' ? parseFloat(trx.dibayar) : 0;
                            if (isNaN(dibayar)) dibayar = 0;
                            let piutang = total - dibayar;
                            if (piutang > 0) {
                                displayData.push({ date: trx.date, desc: trx.customerName || 'Pelanggan', nominal: piutang, isOut: false, id: trx.id });
                            }
                        }
                    });
                } else if (tipe === 'pengeluaran') {
                    pengeluaran.forEach(trx => {
                        displayData.push({ date: trx.date, desc: trx.category || trx.keterangan || 'Pengeluaran', nominal: trx.amount || trx.nominal || 0, isOut: true, id: trx.id });
                    });
                } else if (tipe === 'labarugi') {
                    pemasukan.forEach(trx => {
                        if (trx.status !== 'batal' && trx.status !== 'Batal' && !trx.type) {
                            let dibayar = trx.dibayar !== undefined && trx.dibayar !== null && trx.dibayar !== '' ? parseFloat(trx.dibayar) : 0;
                            if (!isNaN(dibayar) && dibayar > 0) {
                                displayData.push({ date: trx.date, desc: trx.customerName || 'Pendapatan', nominal: dibayar, isOut: false, id: trx.id });
                            }
                        }
                    });
                    pengeluaran.forEach(trx => {
                        displayData.push({ date: trx.date, desc: trx.category || trx.keterangan || 'Pengeluaran', nominal: trx.amount || trx.nominal || 0, isOut: true, id: trx.id });
                    });
                }
                
                // Sort by date descending
                displayData.sort((a, b) => {
                    let dA = window.parseDateString ? window.parseDateString(a.date, a.id) : new Date(a.date);
                    let dB = window.parseDateString ? window.parseDateString(b.date, b.id) : new Date(b.date);
                    return dB - dA;
                });
                
                list.innerHTML = '';
                if (displayData.length === 0) {
                    list.style.display = 'none';
                    if (empty) empty.style.display = 'block';
                } else {
                    if (empty) empty.style.display = 'none';
                    list.style.display = 'block';
                    
                    // GROUP DATA BY DATE
                    let grouped = {};
                    displayData.forEach(item => {
                        let d = window.parseDateString ? window.parseDateString(item.date, item.id) : new Date(item.date);
                        let valid = d && !isNaN(d);
                        let dateStr = valid ? d.toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric'}) : (item.date ? item.date.substring(0, 10) : '-');
                        if (!grouped[dateStr]) grouped[dateStr] = { items: [], total: 0 };
                        grouped[dateStr].items.push(item);
                        grouped[dateStr].total += parseFloat(item.nominal || 0);
                    });

                    let html = '\\n                        <div style="display:flex; gap:10px; margin-bottom:15px; justify-content: flex-end;">\\n                            <button id="btn-detail-expand-all" style="background:#e0f2fe; border:none; padding:6px 12px; border-radius:6px; font-size:0.75rem; color:#0369a1; cursor:pointer; font-weight:600; transition:all 0.2s;"><i class="fa-solid fa-angle-down"></i> Buka Semua</button>\\n                            <button id="btn-detail-collapse-all" style="background:#f1f5f9; border:none; padding:6px 12px; border-radius:6px; font-size:0.75rem; color:#475569; cursor:pointer; font-weight:600; transition:all 0.2s;"><i class="fa-solid fa-angle-up"></i> Tutup Semua</button>\\n                        </div>\\n                        <div id="detail-accordion-container" style="display:flex; flex-direction:column; gap:10px;">\\n                    ';

                    Object.keys(grouped).forEach(dateStr => {
                        let group = grouped[dateStr];
                        html += '\\n                            <div class="accordion-item" style="background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">\\n                                <div class="accordion-header" style="padding:15px 20px; display:flex; justify-content:space-between; align-items:center; cursor:pointer; background:#f8fafc; border-bottom:1px solid #e2e8f0;" onclick="this.parentElement.classList.toggle(\\\'active\\\')">\\n                                    <div style="display:flex; align-items:center; gap:10px;">\\n                                        <div style="background:#e0f2fe; color:#0ea5e9; width:32px; height:32px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1rem;">\\n                                            <i class="fa-solid fa-calendar-day"></i>\\n                                        </div>\\n                                        <div>\\n                                            <div style="font-size:0.95rem; font-weight:700; color:#0f172a;">' + dateStr + '</div>\\n                                            <div style="font-size:0.75rem; color:#64748b;">' + group.items.length + ' Transaksi</div>\\n                                        </div>\\n                                    </div>\\n                                    <div style="display:flex; align-items:center; gap:15px;">\\n                                        <div style="font-weight:700; color:' + (tipe === 'pengeluaran' ? '#ef4444' : '#10b981') + ';">Rp ' + group.total.toLocaleString('id-ID') + '</div>\\n                                        <i class="fa-solid fa-chevron-down text-slate-400 transition-transform duration-300 acc-arrow"></i>\\n                                    </div>\\n                                </div>\\n                                <div class="accordion-content" style="padding: 0; background:#ffffff;">\\n                                    <div style="overflow-x:auto;">\\n                                        <table style="width:100%; border-collapse:collapse; min-width:500px;">\\n                                            <thead>\\n                                                <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">\\n                                                    <th style="padding:12px 15px; text-align:left; font-size:0.8rem; color:#475569; font-weight:600;">No. Nota</th>\\n                                                    <th style="padding:12px 15px; text-align:left; font-size:0.8rem; color:#475569; font-weight:600;">Nama</th>\\n                                                    <th style="padding:12px 15px; text-align:right; font-size:0.8rem; color:#475569; font-weight:600;">Nominal (Rp)</th>\\n                                                </tr>\\n                                            </thead>\\n                                            <tbody>\\n                        ';

                        group.items.forEach(item => {
                            let textColor = item.isOut ? '#ef4444' : '#10b981';
                            let nominalText = parseFloat(item.nominal).toLocaleString('id-ID');
                            html += '\\n                                <tr style="border-bottom:1px solid #f1f5f9; transition:background 0.2s;" onmouseover="this.style.background=\\\'#f8fafc\\\'" onmouseout="this.style.background=\\\'transparent\\\'">\\n                                    <td style="padding:12px 15px; font-size:0.85rem; color:#64748b;">' + (item.id || '-') + '</td>\\n                                    <td style="padding:12px 15px; font-size:0.85rem; color:#64748b;">' + (item.desc || '-') + '</td>\\n                                    <td style="padding:12px 15px; font-size:0.95rem; font-weight:700; color:' + textColor + '; text-align:right;">' + nominalText + '</td>\\n                                </tr>\\n                            ';
                        });

                        html += '\\n                                            </tbody>\\n                                        </table>\\n                                    </div>\\n                                </div>\\n                            </div>\\n                        ';
                    });

                    html += '\\n                        </div>';
                    list.innerHTML = html;

                    // Dynamic Style for this accordion
                    if (!document.getElementById('detail-accordion-style')) {
                        const style = document.createElement('style');
                        style.id = 'detail-accordion-style';
                        style.innerHTML = '\\n                            #detail-accordion-container .accordion-item .accordion-content { display: none !important; }\\n                            #detail-accordion-container .accordion-item.active .accordion-content { display: block !important; }\\n                            #detail-accordion-container .accordion-item .acc-arrow { transform: rotate(0deg); }\\n                            #detail-accordion-container .accordion-item.active .acc-arrow { transform: rotate(-180deg); }\\n                        ';
                        document.head.appendChild(style);
                    }

                    // Attach Expand/Collapse All
                    const btnExpandAll = document.getElementById('btn-detail-expand-all');
                    const btnCollapseAll = document.getElementById('btn-detail-collapse-all');
                    const accItems = list.querySelectorAll('.accordion-item');

                    if (btnExpandAll) {
                        btnExpandAll.addEventListener('click', () => {
                            accItems.forEach(item => item.classList.add('active'));
                        });
                    }
                    if (btnCollapseAll) {
                        btnCollapseAll.addEventListener('click', () => {
                            accItems.forEach(item => item.classList.remove('active'));
                        });
                    }
                }
            };
;
    const newContent = content.substring(0, startIdx) + newLogic + content.substring(endIdx);
    fs.writeFileSync('g:/My Drive/Apiksi/Projek 2/index.html', newContent, 'utf8');
    console.log("Fixed syntax error in index.html");
} else {
    console.log("Could not find the function block!");
}