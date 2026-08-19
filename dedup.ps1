$lines = Get-Content 'index.html' -Encoding UTF8
$newLines = new-object System.Collections.Generic.List[string]

$countHtml = 0
$skipHtml = $false

$countJs = 0
$skipJs = $false

for ($i=0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '<!-- LAYOUT DETAIL TRANSAKSI -->') {
        $countHtml++
        if ($countHtml -gt 1) {
            $skipHtml = $true
        }
    }
    
    if ($skipHtml) {
        if ($lines[$i] -match '<!-- LAYOUT RIWAYAT PELANGGAN -->') {
            $skipHtml = $false
            $newLines.Add($lines[$i])
        }
        # wait, my injected HTML goes until '<!-- LAYOUT KASIR / POS' maybe?
        # In patch_detail_trx.ps1 I injected BEFORE '<!-- LAYOUT KASIR / POS'
        if ($lines[$i] -match '<!-- LAYOUT KASIR / POS') {
            $skipHtml = $false
            $newLines.Add($lines[$i])
        }
        continue
    }

    if ($lines[$i] -match '// --- LOGIKA DETAIL TRANSAKSI ---') {
        $countJs++
        if ($countJs -gt 1) {
            $skipJs = $true
        }
    }

    if ($skipJs) {
        if ($lines[$i] -match 'window.renderKelolaPelanggan = function') {
            $skipJs = $false
            $newLines.Add($lines[$i])
        }
        if ($lines[$i] -match '// --- LOGIKA RIWAYAT PELANGGAN ---') {
            $skipJs = $false
            $newLines.Add($lines[$i])
        }
        continue
    }

    $newLines.Add($lines[$i])
}

[IO.File]::WriteAllLines('index.html', $newLines, [System.Text.Encoding]::UTF8)
Write-Output "Deduplication complete. HTML found $countHtml times. JS found $countJs times."
