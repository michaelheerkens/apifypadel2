import { Actor } from 'apify';
import { PlaywrightCrawler } from 'crawlee';
import { expect } from '@playwright/test';

await Actor.init();

// Create an instance of the PlaywrightCrawler class - a crawler
// that automatically loads the URLs in headless Chrome / Playwright.
const crawler = new PlaywrightCrawler({
    launchContext: {
        // Here you can set options that are passed to the playwright .launch() function.
        launchOptions: {
            headless: true,
        },
    },

    // Stop crawling after several pages
    maxRequestsPerCrawl: 50,

    // This function will be called for each URL to crawl.
    // Here you can write the Playwright scripts you are familiar with,
    // with the exception that browsers and pages are automatically managed by the Apify SDK.
    // The function accepts a single parameter, which is an object with a lot of properties,
    // the most important being:
    // - request: an instance of the Request class with information such as URL and HTTP method
    // - page: Playwright's Page object (see https://playwright.dev/docs/api/class-page)
    async requestHandler({ request, page, enqueueLinks }) {
        console.log(`Processing ${request.url}...`);

        await page.goto(${request.url});
        await page.locator('input[name="username"]').click();
        await page.locator('input[name="username"]').fill('Michael84');
        await page.locator('input[name="password"]').click();
        await page.locator('input[name="password"]').fill('&nFjY61t&NBgu4');
        await page.getByRole('button', { name: 'Inloggen' }).click();

        const findTime = '21:00';
        const findDate = '2023-2-8';

        await page.goto('https://mypadelclubkrimpen.baanreserveren.nl/reservations/' + findDate + '/sport/1251');

        const rowPath = '#tbl_matrix > tbody > tr > td > table > tbody > tr[data-time="' + findTime + '"]';
        const findRow = await page.locator(rowPath);
        const findUTC = await findRow.getAttribute('utc');

        let findSlot = '0';

        for (const row of await findRow.getByRole('cell').all()) {
          const type = await row.getAttribute('type');
          if(type == 'free') {
            const tmpSlot = await row.getAttribute('slot');
            findSlot =  tmpSlot ?? '';
            break;
          }
        }

        const reservationUrl = 'https://mypadelclubkrimpen.baanreserveren.nl/reservations/make/' + findSlot + '/' + findUTC;

        console.log(reservationUrl);

        await page.goto(reservationUrl);

        await page.locator('select[name="players\\[2\\]"]').selectOption('-1');
        await page.locator('select[name="players\\[3\\]"]').selectOption('-1');
        await page.locator('select[name="players\\[4\\]"]').selectOption('-1');
        await page.getByText('Verder').click();

        const hasBtn = await expect(page.getByText('Bevestigen')).toBeVisible();
        console.log(hasBtn);

        // Save the screenshot to a file
        //const screenshot = await page.screenshot();
        //fs.writeFileSync('screenshot.png', screenshot);
    },

    // This function is called if the page processing failed more than maxRequestRetries+1 times.
    failedRequestHandler({ request }) {
        console.log(`Request ${request.url} failed too many times.`);
    },
});

// Run the crawler and wait for it to finish.
await crawler.run(['https://mypadelclubkrimpen.baanreserveren.nl/']);

console.log('Crawler finished.');

await Actor.exit();
