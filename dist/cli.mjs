#!/usr/bin/env node
import { execute } from "./execute-wq5YhR4O.mjs";
import pino from "pino";
import { Command } from "commander";
import envPaths from "env-paths";
import path from "path";
import fs from "fs";

//#region src/bin/cli.ts
const paths = envPaths("crawler", { suffix: "" });
const program = new Command();
const stderrLogger = pino(pino.destination(2));
program.name("scraper").description("Scrape HTML content from a URL").argument("<address>", "Address to search for").option("--log", "Enable logging to stderr").option("--debug", "Save screenshot and html for debugging").action(async (address, opts) => {
	const logger = opts.log ? stderrLogger : pino({ level: "silent" });
	logger.info("starting for " + address);
	const screenshotPath = path.join(paths.cache, "debug.png");
	const debug = opts.debug || false ? async (page) => {
		await page.screenshot({
			path: screenshotPath,
			fullPage: true
		});
		logger.info("screenshot saved at: " + screenshotPath);
		const content = await page.content();
		const contentPath = path.join(paths.cache, "debug.html");
		fs.writeFileSync(contentPath, content);
		logger.info("html saved at: " + contentPath);
	} : void 0;
	try {
		const content = await execute(address, debug);
		process.stdout.write(JSON.stringify(content) + "\n");
	} catch (error) {
		logger.error(error);
		process.exit(1);
	}
});
program.parse();

//#endregion
export { stderrLogger };
//# sourceMappingURL=cli.mjs.map