import { editor, languages } from "monaco-editor/esm/vs/editor/editor.api";
import { languageTokens } from "../compiler/modules/lexicalAnalyzer";

export const options: editor.IStandaloneEditorConstructionOptions = {
    minimap: {
        enabled: false,
    },
    fontSize: 16,
    padding: {
        top: 12,
    },
    cursorSmoothCaretAnimation: true,
    cursorBlinking: "phase",
};

/**
 * @summary Prepares tokens for monaco tokenizer.
 * Takes a list of tokens separates them if they have spaces.
 * Removes word boundary character "\b""
 * for example: ["menor que"] => ["menor", "que"]
 */
const prepareTokens = (
    tokens: string[],
    removeWordBoundary: boolean = true
): string[] => {
    let outTokens: string[] = [];

    tokens.forEach((t) => {
        let separatedToken = t.split(" ");

        if (removeWordBoundary) {
            for (let i = 0; i < separatedToken.length; i++) {
                separatedToken[i] = separatedToken[i].split("\\b").join("");
            }
        }

        outTokens = outTokens.concat(separatedToken);
    });
    return outTokens;
};

export const tokensProvider = <languages.IMonarchLanguage>{
    defaultToken: "",

    keywords: prepareTokens(languageTokens.reservedKeywords),
    builtInFunctions: prepareTokens(languageTokens.builtinFunctions),

    operators: prepareTokens(languageTokens.comparisonOperators),

    arithmeticOperators: prepareTokens(languageTokens.arithmeticOperators),

    logicalOperators: prepareTokens(languageTokens.logicalOperators),

    brackets: [
        { open: "{", close: "}", token: "delimiter.curly" },
        { open: "[", close: "]", token: "delimiter.bracket" },
        { open: "(", close: ")", token: "delimiter.parenthesis" },
    ],

    tokenizer: {
        root: [
            { include: "@whitespace" },
            { include: "@numbers" },
            { include: "@strings" },

            [/[,:;]/, "delimiter"],
            [/[{}\[\]()]/, "@brackets"],

            // [/@[a-zA-Z_]\w*/, "tag"],
            [
                /[a-zA-Z_]\w*/,
                {
                    cases: {
                        "@keywords": "keyword",
                        "@operators": "operator",
                        "@arithmeticOperators": "arithmeticOperator",
                        "@logicalOperators": "logicalOperators",
                        "@builtInFunctions": "builtInFunctions",
                        "@default": "identifier",
                    },
                },
            ],
        ],

        // Deal with white space, including single and multi-line comments
        whitespace: [
            [/\s+/, "white"],
            [/(^#.*$)/, "comment"],
            [/'''/, "string", "@endDocString"],
            [/"""/, "string", "@endDblDocString"],
        ],
        endDocString: [
            [/[^']+/, "string"],
            [/\\'/, "string"],
            [/'''/, "string", "@popall"],
            [/'/, "string"],
        ],
        endDblDocString: [
            [/[^"]+/, "string"],
            [/\\"/, "string"],
            [/"""/, "string", "@popall"],
            [/"/, "string"],
        ],

        // Recognize hex, negatives, decimals, imaginaries, longs, and scientific notation
        numbers: [
            [/-?0x([abcdef]|[ABCDEF]|\d)+[lL]?/, "number.hex"],
            [/-?(\d*\.)?\d+([eE][+\-]?\d+)?[jJ]?[lL]?/, "number"],
        ],

        // Recognize strings, including those broken across lines with \ (but not without)
        strings: [
            [/'$/, "string.escape", "@popall"],
            [/'/, "string.escape", "@stringBody"],
            [/"$/, "string.escape", "@popall"],
            [/"/, "string.escape", "@dblStringBody"],
        ],
        stringBody: [
            [/[^\\']+$/, "string", "@popall"],
            [/[^\\']+/, "string"],
            [/\\./, "string"],
            [/'/, "string.escape", "@popall"],
            [/\\$/, "string"],
        ],
        dblStringBody: [
            [/[^\\"]+$/, "string", "@popall"],
            [/[^\\"]+/, "string"],
            [/\\./, "string"],
            [/"/, "string.escape", "@popall"],
            [/\\$/, "string"],
        ],
    },
};

export const conf: languages.LanguageConfiguration = {
    comments: {
        lineComment: "//",
        blockComment: ["/*", "*/"],
    },
    brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
    ],
    autoClosingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"', notIn: ["string"] },
        { open: "'", close: "'", notIn: ["string", "comment"] },
        { open: "entonces", close: "fin" },
        { open: "veces", close: "fin" },
    ],
    surroundingPairs: [
        { open: "{", close: "}" },
        { open: "[", close: "]" },
        { open: "(", close: ")" },
        { open: '"', close: '"' },
        { open: "'", close: "'" },
    ],
    onEnterRules: [
        {
            beforeText: new RegExp("^\\s*(?:repite|si).*?[(?:entonces)|(?:veces)]\\s*$"),
            action: { indentAction: languages.IndentAction.IndentOutdent },
        },
    ],
    folding: {
        offSide: true,
        markers: {
            start: new RegExp("veces\\b|entonces\\b"),
            end: new RegExp("fin\\b"),
        },
    },
};

export const theme: editor.IStandaloneThemeData = {
    base: "vs-dark",
    inherit: true,
    rules: [
        { token: "operator", foreground: "f5425d" },
        { token: "arithmeticOperator", foreground: "9b59b6" },
        { token: "builtInFunctions", foreground: "2ecc71" },
        { token: "logicalOperators", foreground: "e67e22" },
    ],
    colors: {
        "editor.foreground": "#ffffff",
    },
};
