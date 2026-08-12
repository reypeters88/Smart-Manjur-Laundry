$indexFile = "G:\My Drive\Apiksi\Projek 2\index.html"
$laporanFile = "G:\My Drive\Apiksi\Projek 2\laporan.js"

$indexContent = Get-Content $indexFile -Raw
$laporanContent = Get-Content $laporanFile -Raw

# In index.html, replace financeChartInstance destruction
$indexTarget1 = "if (financeChartInstance) financeChartInstance.destroy();"
$indexReplace1 = @"
                let existingFinanceChart = Chart.getChart("financeChart");
                if (existingFinanceChart) existingFinanceChart.destroy();
"@
$indexContent = $indexContent.Replace($indexTarget1, $indexReplace1)

# In index.html, replace omzetChartInstance destruction
$indexTarget2 = "if (omzetChartInstance) omzetChartInstance.destroy();"
$indexReplace2 = @"
                let existingOmzetChart = Chart.getChart("omzetChart");
                if (existingOmzetChart) existingOmzetChart.destroy();
"@
$indexContent = $indexContent.Replace($indexTarget2, $indexReplace2)

# Save index.html
Set-Content $indexFile -Value $indexContent -Encoding UTF8


# In laporan.js, replace omzetChartInstance destruction
$laporanTarget1 = "if (window.omzetChartInstance) window.omzetChartInstance.destroy();"
$laporanReplace1 = @"
            let existingChart = Chart.getChart("omzetChart");
            if (existingChart) existingChart.destroy();
"@
$laporanContent = $laporanContent.Replace($laporanTarget1, $laporanReplace1)

# Save laporan.js
Set-Content $laporanFile -Value $laporanContent -Encoding UTF8

Write-Output "FIX APPLIED"
