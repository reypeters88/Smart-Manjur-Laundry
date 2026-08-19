$c = Get-Content 'index.html' -Raw

$old_modal = @"
            // --- MODAL PILIH BULAN (KEUANGAN) ---
            const modalPilihBulan = document.getElementById('modal-pilih-bulan');
            const monthListContainer = document.getElementById('month-list-container');

            if (modalPilihBulan && monthListContainer) {
                const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
                let currentYear = new Date().getFullYear();
                
                monthListContainer.innerHTML = 
                    <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 20px; border-bottom: 1px solid #f1f5f9;">
                        <button id="btn-prev-year" style="border:none; background:transparent; font-size:1.2rem; cursor:pointer; color:#64748b;"><i class="fa-solid fa-chevron-left"></i></button>
                        <h4 id="display-year" style="margin:0; font-size:1.1rem; color:#1e293b;">\</h4>
                        <button id="btn-next-year" style="border:none; background:transparent; font-size:1.2rem; cursor:pointer; color:#64748b;"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                    <div class="month-grid" id="month-grid-container" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; padding:15px;"></div>
                ;

                const displayYear = document.getElementById('display-year');
                const gridContainer = document.getElementById('month-grid-container');

                function renderMonths() {
                    gridContainer.innerHTML = '';
                    months.forEach((m, idx) => {
                        const div = document.createElement('div');
                        div.style.cssText = 'background:#f1f5f9; color:#475569; padding:12px 5px; border-radius:12px; text-align:center; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s ease; border:2px solid transparent;';
                        
                        div.onmouseover = () => { if(div.dataset.sel !== '1') { div.style.background='#e0f2fe'; div.style.color='#0284c7'; } };
                        div.onmouseout = () => { if(div.dataset.sel !== '1') { div.style.background='#f1f5f9'; div.style.color='#475569'; } };

                        if (idx === new Date().getMonth() && currentYear === new Date().getFullYear()) {
                            div.dataset.sel = '1';
                            div.style.background = '#0284c7';
                            div.style.color = '#fff';
                            div.style.boxShadow = '0 4px 10px rgba(2,132,199,0.3)';
                        }
                        
                        div.textContent = m;
                        div.addEventListener('click', () => {
                            gridContainer.querySelectorAll('div').forEach(i => {
                                i.dataset.sel = '0';
                                i.style.background = '#f1f5f9';
                                i.style.color = '#475569';
                                i.style.boxShadow = 'none';
                            });
                            div.dataset.sel = '1';
                            div.style.background = '#0284c7';
                            div.style.color = '#fff';
                            div.style.boxShadow = '0 4px 10px rgba(2,132,199,0.3)';
                            
                            const val = \ ulan-\-\\;
                            const ringkasanDateText = document.getElementById('ringkasan-date-text');
                            if (ringkasanDateText) {
                                ringkasanDateText.innerText = \Bulan \ \\;
                                ringkasanDateText.style.display = 'block';
                            }
                            if (typeof initFinanceChart === 'function') initFinanceChart(val);
                            
                            setTimeout(() => {
                                modalPilihBulan.style.display = 'none';
                            }, 300);
                        });
                        gridContainer.appendChild(div);
                    });
                }

                document.getElementById('btn-prev-year').addEventListener('click', () => { currentYear--; displayYear.innerText = currentYear; renderMonths(); });
                document.getElementById('btn-next-year').addEventListener('click', () => { currentYear++; displayYear.innerText = currentYear; renderMonths(); });

                renderMonths();

                modalPilihBulan.addEventListener('click', (e) => {
                    if (e.target === modalPilihBulan) {
                        modalPilihBulan.style.display = 'none';
                        const ringkasanFilter = document.getElementById('ringkasan-date-filter');
                        if (ringkasanFilter) ringkasanFilter.value = '7-hari'; 
                    }
                });
            }
"@

