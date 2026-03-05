import type { Page } from 'puppeteer-core';
import pino from 'pino';
import { type Result } from './helper/parser';
export declare const stderrLogger: pino.Logger;
export declare function execute(address: string, callback?: ((page: Page) => Promise<void>) | undefined): Promise<Result[]>;
