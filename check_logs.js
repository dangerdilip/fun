const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    try {
        await page.goto('http://localhost:8080');
        // Wait long enough for all assets to load
        await new Promise(r => setTimeout(r, 8000));
    } catch (e) {
        console.log("Error loading page:", e);
    }
    
    await browser.close();
})();
