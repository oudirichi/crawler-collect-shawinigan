#!/usr/bin/env node
import { Command } from "commander";
import pino from "pino";
import * as cheerio from "cheerio";
import { parse } from "date-fns";
import { fr } from "date-fns/locale";
import { getContentForAddress } from "crawler-helper";
import envPaths from "env-paths";
import path from "path";
import fs from "fs";

//#region src/helper/date.ts
function parseFrenchDate(input) {
	const withoutWeekday = input.replace(/^\w+\s/, "");
	const date = parse(withoutWeekday, "d MMMM", /* @__PURE__ */ new Date(), { locale: fr });
	return date;
}

//#endregion
//#region src/helper/parser.ts
const definitions = [
	{
		id: "tdCollecteOrdures",
		key: "garbage"
	},
	{
		id: "tdCollecteRecyclage",
		key: "recycling"
	},
	{
		id: "tdCollecteCompost",
		key: "compost"
	}
];
function parse$1(htmlContent) {
	const $ = cheerio.load(htmlContent);
	const schedules = {};
	definitions.forEach((definition) => {
		$("#trDataContent > td#" + definition.id).each((index, element) => {
			const dates = $(element).find("ul li").map((i, li) => $(li).text().trim()).toArray();
			dates.forEach((date) => {
				const parsed = parseFrenchDate(date);
				const dateWithoutDay = parsed.toISOString().split("T")[0];
				if (!(dateWithoutDay in schedules)) schedules[dateWithoutDay] = {
					date: dateWithoutDay,
					garbage: false,
					recycling: false,
					compost: false
				};
				schedules[dateWithoutDay][definition.key] = true;
			});
		});
	});
	return Object.values(schedules);
}

//#endregion
//#region src/helper/sleep.ts
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

//#endregion
//#region src/execute.ts
const URL = "https://geoweb.shawinigan.ca/CollecteMatieresResiduelles/";
const stderrLogger$1 = pino(pino.destination(2));
async function execute(address, callback = void 0) {
	const delay = 3e3;
	const content = await getContentForAddress(URL, async (page) => {
		await sleep(delay);
		await page.click("#closeSplash");
		await sleep(delay);
		await page.waitForSelector("#searchInput", { visible: true });
		await page.type("#searchInput", address, { delay: 120 });
		await page.click("#searchSubmit");
		await sleep(delay);
		if (callback) await callback(page);
	});
	return parse$1(content);
}

//#endregion
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