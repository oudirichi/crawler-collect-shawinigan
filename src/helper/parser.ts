import * as cheerio from 'cheerio';
import { parseFrenchDate } from './date';

export interface Result {
  date: string;
  garbage: boolean;
  recycling: boolean;
  compost: boolean;
}

interface Definition {
  id: string;
  key: Exclude<keyof Result, 'date'>;
}

const definitions: Definition[] = [
  { id: 'tdCollecteOrdures', key: 'garbage' },
  { id: 'tdCollecteRecyclage', key: 'recycling' },
  { id: 'tdCollecteCompost', key: 'compost' },
];

export function parse(htmlContent: string): Result[]
 {
  const $ = cheerio.load(htmlContent);

  const schedules: Record<string, Result> = {};
  definitions.forEach((definition) => {
    $('#trDataContent > td#' + definition.id).each((index, element) => {
      const dates = $(element).find('ul li').map((i, li) => $(li).text().trim()).toArray();

      dates.forEach(date => {
        const parsed = parseFrenchDate(date);

        const dateWithoutDay = parsed.toISOString().split('T')[0];

        if (!(dateWithoutDay in schedules)) {
          schedules[dateWithoutDay] = {
            date: dateWithoutDay,
            garbage: false,
            recycling: false,
            compost: false,
          };
        }

        schedules[dateWithoutDay][definition.key] = true;
      });
    });
  });

  return Object.values(schedules);
}
