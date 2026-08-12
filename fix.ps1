$path = "G:\My Drive\Apiksi\Projek 2\index.html"
$content = Get-Content $path -Raw

# Helper to normalize line endings and spaces
$contentNorm = $content -replace "`r`n", "`n"

$target = @"
                        // Untuk Omzet
                        if (title === 'Omzet') {
                            const lOmzet = document.getElementById('layout-omzet');
                            if (lOmzet) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lOmzet.style.display = 'flex';
                                    setTimeout(() => lOmzet.classList.add('active'), 10);

                                    // Initialize chart if needed
                                    if (typeof initOmzetChart === 'function') initOmzetChart();
                                }, 300);
                                return;
                            }
                        }

                        // Untuk Arus Keuangan
                        if (title === 'Arus Keuangan') {
                            const lArus = document.getElementById('layout-arus-keuangan');
                            if (lArus) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lArus.style.display = 'flex';
                                    setTimeout(() => lArus.classList.add('active'), 10);
                                }, 300);
                                return;
                            }
                        }

                        // Untuk Pendapatan Transaksi
                        if (title === 'Pendapatan Transaksi') {
                            const lPendapatan = document.getElementById('layout-pendapatan-transaksi');
                            if (lPendapatan) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lPendapatan.style.display = 'flex';
                                    setTimeout(() => lPendapatan.classList.add('active'), 10);
                                }, 300);
                                return;
                            }
                        }

                        // Untuk Pendapatan Lainnya
                        if (title === 'Pendapatan Lainnya') {
                            const lLainnya = document.getElementById('layout-pendapatan-lainnya');
                            if (lLainnya) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lLainnya.style.display = 'flex';
                                    setTimeout(() => lLainnya.classList.add('active'), 10);
                                }, 300);
                                return;
                            }
                        }

                        // Untuk Biaya Usaha
                        if (title === 'Biaya Usaha') {
                            const lHutang = document.getElementById('layout-hutang');
                            if (lHutang) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lHutang.style.display = 'flex';
                                    setTimeout(() => lHutang.classList.add('active'), 10);
                                }, 300);
                                return;
                            }
                        }
                        // Untuk Pengeluaran
                        if (title === 'Pengeluaran') {
                            const lPengeluaran = document.getElementById('layout-pengeluaran');
                            if (lPengeluaran) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lPengeluaran.style.display = 'flex';
                                    setTimeout(() => lPengeluaran.classList.add('active'), 10);
                                }, 300);
                                return;
                            }
                        }
"@

$targetNorm = $target -replace "`r`n", "`n"

$replacement = @"
                        // Untuk Omzet
                        if (title === 'Omzet') {
                            const lOmzet = document.getElementById('layout-omzet');
                            if (lOmzet) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lOmzet.style.display = 'flex';
                                    setTimeout(() => lOmzet.classList.add('active'), 10);

                                    if (typeof window.renderLaporanOmzet === 'function') window.renderLaporanOmzet();
                                    // Initialize chart if needed
                                    if (typeof initOmzetChart === 'function') initOmzetChart();
                                }, 300);
                                return;
                            }
                        }

                        // Untuk Arus Keuangan
                        if (title === 'Arus Keuangan') {
                            const lArus = document.getElementById('layout-arus-keuangan');
                            if (lArus) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lArus.style.display = 'flex';
                                    setTimeout(() => lArus.classList.add('active'), 10);

                                    if (typeof window.renderLaporanArusKeuangan === 'function') window.renderLaporanArusKeuangan();
                                }, 300);
                                return;
                            }
                        }

                        // Untuk Pendapatan Transaksi
                        if (title === 'Pendapatan Transaksi') {
                            const lPendapatan = document.getElementById('layout-pendapatan-transaksi');
                            if (lPendapatan) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lPendapatan.style.display = 'flex';
                                    setTimeout(() => lPendapatan.classList.add('active'), 10);

                                    if (typeof window.renderLaporanPendapatan === 'function') window.renderLaporanPendapatan('hari-ini', 'transaksi');
                                }, 300);
                                return;
                            }
                        }

                        // Untuk Pendapatan Lainnya
                        if (title === 'Pendapatan Lainnya') {
                            const lLainnya = document.getElementById('layout-pendapatan-lainnya');
                            if (lLainnya) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lLainnya.style.display = 'flex';
                                    setTimeout(() => lLainnya.classList.add('active'), 10);

                                    if (typeof window.renderLaporanPendapatan === 'function') window.renderLaporanPendapatan('hari-ini', 'lainnya');
                                }, 300);
                                return;
                            }
                        }

                        // Untuk Biaya Usaha
                        if (title === 'Biaya Usaha') {
                            const lHutang = document.getElementById('layout-hutang');
                            if (lHutang) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lHutang.style.display = 'flex';
                                    setTimeout(() => lHutang.classList.add('active'), 10);
                                }, 300);
                                return;
                            }
                        }
                        
                        // Untuk Pengeluaran
                        if (title === 'Pengeluaran') {
                            const lPengeluaran = document.getElementById('layout-pengeluaran');
                            if (lPengeluaran) {
                                allLayouts.forEach(l => { if (l) l.classList.remove('active'); });
                                setTimeout(() => {
                                    hideAllLayouts();
                                    lPengeluaran.style.display = 'flex';
                                    setTimeout(() => lPengeluaran.classList.add('active'), 10);

                                    if (typeof window.renderLaporanPengeluaran === 'function') window.renderLaporanPengeluaran();
                                }, 300);
                                return;
                            }
                        }
"@

$replacementNorm = $replacement -replace "`r`n", "`n"

if ($contentNorm.Contains($targetNorm)) {
    $contentNorm = $contentNorm.Replace($targetNorm, $replacementNorm)
    Set-Content $path -Value $contentNorm -Encoding UTF8
    Write-Output "SUCCESS"
} else {
    Write-Output "TARGET NOT FOUND"
}
