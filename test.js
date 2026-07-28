document.addEventListener('DOMContentLoaded', () => {
    
    // --- TAB NAVIGATION ---
    const topTabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const statsSlider = document.getElementById('transaksi-stats');
    const keuanganStats = document.getElementById('keuangan-stats');

    topTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert('Keuangan/Tab ditekan! Target: ' + btn.getAttribute('data-tab'));

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

    // --- PESANAN TAB & FILTER LOGIC ---
    const btnBackPesanan = document.getElementById('btn-back-pesanan');
    if(btnBackPesanan) {
        btnBackPesanan.addEventListener('click', () => {
            const berandaBtn = document.querySelector('.b-nav-btn[data-bnav="transaksi"]');
            if(berandaBtn) berandaBtn.click();
        });
    }

    const pesananChips = document.querySelectorAll('.p-tab-btn');
    const pesananRows = document.querySelectorAll('.pesanan-row');
    const statusDropdowns = document.querySelectorAll('.status-dropdown');

    // Filter Function
    function filterPesanan(filterValue) {
        const keywordInput = document.getElementById('input-search-pesanan');
        const keyword = keywordInput ? keywordInput.value.toLowerCase() : '';

        pesananRows.forEach(row => {
            const statusMatch = (filterValue === 'semua' || row.getAttribute('data-status') === filterValue);
            const textMatch = row.textContent.toLowerCase().includes(keyword);

            if (statusMatch && textMatch) {
                row.style.display = 'flex';
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Chip Click Events
    pesananChips.forEach(chip => {
        chip.addEventListener('click', () => {
            pesananChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filterPesanan(chip.getAttribute('data-filter'));
        });
    });

    // Dropdown Change Event
    statusDropdowns.forEach(dropdown => {
        dropdown.addEventListener('change', (e) => {
            const newStatus = e.target.value;
            const parentRow = e.target.closest('.pesanan-row');
            if (parentRow) {
                parentRow.setAttribute('data-status', newStatus);
                // Re-apply current filter so it disappears if it no longer matches
                const activeChip = document.querySelector('.p-tab-btn.active');
                if (activeChip) {
                    filterPesanan(activeChip.getAttribute('data-filter'));
                }
            }
        });
    });

    // Search Toggle Logic
    const btnSearchPesanan = document.getElementById('btn-search-pesanan');
    const searchContainerPesanan = document.getElementById('pesanan-search-container');
    const inputSearchPesanan = document.getElementById('input-search-pesanan');
    if (btnSearchPesanan) {
        btnSearchPesanan.addEventListener('click', () => {
            if (searchContainerPesanan.style.display === 'none') {
                searchContainerPesanan.style.display = 'block';
                inputSearchPesanan.focus();
            } else {
                searchContainerPesanan.style.display = 'none';
                inputSearchPesanan.value = '';
                const activeChip = document.querySelector('.p-tab-btn.active');
                filterPesanan(activeChip ? activeChip.getAttribute('data-filter') : 'semua');
            }
        });
    }

    if (inputSearchPesanan) {
        inputSearchPesanan.addEventListener('input', () => {
            const activeChip = document.querySelector('.p-tab-btn.active');
            filterPesanan(activeChip ? activeChip.getAttribute('data-filter') : 'semua');
        });
    }

    // Refresh Logic
    const btnRefreshPesanan = document.getElementById('btn-refresh-pesanan');
    if (btnRefreshPesanan) {
        btnRefreshPesanan.addEventListener('click', () => {
            const icon = btnRefreshPesanan.querySelector('i');
            icon.classList.add('fa-spin');
            
            setTimeout(() => {
                icon.classList.remove('fa-spin');
                if(window.Swal) {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Data berhasil diperbarui',
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            }, 800);
        });
    }

    // --- BOTTOM SHEET & TAMBAH PELANGGAN NAVIGATION (+) ---
    const layoutMain = document.getElementById('layout-main');
    const btnAddTrx = document.getElementById('btn-add-transaction');
    
    // Bottom Sheet elements
    const bsOverlay = document.getElementById('bs-pelanggan');
    const bsMenu = document.getElementById('bs-menu-pelanggan');
    
    // Bottom sheet toggle logic
    btnAddTrx.addEventListener('click', () => {
        const isOpen = bsOverlay.classList.contains('active');
        if (isOpen) {
            closeBottomSheet();
        } else {
            bsOverlay.classList.add('active');
            bsMenu.classList.add('active');
            btnAddTrx.classList.add('close-mode');
            btnAddTrx.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        }
    });

    bsOverlay.addEventListener('click', closeBottomSheet);

    function closeBottomSheet() {
        bsOverlay.classList.remove('active');
        bsMenu.classList.remove('active');
        btnAddTrx.classList.remove('close-mode');
        btnAddTrx.innerHTML = '<i class="fa-solid fa-plus"></i>';
    }

    // --- CARI PELANGGAN LOGIC & NAVIGATION ---
    const btnCariPelanggan = document.getElementById('btn-cari-pelanggan');
    const layoutCariPelanggan = document.getElementById('layout-cari-pelanggan');
    const btnBackCp = document.getElementById('btn-back-cp');
    const inputSearchCp = document.getElementById('input-search-cp');
    const cpCards = document.querySelectorAll('.cp-card');
    const btnPilihCpList = document.querySelectorAll('.cp-btn-pilih');

    const layoutPos = document.getElementById('layout-pos');
    const btnBackPos = document.getElementById('btn-back-pos');

    // Navigasi dari Bottom Sheet -> Cari Pelanggan
    if (btnCariPelanggan) {
        btnCariPelanggan.addEventListener('click', () => {
            closeBottomSheet();
            layoutMain.classList.remove('active');
            layoutMain.style.display = 'none';
            layoutCariPelanggan.style.display = 'block';
            setTimeout(() => layoutCariPelanggan.classList.add('active'), 10);
            if(inputSearchCp) inputSearchCp.value = ''; // Reset pencarian
            cpCards.forEach(c => c.style.display = 'flex');
        });
    }

    // Tombol Back di Halaman Cari Pelanggan
    if (btnBackCp) {
        btnBackCp.addEventListener('click', () => {
            layoutCariPelanggan.classList.remove('active');
            layoutCariPelanggan.style.display = 'none';
            layoutMain.style.display = 'flex';
            setTimeout(() => layoutMain.classList.add('active'), 10);
        });
    }

    // Fitur Search/Filter di Daftar Pelanggan
    if (inputSearchCp) {
        inputSearchCp.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            cpCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (text.includes(query)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // Navigasi Pilih Pelanggan -> Kasir POS
    btnPilihCpList.forEach(btn => {
        btn.addEventListener('click', () => {
            layoutCariPelanggan.classList.remove('active');
            layoutCariPelanggan.style.display = 'none';
            layoutPos.style.display = 'flex';
            setTimeout(() => layoutPos.classList.add('active'), 10);
        });
    });

    if (btnBackPos) {
        btnBackPos.addEventListener('click', () => {
            layoutPos.classList.remove('active');
            layoutPos.style.display = 'none';
            layoutMain.style.display = 'flex';
            setTimeout(() => layoutMain.classList.add('active'), 10);
        });
    }

    // Navigasi ke Tambah Pelanggan
    const btnTambahPelanggan = document.getElementById('btn-tambah-pelanggan');
    const layoutTambahPelanggan = document.getElementById('layout-tambah-pelanggan');
    const btnBackTp = document.getElementById('btn-back-tp');

    btnTambahPelanggan.addEventListener('click', () => {
        closeBottomSheet();
        layoutMain.classList.remove('active');
        layoutMain.style.display = 'none';
        
        layoutTambahPelanggan.style.display = 'block';
        setTimeout(() => layoutTambahPelanggan.classList.add('active'), 10);
    });

    btnBackTp.addEventListener('click', () => {
        layoutTambahPelanggan.classList.remove('active');
        layoutTambahPelanggan.style.display = 'none';
        layoutMain.style.display = 'flex';
        setTimeout(() => layoutMain.classList.add('active'), 10);
    });

    // --- MODAL PILIH BULAN (KEUANGAN) ---
    const btnPilihPeriode = document.getElementById('btn-pilih-periode');
    const textPeriode = document.getElementById('text-periode');
    const modalPilihBulan = document.getElementById('modal-pilih-bulan');
    const monthListContainer = document.getElementById('month-list-container');

    if (btnPilihPeriode && modalPilihBulan && monthListContainer) {
        const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
        let currentYear = 2024;

        // Init months
        monthListContainer.innerHTML = '';
        months.forEach((m, idx) => {
            const div = document.createElement('div');
            div.className = 'month-item';
            if (idx === 6) div.classList.add('selected'); // Default Juli
            div.textContent = m + " " + currentYear;
            div.addEventListener('click', () => {
                document.querySelectorAll('.month-item').forEach(i => i.classList.remove('selected'));
                div.classList.add('selected');
                textPeriode.textContent = div.textContent;
                modalPilihBulan.style.display = 'none';
            });
            monthListContainer.appendChild(div);
        });

        btnPilihPeriode.addEventListener('click', () => {
            modalPilihBulan.style.display = 'flex';
        });

        modalPilihBulan.addEventListener('click', (e) => {
            if (e.target === modalPilihBulan) {
                modalPilihBulan.style.display = 'none';
            }
        });
    }

    // --- FORM TAMBAH PELANGGAN LOGIC ---
    const btnSimpanPelanggan = document.getElementById('btn-simpan-pelanggan');
    const inputNama = document.getElementById('tp-input-nama');
    const inputTelepon = document.getElementById('tp-input-telepon');
    const cbTanpaTelepon = document.getElementById('tanpa-telepon');
    const inputEmail = document.getElementById('tp-input-email');
    const inputAlamat = document.getElementById('tp-input-alamat');

    if (btnSimpanPelanggan) {
        btnSimpanPelanggan.addEventListener('click', () => {
            const nama = inputNama ? inputNama.value.trim() : '';
            const tanpaTelepon = cbTanpaTelepon ? cbTanpaTelepon.checked : false;
            const telepon = inputTelepon ? inputTelepon.value.trim() : '';

            if (!nama) {
                if(window.Swal) {
                    Swal.fire('Oops...', 'Nama pelanggan tidak boleh kosong!', 'error');
                } else {
                    alert('Nama pelanggan tidak boleh kosong!');
                }
                return;
            }

            if (!tanpaTelepon && !telepon) {
                if(window.Swal) {
                    Swal.fire('Oops...', 'Nomor telepon harus diisi, atau centang "Tanpa nomor telepon"!', 'error');
                } else {
                    alert('Nomor telepon harus diisi, atau centang "Tanpa nomor telepon"!');
                }
                return;
            }

            // Simulate save success
            if(window.Swal) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: `Pelanggan atas nama ${nama} berhasil ditambahkan.`,
                    showConfirmButton: false,
                    timer: 2000
                }).then(() => {
                    resetAndCloseForm();
                });
            } else {
                alert(`Pelanggan atas nama ${nama} berhasil ditambahkan.`);
                resetAndCloseForm();
            }
        });
    }

    function resetAndCloseForm() {
        // Clear inputs
        if(inputNama) inputNama.value = '';
        if(inputTelepon) inputTelepon.value = '';
        if(cbTanpaTelepon) cbTanpaTelepon.checked = false;
        if(inputEmail) inputEmail.value = '';
        if(inputAlamat) inputAlamat.value = '';
        
        // Check radio buttons and clear them
        const radios = document.querySelectorAll('input[name="kelamin"]');
        radios.forEach(r => r.checked = false);

        // Click the back button to return to main layout
        if(btnBackTp) btnBackTp.click();
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

    // --- KASIR POS LOGIC ---
    const posNotaBadge = document.getElementById('nota-badge');
    const sChips = document.querySelectorAll('.s-chip');
    const posItemName = document.getElementById('pos-item-name');
    const posPriceInput = document.getElementById('pos-price');
    const posQtyInput = document.getElementById('pos-qty');
    const posSpotting = document.getElementById('pos-spotting');
    const btnAddCart = document.getElementById('btn-add-cart');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const posGrandTotal = document.getElementById('pos-grand-total');
    const btnSimpanPesanan = document.getElementById('btn-simpan-pesanan');

    let cartData = [];
    
    // Format angka ke ribuan (15.000)
    function formatRibuan(angka) {
        return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    function parseRibuan(text) {
        return parseInt(text.replace(/\./g, '')) || 0;
    }

    if (posPriceInput) {
        // Auto format saat ngetik harga
        posPriceInput.addEventListener('input', (e) => {
            let val = e.target.value.replace(/[^0-9]/g, '');
            if(val) e.target.value = formatRibuan(parseInt(val));
            else e.target.value = '';
        });
    }

    // Generator Nomor Nota: MJR-MMYY-XXXX
    function generateNota() {
        const d = new Date();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yy = String(d.getFullYear()).slice(-2);
        const randomCode = Math.floor(1000 + Math.random() * 9000);
        return `MJR-${mm}${yy}-${randomCode}`;
    }

    // Set Nota baru saat halaman dimuat
    if(posNotaBadge) posNotaBadge.innerText = generateNota();

    // Logika pemilihan layanan (Kiloan, Satuan, dll)
    sChips.forEach(chip => {
        chip.addEventListener('click', () => {
            sChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            // Set default harga berdasarkan data-price
            const defaultPrice = chip.getAttribute('data-price');
            if (defaultPrice !== "0" && defaultPrice !== "") {
                posPriceInput.value = formatRibuan(parseInt(defaultPrice));
            } else {
                posPriceInput.value = "";
            }
        });
    });

    function updateCartUI() {
        if(!cartItemsContainer) return;
        cartItemsContainer.innerHTML = '';
        let grandTotal = 0;

        if (cartData.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; color:#94a3b8; font-size:0.9rem; margin-top:20px;">Belum ada pesanan</p>';
            if(posGrandTotal) posGrandTotal.innerText = 'Rp 0';
            return;
        }

        cartData.forEach((item, index) => {
            let itemTotal = item.harga * item.jumlah;
            if (item.spotting) itemTotal += 10000;
            grandTotal += itemTotal;

            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.layanan} - ${item.nama}</h4>
                    <p>${item.jumlah} x Rp ${formatRibuan(item.harga)}${item.spotting ? ' (+ Spotting 10k)' : ''}</p>
                </div>
                <div style="display:flex; align-items:center;">
                    <div class="cart-item-price">Rp ${formatRibuan(itemTotal)}</div>
                    <button class="cart-item-delete" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        if(posGrandTotal) posGrandTotal.innerText = 'Rp ' + formatRibuan(grandTotal);

        // Delete button listener
        document.querySelectorAll('.cart-item-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.currentTarget.getAttribute('data-index');
                cartData.splice(idx, 1);
                updateCartUI();
            });
        });
    }

    if (btnAddCart) {
        btnAddCart.addEventListener('click', () => {
            const activeService = document.querySelector('.s-chip.active');
            const layanan = activeService ? activeService.innerText : 'Kiloan';
            const nama = posItemName.value.trim() || 'Item';
            const harga = parseRibuan(posPriceInput.value);
            const jumlah = parseFloat(posQtyInput.value) || 1;
            const spotting = posSpotting.checked;

            if (harga <= 0 || isNaN(harga)) {
                if(window.Swal) Swal.fire('Oops', 'Harga tidak valid!', 'warning');
                else alert('Harga tidak valid!');
                return;
            }

            cartData.push({ layanan, nama, harga, jumlah, spotting });
            updateCartUI();

            // Reset form
            posItemName.value = '';
            posQtyInput.value = '1';
            posSpotting.checked = false;
        });
    }

    // Init empty cart text
    updateCartUI();

    if (btnSimpanPesanan) {
        btnSimpanPesanan.addEventListener('click', () => {
            if (cartData.length === 0) {
                if(window.Swal) Swal.fire('Kosong', 'Tambahkan pesanan ke keranjang dulu!', 'warning');
                else alert('Tambahkan pesanan ke keranjang dulu!');
                return;
            }

            if(window.Swal) {
                Swal.fire({
                    icon: 'success',
                    title: 'Pesanan Tersimpan!',
                    text: 'Nota: ' + (posNotaBadge ? posNotaBadge.innerText : ''),
                    showConfirmButton: true
                }).then(() => {
                    cartData = [];
                    updateCartUI();
                    if(posNotaBadge) posNotaBadge.innerText = generateNota();
                });
            } else {
                alert('Pesanan Tersimpan! Nota: ' + (posNotaBadge ? posNotaBadge.innerText : ''));
                cartData = [];
                updateCartUI();
                if(posNotaBadge) posNotaBadge.innerText = generateNota();
            }
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

