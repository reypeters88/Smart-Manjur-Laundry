document.addEventListener('DOMContentLoaded', () => {
    
    // --- TAB NAVIGATION ---
    const topTabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const statsSlider = document.getElementById('transaksi-stats');
    const keuanganStats = document.getElementById('keuangan-stats');

    topTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all tabs
            topTabBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked tab
            btn.classList.add('active');

            const targetTab = btn.getAttribute('data-tab');
            
            // Hide all contents inside content-area
            tabContents.forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });

            // Special case for top tabs
            if(targetTab === 'transaksi' || targetTab === 'keuangan' || targetTab === 'kepegawaian') {
                const targetEl = document.getElementById(`tab-${targetTab}`);
                if(targetEl) {
                    targetEl.style.display = 'block';
                    // small delay for animation
                    setTimeout(() => targetEl.classList.add('active'), 10);
                }
                
                // Show/hide stats depending on tab
                if(targetTab === 'transaksi') {
                    if(statsSlider) statsSlider.style.display = 'flex';
                    if(keuanganStats) keuanganStats.style.display = 'none';
                } else if(targetTab === 'keuangan') {
                    if(statsSlider) statsSlider.style.display = 'none';
                    if(keuanganStats) keuanganStats.style.display = 'flex';
                } else {
                    if(statsSlider) statsSlider.style.display = 'none';
                    if(keuanganStats) keuanganStats.style.display = 'none';
                }

                // Toggle Header Actions (Excel vs PDF)
                const btnQr = document.getElementById('btn-export-excel');
                const btnExportPdf = document.getElementById('btn-export-pdf');
                if (targetTab === 'keuangan') {
                    if (btnQr) btnQr.style.display = 'none';
                    if (btnExportPdf) btnExportPdf.style.display = 'block';
                } else {
                    if (btnQr) btnQr.style.display = 'block';
                    if (btnExportPdf) btnExportPdf.style.display = 'none';
                }

                // Reset bottom nav if navigating from top tabs to Transaksi
                if(targetTab === 'transaksi') {
                    resetBottomNav('transaksi');
                } else {
                    resetBottomNav(null); // Clear bottom nav highlight if looking at keuangan/kepegawaian
                }

                // Update data and chart every time Keuangan is clicked
                if (targetTab === 'keuangan') {
                    let currentFilter = '7-hari';
                    const activeFilterOpt = document.querySelector('#date-filter-options .filter-opt.active');
                    if (activeFilterOpt) {
                        currentFilter = activeFilterOpt.getAttribute('data-val') || '7-hari';
                    }
                    if (typeof window.initFinanceChart === 'function') window.initFinanceChart(currentFilter);
                }
            }
        });
    });

    // --- BOTTOM NAVIGATION ---
    const bottomNavBtns = document.querySelectorAll('.b-nav-btn');
    
    bottomNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetNav = btn.getAttribute('data-bnav');
            
            // Highlight bottom nav
            bottomNavBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Jika mengklik menu selain transaksi, sembunyikan top nav & stats
            if(targetNav !== 'transaksi') {
                topTabBtns.forEach(b => b.classList.remove('active'));
                if(statsSlider) statsSlider.style.display = 'none';
                document.querySelector('.app-header').style.display = 'none';
                const topNavCard = document.querySelector('.top-nav-card');
                if(topNavCard) topNavCard.style.display = 'none';
            } else {
                document.querySelector('.tab-btn[data-tab="transaksi"]').classList.add('active');
                if(statsSlider) statsSlider.style.display = 'flex';
                document.querySelector('.app-header').style.display = 'flex';
                const topNavCard = document.querySelector('.top-nav-card');
                if(topNavCard) topNavCard.style.display = 'block';
            }

            // Hide all contents
            tabContents.forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });

            // Show target content
            const targetEl = document.getElementById('tab-' + targetNav);
            if(targetEl) {
                targetEl.style.display = 'block';
                setTimeout(() => targetEl.classList.add('active'), 10);
            }
        });
    });

    function resetBottomNav(activeTarget) {
        bottomNavBtns.forEach(b => b.classList.remove('active'));
        if(activeTarget) {
            const activeBtn = document.querySelector('.b-nav-btn[data-bnav="' + activeTarget + '"]');
            if(activeBtn) activeBtn.classList.add('active');
        }
    }


    // --- KASIR POS NAVIGATION (+) ---
    const layoutMain = document.getElementById('layout-main');
    const layoutPos = document.getElementById('layout-pos');
    const btnAddTrx = document.getElementById('btn-add-transaction');
    const btnBackPos = document.getElementById('btn-back-pos');

    btnAddTrx.addEventListener('click', () => {
        layoutMain.classList.remove('active');
        layoutMain.style.display = 'none';
        layoutPos.style.display = 'flex';
        setTimeout(() => layoutPos.classList.add('active'), 10);
    });

    btnBackPos.addEventListener('click', () => {
        layoutPos.classList.remove('active');
        layoutPos.style.display = 'none';
        layoutMain.style.display = 'flex';
        setTimeout(() => layoutMain.classList.add('active'), 10);
    });

    // --- MODAL PILIH BULAN (KEUANGAN) ---
    const btnPilihPeriode = document.getElementById('btn-pilih-periode');
    const textPeriode = document.getElementById('text-periode');
    const modalPilihBulan = document.getElementById('modal-pilih-bulan');
    const monthListContainer = document.getElementById('month-list-container');

    if (btnPilihPeriode && modalPilihBulan && monthListContainer) {
        
        // Data statis sesuai gambar untuk contoh, bisa diganti dinamis
        const listItems = [
            'Hari Ini', 'Juli 2026', 'Juni 2026', 'Mei 2026', 'April 2026', 
            'Maret 2026', 'Februari 2026', 'Januari 2026', 
            'Desember 2025', 'November 2025'
        ];

        listItems.forEach(itemText => {
            const div = document.createElement('div');
            div.className = 'month-list-item';
            div.innerText = itemText;
            div.addEventListener('click', () => {
                textPeriode.innerText = itemText;
                modalPilihBulan.style.display = 'none';
            });
            monthListContainer.appendChild(div);
        });

        // Buka modal
        btnPilihPeriode.addEventListener('click', () => {
            modalPilihBulan.style.display = 'flex';
        });

        // Tutup modal jika klik di luar area konten
        modalPilihBulan.addEventListener('click', (e) => {
            if (e.target === modalPilihBulan) {
                modalPilihBulan.style.display = 'none';
            }
        });
    }



    // --- PESANAN STATUS FILTER (OLD) ---
    const statusBtns = document.querySelectorAll('.status-btn');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            statusBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // --- PESANAN TABS (NEW) ---
    const pTabBtns = document.querySelectorAll('.p-tab-btn');
    pTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            pTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // DASHBOARD DETAIL MENU NAVIGATION removed (now handled in index.html)

    // --- PWA SERVICE WORKER REGISTRATION ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
});
