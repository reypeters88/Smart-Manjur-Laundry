$indexFile = "G:\My Drive\Apiksi\Projek 2\index.html"
$laporanFile = "G:\My Drive\Apiksi\Projek 2\laporan.js"

$indexContent = Get-Content $indexFile -Raw
$laporanContent = Get-Content $laporanFile -Raw

# index.html financeChart
$indexTarget1 = @"
                let existingFinanceChart = Chart.getChart("financeChart");
                if (existingFinanceChart) existingFinanceChart.destroy();
"@
$indexReplace1 = @"
                let newCtxFinance = document.createElement('canvas');
                newCtxFinance.id = 'financeChart';
                ctx.parentNode.replaceChild(newCtxFinance, ctx);
                ctx = newCtxFinance;
"@
$indexContent = $indexContent.Replace($indexTarget1, $indexReplace1)

# index.html omzetChart
$indexTarget2 = @"
                let existingOmzetChart = Chart.getChart("omzetChart");
                if (existingOmzetChart) existingOmzetChart.destroy();
"@
$indexReplace2 = @"
                let newCtxOmzet = document.createElement('canvas');
                newCtxOmzet.id = 'omzetChart';
                ctx.parentNode.replaceChild(newCtxOmzet, ctx);
                ctx = newCtxOmzet;
"@
$indexContent = $indexContent.Replace($indexTarget2, $indexReplace2)

Set-Content $indexFile -Value $indexContent -Encoding UTF8


# laporan.js omzetChart
$laporanTarget1 = @"
            let existingChart = Chart.getChart('omzetChart'); if (existingChart) existingChart.destroy();
"@
$laporanReplace1 = @"
            let newCtx = document.createElement('canvas');
            newCtx.id = 'omzetChart';
            ctx.parentNode.replaceChild(newCtx, ctx);
            ctx = newCtx;
"@
$laporanContent = $laporanContent.Replace($laporanTarget1, $laporanReplace1)

Set-Content $laporanFile -Value $laporanContent -Encoding UTF8

Write-Output "CANVAS CLONE APPLIED"
