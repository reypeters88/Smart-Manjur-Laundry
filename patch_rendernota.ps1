$lines = Get-Content 'index.html' -Encoding UTF8
$start = -1
for($i=0; $i -lt $lines.Length; $i++) {
    if($lines[$i] -match 'function renderNota\(order\)') {
        $start = $i
        break
    }
}
if($start -ne -1) {
    # Replace the 'order.items.forEach(item => {' line (which is usually around $start + 8)
    for($j = $start; $j -lt $start + 20; $j++) {
        if ($lines[$j] -match 'order\.items\.forEach') {
            $lines[$j] = '                let orderItems = order.items; if (typeof orderItems === ''string'') { try { orderItems = JSON.parse(orderItems); } catch(e) { orderItems = []; } } if (!orderItems) orderItems = []; orderItems.forEach(item => {'
            break
        }
    }
    [IO.File]::WriteAllLines('index.html', $lines, [System.Text.Encoding]::UTF8)
    Write-Output 'Patched renderNota'
} else {
    Write-Output 'Could not find renderNota'
}
