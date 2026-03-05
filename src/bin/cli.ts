#!/usr/bin/env node

import type { Page } from 'puppeteer-core';

import { Command } from 'commander';
import pino from 'pino';

import { execute } from '../execute';

import envPaths from 'env-paths';
import path from 'path';

import fs from 'fs';

const paths = envPaths('crawler', { suffix: '' });
const program = new Command();

export const stderrLogger: pino.Logger = pino(pino.destination(2));

program
  .name('scraper')
  .description('Scrape HTML content from a URL')
  .argument('<address>', 'Address to search for')
  .option('--log', 'Enable logging to stderr')
  .option('--debug', 'Save screenshot and html for debugging')
  .action(async (address: string, opts: { debug: boolean, log: boolean }) => {
    const logger = opts.log ? stderrLogger : pino({ level: 'silent' });

    logger.info('starting for ' + address);

    const screenshotPath = path.join(paths.cache, 'debug.png');
    const debug = opts.debug || false
      ? async (page: Page) => {
        await page.screenshot({ path: screenshotPath, fullPage: true });
        logger.info('screenshot saved at: ' + screenshotPath);

        const content = await page.content();

        const contentPath = path.join(paths.cache, 'debug.html');
        fs.writeFileSync(contentPath, content);
        logger.info('html saved at: ' + contentPath);
      }
      : undefined;

    try {
      const content = await execute(address, debug);

      process.stdout.write(JSON.stringify(content) + "\n");
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  });

program.parse();
