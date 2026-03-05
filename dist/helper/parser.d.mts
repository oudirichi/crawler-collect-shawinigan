export interface Result {
    date: string;
    garbage: boolean;
    recycling: boolean;
    compost: boolean;
}
export declare function parse(htmlContent: string): Result[];
