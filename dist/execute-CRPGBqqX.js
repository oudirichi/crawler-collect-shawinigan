//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
const pino = __toESM(require("pino"));
const cheerio = __toESM(require("cheerio"));
const date_fns = __toESM(require("date-fns"));
const date_fns_locale = __toESM(require("date-fns/locale"));
const crawler_helper = __toESM(require("crawler-helper"));

//#region src/helper/date.ts
function parseFrenchDate(input) {
	const withoutWeekday = input.replace(/^\w+\s/, "");
	const date = (0, date_fns.parse)(withoutWeekday, "d MMMM", /* @__PURE__ */ new Date(), { locale: date_fns_locale.fr });
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
function parse(htmlContent) {
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
const stderrLogger = (0, pino.default)(pino.default.destination(2));
async function execute(address, callback = void 0) {
	const delay = 3e3;
	const content = await (0, crawler_helper.getContentForAddress)(URL, async (page) => {
		await sleep(delay);
		await page.click("#closeSplash");
		await sleep(delay);
		await page.waitForSelector("#searchInput", { visible: true });
		await page.type("#searchInput", address, { delay: 120 });
		await page.click("#searchSubmit");
		await sleep(delay);
		if (callback) await callback(page);
	});
	return parse(content);
}

//#endregion
Object.defineProperty(exports, '__toESM', {
  enumerable: true,
  get: function () {
    return __toESM;
  }
});
Object.defineProperty(exports, 'execute', {
  enumerable: true,
  get: function () {
    return execute;
  }
});
//# sourceMappingURL=execute-CRPGBqqX.js.map