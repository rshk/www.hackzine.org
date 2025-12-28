import { DateTime } from "luxon";
import nunjucks from "nunjucks";
const { lib, runtime } = nunjucks;

export default function (eleventyConfig) {
    eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
        // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
        return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
            format || "yyyy-LL-dd T",
        );
    });

    eleventyConfig.addFilter("htmlDateString", (dateObj) => {
        // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
        // https://moment.github.io/luxon/#/formatting?id=table-of-tokens
        return DateTime.fromJSDate(dateObj, { zone: "utc" }).toISO();
    });

    // Get the first `n` elements of a collection.
    eleventyConfig.addFilter("head", (array, n) => {
        if (!Array.isArray(array) || array.length === 0) {
            return [];
        }
        if (n < 0) {
            return array.slice(n);
        }

        return array.slice(0, n);
    });

    // Return the smallest number argument
    eleventyConfig.addFilter("min", (...numbers) => {
        return Math.min.apply(null, numbers);
    });

    // Return the keys used in an object
    eleventyConfig.addFilter("getKeys", (target) => {
        return Object.keys(target);
    });

    eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
        return (tags || []).filter(
            (tag) => ["all", "posts"].indexOf(tag) === -1,
        );
    });

    eleventyConfig.addFilter("sortAlphabetically", (strings) =>
        (strings || []).sort((b, a) => b.localeCompare(a)),
    );

    eleventyConfig.addFilter(
        "hexNum",
        (number, length = 2) =>
            "0x" + ("0".repeat(length) + number.toString(16)).slice(-length),
    );

    eleventyConfig.addFilter("rightalign", (str, width) => {
        const NBSP = " ";
        str = normalize(str.toString(), "");
        width = width || 80;

        if (str.length >= width) {
            return str;
        }

        const spaces = width - str.length;
        const pre = lib.repeat(NBSP, spaces);
        return runtime.copySafeness(str, pre + str);
    });

    eleventyConfig.addFilter("readableBytes", (num, width) => {
        const KB = 1024;
        const MB = KB * KB;
        const GB = MB * KB;
        const TB = GB * KB;
        const PB = TB * KB;

        if (num >= PB) {
            return `${Math.floor(num / PB)}P`;
        }
        if (num >= TB) {
            return `${Math.floor(num / TB)}T`;
        }
        if (num >= GB) {
            return `${Math.floor(num / GB)}G`;
        }
        if (num >= MB) {
            return `${Math.floor(num / MB)}M`;
        }
        if (num >= KB) {
            return `${Math.floor(num / KB)}k`;
        }
        return `${num}`;
    });
}

// From nunjucks/src/filters.js
function normalize(value, defaultValue) {
    if (value === null || value === undefined || value === false) {
        return defaultValue;
    }
    return value;
}
