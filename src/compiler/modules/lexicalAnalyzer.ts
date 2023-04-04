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
];

const languageSymbols = [":"];

const identifierPattern = "[A-Za-z_][\\w_]*";
const whitespacePattern = "\\n+";

const comparisonOperators = ["menor que", "mayor que", "igual que"];

const logicalExpressions = ["y", "o"];

const arithmeticOperators = ["mas", "menos", "entre", "por", "modulo", "[()]"];

const literalPatterns = ["\\d+", '".*"', "'.*'"];

export class LexicalError extends Error {
    row: number;
    col: number;
    constructor(message: string, row: number, col: number) {
        super();
        this.message = message;
        this.row = row;
        this.col = col;
    }
}

export default class LexicalAnalyzer {
    #lexerRegex: string = "";
    #inputString: string = "";
    #row: number = 0;
    #col: number = 0;

    constructor(inputString: string) {
        this.#buildRegex();
        this.#inputString = inputString;
    }

    #buildRegex() {
        this.#lexerRegex += this.#addPatterns(literalPatterns);
        this.#lexerRegex += this.#addPatterns(comparisonOperators);
        this.#lexerRegex += this.#addPatterns(reservedKeywords);
        this.#lexerRegex += this.#addPatterns(arithmeticOperators);
        this.#lexerRegex += this.#addPatterns(languageSymbols);
        this.#lexerRegex += this.#addPatterns([
            indentationChar,
            whitespacePattern,
            identifierPattern,
        ]);
        this.#lexerRegex += this.#addPatterns(logicalExpressions, true);
    }

    #addPatterns(patterns: string[], last: boolean = false): string {
        const lastChar = last ? "" : "|";
        return patterns.map((w) => "(?:" + w + ")").join("|") + lastChar;
    }

    /**
     *
     * @returns Next token in the program input or null if end of program
     * @throws {LexicalError}
     */
    getToken(): string | null {
        if (this.#inputString.length === 0) return null;

        const match = this.#inputString.match(this.#lexerRegex);

        if (match == null || match.index !== 0) {
            console.log(match);
            throw new LexicalError(
                "Valid token not found",
                this.#row,
                this.#col
            );
        }

        const token = match[0];
        this.#inputString = this.#inputString.substring(token.length);

        // Ammount of chars to remove from the beginning
        // Length of token + following spaces
        const columnDelta = token.length + this.removeLeadingSpace();

        if (token == "\n") {
            this.#row++;
            this.#col = 0;
        } else {
            this.#col += columnDelta;
        }

        // console.log(this.#inputString);
        return token;
    }

    /**
     * @summary Removes leading spaces from the input string
     * @returns {number} ammount of spaces removed
     */
    removeLeadingSpace(): number {
        let p = / */;

        const match = this.#inputString.match(p);
        if (match === null || match.index !== 0) return 0;

        this.#inputString = this.#inputString.substring(match[0].length);
        return match[0].length;
    }
}
