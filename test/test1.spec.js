import { test, expect } from '@playwright/test';
//const fs = require('fs');

test('test', async ({ page }) => {
  await page.goto('https://mypadelclubkrimpen.baanreserveren.nl/');
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

});
