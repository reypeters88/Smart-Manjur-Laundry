const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('file:///g:/My%20Drive/Apiksi/Projek%204/manjur-laundry-modern/index.html');
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    await page.evaluate(() => {
        let history = [];
        for(let i=0; i<124; i++) history.push({id: 'test-'+i, status: 'validasi'});
        localStorage.setItem('db_pemasukan', JSON.stringify(history));
    });
    
    await page.reload();
    
    await page.waitForSelector('.service-card[data-title="Semua"]');
    
    // override layoutDetail display to see if it gets called
    await page.evaluate(() => {
        const ld = document.getElementById('layout-detail');
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    console.log('layout-detail style changed to:', ld.style.display);
                    console.trace('Trace for layout-detail change');
                }
            });
        });
        observer.observe(ld, { attributes: true });
    });
    
    await page.click('.service-card[data-title="Semua"]');
    await new Promise(r => setTimeout(r, 1000));
    
    await browser.close();
})();
