$lines = Get-Content 'index.html' -Encoding UTF8
$newLines = new-object System.Collections.Generic.List[string]

$htmlToInject = Get-Content 'temp_html.txt' -Raw
$jsToInject = Get-Content 'temp_js.txt' -Raw

$modifyListCard = @'
                    listContainer.innerHTML += '<div onclick="if(typeof window.openDetailTrx === `function`) window.openDetailTrx(`' + o.id + '`)" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px; cursor: pointer;">' +
'@

$addedHtml = $false
$addedJs = $false

for ($i = 0; $i -lt $lines.Length; $i++) {
    if (-not $addedHtml -and $lines[$i] -match '<!-- LAYOUT KASIR / POS') {
        $newLines.Add($htmlToInject)
        $addedHtml = $true
    }

    if (-not $addedJs -and $lines[$i] -match 'window.renderRiwayatPelanggan = function') {
        $newLines.Add($jsToInject)
        $addedJs = $true
    }

    if ($lines[$i] -match 'listContainer.innerHTML \+= ''<div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">'' \+') {
        $newLines.Add($modifyListCard)
    } else {
        $newLines.Add($lines[$i])
    }
}

[IO.File]::WriteAllLines('index.html', $newLines, [System.Text.Encoding]::UTF8)
