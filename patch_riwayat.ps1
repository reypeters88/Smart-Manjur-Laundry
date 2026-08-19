$lines = Get-Content 'index.html' -Encoding UTF8
$newLines = new-object System.Collections.Generic.List[string]

$htmlToInject = @'
        <!-- LAYOUT RIWAYAT PELANGGAN -->
        <div id="layout-riwayat-pelanggan" class="layout" style="display: none; background: #ffffff; min-height: 100vh;">
            <header style="display: flex; align-items: center; padding: 15px 20px; border-bottom: 1px solid #e2e8f0;">
                <button class="btn-icon" id="btn-back-riwayat" style="color: #64748b; font-size: 1.2rem; cursor: pointer; border: none; background: transparent;">
                    <i class="fa-solid fa-arrow-left"></i>
                </button>
                <div style="flex-grow: 1; text-align: center;">
                    <img src="logo_manjur.png" alt="Logo" class="dynamic-logo" style="height: 25px;">
                </div>
                <div style="width: 24px;"></div> <!-- placeholder -->
            </header>
            <div style="padding: 20px;">
                <h2 style="margin: 0; font-size: 1.5rem; color: #1e293b; font-weight: 600;">Detail Transaksi</h2>
            </div>
            <div style="display: flex; border-bottom: 1px solid #e2e8f0;">
                <div id="tab-riwayat-reguler" class="riwayat-tab active" style="flex: 1; text-align: center; padding: 15px 0; font-weight: 600; color: #0284c7; border-bottom: 2px solid #0284c7; cursor: pointer; font-size: 0.9rem;">REGULER</div>
                <div id="tab-riwayat-produk" class="riwayat-tab" style="flex: 1; text-align: center; padding: 15px 0; font-weight: 600; color: #64748b; border-bottom: 2px solid transparent; cursor: pointer; font-size: 0.9rem;">PRODUK</div>
            </div>
            <div id="riwayat-trx-list" style="padding: 15px 20px; display: flex; flex-direction: column; gap: 15px;">
                <!-- List dynamically populated here -->
            </div>
        </div>
'@

