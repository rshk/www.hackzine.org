import markdown_it_container from "markdown-it-container";

const CALLOUT_PARAMS_RE =
    /^([^\s]+)(?:\s+(\[.*?\]|\(.*?\)|<.*?>))?(?:\s+(.*))?/;
const makeOptions = ({ typeID, defaultSymbol, defaultTitle, md }) => ({
    validate: (params) => {
        let m = params.trim().match(CALLOUT_PARAMS_RE);
        return m[1] == typeID;
    },
    render: (tokens, idx) => {
        let m = tokens[idx].info.trim().match(CALLOUT_PARAMS_RE);
        if (tokens[idx].nesting === 1) {
            let [_1, _2, symbol, title] = m;
            if (!symbol) {
                symbol = defaultSymbol;
            }
            if (!title) {
                title = defaultTitle;
            }
            return (
                [
                    `<div class="callout callout-${typeID}">`,
                    `<div class="callout-header">`,
                    md.utils.escapeHtml(symbol),
                    " ",
                    md.utils.escapeHtml(title),
                    `</div>`,
                    `<div class="callout-body">`,
                ].join("") + "\n"
            );
        } else {
            // closing tag
            return "</div></div>\n";
        }

        let [_, symbol, title] = m.slice(1);
        if (!symbol) {
            symbol = "[*]";
        }
        if (!title) {
            title = "Note";
        }
    },
});

const CONFIGS = [
    { typeID: "note", defaultSymbol: "[*]", defaultTitle: "Note" },
    { typeID: "info", defaultSymbol: "(i)", defaultTitle: "Info" },
    { typeID: "help", defaultSymbol: "(?)", defaultTitle: "Help" },
    { typeID: "success", defaultSymbol: "[✔]", defaultTitle: "Success" },
    { typeID: "warning", defaultSymbol: "<!>", defaultTitle: "Warning" },
    { typeID: "danger", defaultSymbol: "[!]", defaultTitle: "Danger" },
];

export function install(mdLib) {
    CONFIGS.forEach((item) => {
        mdLib.use(
            markdown_it_container,
            item.typeID,
            makeOptions({ md: mdLib, ...item }),
        );
    });
}
