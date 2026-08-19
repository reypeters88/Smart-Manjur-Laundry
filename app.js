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

                // Toggle Header Actions (QR vs PDF)
                const btnQr = document.getElementById('btn-qr');
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

                // Init chart if Keuangan is clicked and chart not rendered yet
                if(targetTab === 'keuangan' && !financeChartInstance) {
                    initFinanceChart();
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


    // --- CHART.JS UNTUK KEUANGAN ---
    let financeChartInstance = null;

    function initFinanceChart() {
        const ctx = document.getElementById('financeChart').getContext('2d');
        
        // Dummy data for line chart
        const data = {
            labels: ['06-07', '09-10', '12-13', '15-16', '18-19', 'Jam'],
            datasets: [
                {
                    label: 'Omzet',
                    data: [15000, 12000, 0, 0, 0, 0],
                    borderColor: '#38bdf8', // light blue
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    borderWidth: 2,
                    tension: 0, 
                    fill: true
                },
                {
                    label: 'Pendapatan',
                    data: [0, 32000, 0, 0, 0, 0],
                    borderColor: '#34d399', // emerald light
                    backgroundColor: 'rgba(52, 211, 153, 0.2)',
                    borderWidth: 2,
                    tension: 0,
                    fill: true
                },
                {
                    label: 'Pengeluaran',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: '#ef4444', 
                    backgroundColor: '#ef4444',
                    borderWidth: 2,
                    tension: 0,
                    fill: false
                },
                {
                    label: 'Self Service',
                    data: [0, 0, 0, 0, 0, 0],
                    borderColor: '#0284c7', 
                    backgroundColor: '#0284c7',
                    borderWidth: 2,
                    tension: 0,
                    fill: false
                }
            ]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            boxWidth: 8,
                            font: {
                                family: "'Poppins', sans-serif",
                                size: 10
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value === 0) return '';
                                return (value / 1000) + 'rb';
                            },
                            font: { size: 10 }
                        },
                        grid: { drawBorder: false }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 } }
                    }
                },
                elements: {
                    point: {
                        radius: 0 // Hide points on lines unless hovered
                    }
                }
            }
        };

        financeChartInstance = new Chart(ctx, config);
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

    // --- DASHBOARD DETAIL MENU NAVIGATION ---
    const clickableMenus = document.querySelectorAll('.clickable-menu');
    const layoutDetail = document.getElementById('layout-detail');
    const btnBackDetail = document.getElementById('btn-back-detail');
    const detailTitle = document.getElementById('detail-title');
    const detailSubtitle = document.getElementById('detail-subtitle');

    if (layoutDetail && btnBackDetail) {
        clickableMenus.forEach(menu => {
            menu.addEventListener('click', () => {
                const title = menu.getAttribute('data-title');
                if (title) {
                    detailTitle.innerText = title;
                    detailSubtitle.innerText = title;
                }
                
                // Animasi transisi masuk
                layoutMain.classList.remove('active');
                setTimeout(() => {
                    layoutMain.style.display = 'none';
                    layoutDetail.style.display = 'flex';
                    setTimeout(() => layoutDetail.classList.add('active'), 10);
                }, 300);
            });
        });

        // Tombol Back
        btnBackDetail.addEventListener('click', () => {
            layoutDetail.classList.remove('active');
            setTimeout(() => {
                layoutDetail.style.display = 'none';
                layoutMain.style.display = 'flex';
                setTimeout(() => layoutMain.classList.add('active'), 10);
            }, 300);
        });
    }

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