$jsToInject = @'
            // --- LOGIKA RIWAYAT PELANGGAN ---
            const btnBackRiwayat = document.getElementById('btn-back-riwayat');
            if (btnBackRiwayat) {
                btnBackRiwayat.addEventListener('click', () => {
                    document.getElementById('layout-riwayat-pelanggan').style.display = 'none';
                    document.getElementById('layout-detail-pelanggan').style.display = 'block';
                });
            }

            let currentRiwayatTab = 'reguler';
            let currentRiwayatCustomer = '';
            let currentRiwayatPhone = '';

            const tabReg = document.getElementById('tab-riwayat-reguler');
            const tabProd = document.getElementById('tab-riwayat-produk');
            
            if (tabReg && tabProd) {
                tabReg.addEventListener('click', function() {
                    this.style.color = '#0284c7';
                    this.style.borderBottom = '2px solid #0284c7';
                    tabProd.style.color = '#64748b';
                    tabProd.style.borderBottom = '2px solid transparent';
                    currentRiwayatTab = 'reguler';
                    if(typeof window.renderRiwayatPelanggan === 'function') window.renderRiwayatPelanggan(currentRiwayatCustomer, currentRiwayatPhone);
                });

                tabProd.addEventListener('click', function() {
                    this.style.color = '#0284c7';
                    this.style.borderBottom = '2px solid #0284c7';
                    tabReg.style.color = '#64748b';
                    tabReg.style.borderBottom = '2px solid transparent';
                    currentRiwayatTab = 'produk';
                    if(typeof window.renderRiwayatPelanggan === 'function') window.renderRiwayatPelanggan(currentRiwayatCustomer, currentRiwayatPhone);
                });
            }

            window.renderRiwayatPelanggan = function(customerName, customerPhone) {
                currentRiwayatCustomer = customerName;
                currentRiwayatPhone = customerPhone;
                
                const listContainer = document.getElementById('riwayat-trx-list');
                if (!listContainer) return;
                listContainer.innerHTML = '';
                
                const history = JSON.parse(localStorage.getItem('db_pemasukan') || '[]');
                
                let filtered = history.filter(o => o.customerName === customerName || o.customerName === customerName + ' (' + customerPhone + ')' || o.customerName === customerName + ' (Tanpa nomor)');
                
                filtered.sort((a,b) => {
                    let timeA = a.timestamp ? a.timestamp : new Date(a.date).getTime();
                    let timeB = b.timestamp ? b.timestamp : new Date(b.date).getTime();
                    return timeB - timeA;
                });

                let count = 0;
                filtered.forEach(o => {
                    let parsedItems = o.items;
                    if (typeof o.items === 'string') {
                        try { parsedItems = JSON.parse(o.items); } catch(e) {}
                    }
                    let isProdukOnly = true;
                    if (parsedItems && parsedItems.length > 0) {
                        for(let i=0; i<parsedItems.length; i++) {
                            if(parsedItems[i].type !== 'produk' && parsedItems[i].kategori !== 'Produk') {
                                isProdukOnly = false;
                                break;
                            }
                        }
                    } else {
                        isProdukOnly = false;
                    }
                    
                    if (currentRiwayatTab === 'reguler' && isProdukOnly) return;
                    if (currentRiwayatTab === 'produk' && !isProdukOnly) return;

                    count++;
                    let totalStr = '0';
                    if (o.dibayar) totalStr = parseInt(o.dibayar).toLocaleString('id-ID');
                    else if (o.total) totalStr = parseInt(o.total).toLocaleString('id-ID');
                    else if (o.grandTotal) totalStr = parseInt(o.grandTotal).toLocaleString('id-ID');

                    let status = o.status || 'Selesai';

                    listContainer.innerHTML += '<div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">' +
                        '<div style="display: flex; align-items: center; gap: 15px;">' +
                            '<div style="width: 45px; height: 45px; background: #fdf4ff; border-radius: 12px; display: flex; justify-content: center; align-items: center; border: 1px solid #fae8ff;">' +
                                '<i class="fa-solid fa-basket-shopping" style="color: #e879f9; font-size: 1.2rem;"></i>' +
                            '</div>' +
                            '<div>' +
                                '<div style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">' + o.id + '</div>' +
                                '<div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">Status : <span style="color: #0284c7; font-weight: 500;">' + status + '</span></div>' +
                            '</div>' +
                        '</div>' +
                        '<div style="font-weight: 600; color: #1e293b; font-size: 1rem;">' +
                            totalStr +
                        '</div>' +
                    '</div>';
                });

                if (count === 0) {
                    listContainer.innerHTML = '<div style="text-align:center; padding: 20px; color:#94a3b8; font-size:0.9rem;">Tidak ada transaksi di kategori ini.</div>';
                }
            };
'@

$btnLihatSemuaLogicNew = @'
                // History filtering (NEW LOGIC)
                const btnLihatSemua = document.getElementById('cd-btn-lihat-history');
                if (btnLihatSemua) {
                    btnLihatSemua.onclick = () => {
                        document.getElementById('layout-detail-pelanggan').style.display = 'none';
                        document.getElementById('layout-riwayat-pelanggan').style.display = 'block';
                        if (typeof window.renderRiwayatPelanggan === 'function') {
                            window.renderRiwayatPelanggan(c.nama, phoneStr);
                        }
                    };
                }
'@

$skipLihatSemua = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    
    if ($lines[$i] -match '<!-- LAYOUT KASIR / POS \(2 STEP REDESIGN\) -->') {
        $newLines.Add($htmlToInject)
    }

    if ($lines[$i] -match 'const btnLihatSemua = document.getElementById\(''cd-btn-lihat-history''\);') {
        if ($lines[$i-1] -match '// History filtering') {
            $skipLihatSemua = $true
            $newLines.Add($btnLihatSemuaLogicNew)
        }
    }

    if ($skipLihatSemua -and $lines[$i] -match '// Switch Layout') {
        $skipLihatSemua = $false
    }

    if ($lines[$i] -match 'window.openCustomerDetail = function \(idx\) {') {
        $newLines.Add($jsToInject)
    }

    if (-not $skipLihatSemua) {
        $newLines.Add($lines[$i])
    }
}

[IO.File]::WriteAllLines('index.html', $newLines, [System.Text.Encoding]::UTF8)
