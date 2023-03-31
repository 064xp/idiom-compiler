const indentationChar = "\\t";

// Must go from most specific to less specific
export const reservedKeywords = [
    // Conditional
    "si no pero",
    "si no",
    "si",
    "entonces",
    // Declaration, assignment
    "declara",
    "asigna",
    // loops
    "repite",
    "veces",
    // Logical Expressions
    "y",
    "o",
];

const identifierPattern = "[A-Za-z_][w_]*";
const whitespacePattern = "\\n+";

const comparisonOperators = ["menor que", "mayor que", "igual que"];

const arithmeticOperators = ["mas", "menos", "entre", "por", "modulo", "[()]"];

const literalPatterns = ["\\d+", '".*"', "'.*'"];

export default class LexicalAnalyzer {
    #lexerRegex = "";
    #inputString = "";

    constructor(inputString: string) {
        this.#buildRegex();
        this.#inputString = inputString;
    }

    #buildRegex() {
        this.#lexerRegex += this.#addPatterns(literalPatterns);
        this.#lexerRegex += this.#addPatterns(comparisonOperators);
        this.#lexerRegex += this.#addPatterns(reservedKeywords);
        this.#lexerRegex += this.#addPatterns(arithmeticOperators);
        this.#lexerRegex += this.#addPatterns(
            [indentationChar, whitespacePattern, identifierPattern],
            true
        );

        console.log(this.#lexerRegex);
    }

    #addPatterns(patterns: string[], last: boolean = false): string {
        const lastChar = last ? "" : "|";
        return patterns.map((w) => "(?:" + w + ")").join("|") + lastChar;
    }
}