$new_modal = @'
            // --- MODAL PILIH BULAN (KEUANGAN) ---
            const modalPilihBulan = document.getElementById('modal-pilih-bulan');
            const monthListContainer = document.getElementById('month-list-container');

            if (modalPilihBulan && monthListContainer) {
                const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
                let currentYear = new Date().getFullYear();
                
                monthListContainer.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 20px; border-bottom: 1px solid #f1f5f9;">
                        <button id="btn-prev-year" style="border:none; background:transparent; font-size:1.2rem; cursor:pointer; color:#64748b;"><i class="fa-solid fa-chevron-left"></i></button>
                        <h4 id="display-year" style="margin:0; font-size:1.1rem; color:#1e293b;">${currentYear}</h4>
                        <button id="btn-next-year" style="border:none; background:transparent; font-size:1.2rem; cursor:pointer; color:#64748b;"><i class="fa-solid fa-chevron-right"></i></button>
                    </div>
                    <div class="month-grid" id="month-grid-container" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; padding:15px;"></div>
                `;

                const displayYear = document.getElementById('display-year');
                const gridContainer = document.getElementById('month-grid-container');

                function renderMonths() {
                    gridContainer.innerHTML = '';
                    months.forEach((m, idx) => {
                        const div = document.createElement('div');
                        div.style.cssText = 'background:#f1f5f9; color:#475569; padding:12px 5px; border-radius:12px; text-align:center; font-size:0.85rem; font-weight:600; cursor:pointer; transition:all 0.2s ease; border:2px solid transparent;';
                        
                        div.onmouseover = () => { if(div.dataset.sel !== '1') { div.style.background='#e0f2fe'; div.style.color='#0284c7'; } };
                        div.onmouseout = () => { if(div.dataset.sel !== '1') { div.style.background='#f1f5f9'; div.style.color='#475569'; } };

                        if (idx === new Date().getMonth() && currentYear === new Date().getFullYear()) {
                            div.dataset.sel = '1';
                            div.style.background = '#0284c7';
                            div.style.color = '#fff';
                            div.style.boxShadow = '0 4px 10px rgba(2,132,199,0.3)';
                        }
                        
                        div.textContent = m;
                        div.addEventListener('click', () => {
                            gridContainer.querySelectorAll('div').forEach(i => {
                                i.dataset.sel = '0';
                                i.style.background = '#f1f5f9';
                                i.style.color = '#475569';
                                i.style.boxShadow = 'none';
                            });
                            div.dataset.sel = '1';
                            div.style.background = '#0284c7';
                            div.style.color = '#fff';
                            div.style.boxShadow = '0 4px 10px rgba(2,132,199,0.3)';
                            
                            const val = `bulan-${currentYear}-${(idx+1).toString().padStart(2, '0')}`;
                            const ringkasanDateText = document.getElementById('ringkasan-date-text');
                            if (ringkasanDateText) {
                                ringkasanDateText.innerText = `Bulan ${m} ${currentYear}`;
                                ringkasanDateText.style.display = 'block';
                            }
                            if (typeof initFinanceChart === 'function') initFinanceChart(val);
                            
                            setTimeout(() => {
                                modalPilihBulan.style.display = 'none';
                            }, 300);
                        });
                        gridContainer.appendChild(div);
                    });
                }

                document.getElementById('btn-prev-year').addEventListener('click', () => { currentYear--; displayYear.innerText = currentYear; renderMonths(); });
                document.getElementById('btn-next-year').addEventListener('click', () => { currentYear++; displayYear.innerText = currentYear; renderMonths(); });

                renderMonths();

                modalPilihBulan.addEventListener('click', (e) => {
                    if (e.target === modalPilihBulan) {
                        modalPilihBulan.style.display = 'none';
                        const ringkasanFilter = document.getElementById('ringkasan-date-filter');
                        if (ringkasanFilter) ringkasanFilter.value = '7-hari'; 
                    }
                });
            }
'@

$c = $c.Replace($old_modal, $new_modal)
$c = $c.Replace($old_modal.Replace("`n", "`r`n"), $new_modal)

[IO.File]::WriteAllText('index.html', $c, [System.Text.Encoding]::UTF8)
