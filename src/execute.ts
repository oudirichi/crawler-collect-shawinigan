import type { Page } from 'puppeteer-core';

import pino from 'pino';
import { parse, type Result } from './helper/parser'
import { getContentForAddress } from 'crawler-helper';
import { sleep } from './helper/sleep';

const URL = 'https://geoweb.shawinigan.ca/CollecteMatieresResiduelles/';

export const stderrLogger: pino.Logger = pino(pino.destination(2));

export async function execute(
  address: string,
  callback: ((page: Page) => Promise<void>) | undefined = undefined,
): Promise<Result[]> {
  const delay = 3000;

  const content = await getContentForAddress(
    URL,
    async (page) => {
      await sleep(delay);
      await page.click('#closeSplash');
      await sleep(delay);
      await page.waitForSelector('#searchInput', { visible: true });
      await page.type('#searchInput', address, { delay: 120 });
      await page.click('#searchSubmit');

      await sleep(delay);

      if (callback) {
        await callback(page);
      }
    },
  );

  return parse(content);
}
