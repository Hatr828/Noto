import { color } from "@codemirror/theme-one-dark";
import { tags as t } from "@lezer/highlight";

export const headingRules = [
    { tag: t.heading1, fontSize: "2.00em", fontWeight: "bold", color: "inherit !important" },
    { tag: t.heading2, fontSize: "1.80em", fontWeight: "bold", color: "inherit !important" },
    { tag: t.heading3, fontSize: "1.60em", fontWeight: "bold", color: "inherit !important" },
    { tag: t.heading4, fontSize: "1.40em", fontWeight: "bold", color: "inherit !important" },
    { tag: t.heading5, fontSize: "1.20em", fontWeight: "bold", color: "inherit !important" },
    { tag: t.heading6, fontSize: "1.00em", fontWeight: "bold", color: "inherit !important" }
];