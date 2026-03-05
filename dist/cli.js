#!/usr/bin/env node
const require_execute = require('./execute-CRPGBqqX.js');
const pino = require_execute.__toESM(require("pino"));
const commander = require_execute.__toESM(require("commander"));
const env_paths = require_execute.__toESM(require("env-paths"));
const path = require_execute.__toESM(require("path"));
const fs = require_execute.__toESM(require("fs"));

//#region src/bin/cli.ts
const paths = (0, env_paths.default)("crawler", { suffix: "" });
const program = new commander.Command();
const stderrLogger = (0, pino.default)(pino.default.destination(2));
program.name("scraper").description("Scrape HTML content from a URL").argument("<address>", "Address to search for").option("--log", "Enable logging to stderr").option("--debug", "Save screenshot and html for debugging").action(async (address, opts) => {
	const logger = opts.log ? stderrLogger : (0, pino.default)({ level: "silent" });
	logger.info("starting for " + address);
	const screenshotPath = path.default.join(paths.cache, "debug.png");
	const debug = opts.debug || false ? async (page) => {
		await page.screenshot({
			path: screenshotPath,
			fullPage: true
		});
		logger.info("screenshot saved at: " + screenshotPath);
		const content = await page.content();
		const contentPath = path.default.join(paths.cache, "debug.html");
		fs.default.writeFileSync(contentPath, content);
		logger.info("html saved at: " + contentPath);
	} : void 0;
	try {
		const content = await require_execute.execute(address, debug);
		process.stdout.write(JSON.stringify(content) + "\n");
	} catch (error) {
		logger.error(error);
		process.exit(1);
	}
});
program.parse();

//#endregion
exports.stderrLogger = stderrLogger;
//# sourceMappingURL=cli.js.map