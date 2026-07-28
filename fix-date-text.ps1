$html = Get-Content "g:\My Drive\Apiksi\Projek 2\index.html" -Raw

$targets = @("arusDateText", "pendapatanDateText", "lainnyaDateText", "omzetDateText", "pengeluaranDateText", "hutangDateText", "lapTransaksiDateText", "labaRugiDateText")

foreach ($t in $targets) {
    $pattern = "(?s)if \(val === 'hari-ini'\)\s*$t\.innerText = '[^']*';.*?else if \(val === 'per-bulan'\)\s*$t\.innerText = '[^']*';"
    $replacement = "if (val === 'hari-ini') $t.innerText = '24/07/2026';
                else if (val === 'kemarin') $t.innerText = '23/07/2026';
                else if (val === '7-hari') $t.innerText = '18/07/2026 - 24/07/2026';
                else if (val === '30-hari') $t.innerText = '25/06/2026 - 24/07/2026';
                else if (val === 'bulan-ini') $t.innerText = '01/07/2026 - 31/07/2026';
                else if (val === 'per-bulan') $t.innerText = 'Juli 2026';"
                
    $html = [regex]::Replace($html, $pattern, $replacement)
}
$html | Out-File "g:\My Drive\Apiksi\Projek 2\index.html" -Encoding utf8
