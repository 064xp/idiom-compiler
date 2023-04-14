export type TokenType =
    | "reserved"
    | "identifier"
    | "comparisonOperator"
    | "newline"
    | "logicalOperator"
    | "arithmeticOperator"
    | "stringLiteral"
    | "numberLiteral"
    | "booleanLiteral"
    | "specialCharacter"
    | "eof";

type TokenPattern = {
    type: TokenType;
    regex: string;
};

export type Token = {
    type: TokenType;
    token: string;
    row: number;
    col: number;
};

// Must go from most specific to less specific
const reservedKeywords = [
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
    "fin",
    "es",
];

const builtinFunctions = ["muestra"];

const comparisonOperators = ["menor que", "mayor que", "igual que"];

const logicalOperators = ["y", "o"];

const arithmeticOperators = ["mas", "menos", "entre", "por", "modulo" ];

const booleanLiteral = ["Verdadero", "Falso"];

const specialCharacters = [",", "[()]"];

const stringLiteralPatterns = ['".*"', "'.*'"];
const numberLiteralPatterns = ["\\d+"];

export const languageTokens = {
    reservedKeywords,
    comparisonOperators,
    logicalOperators,
    arithmeticOperators,
    builtinFunctions,
};

const joinPatterns = (patterns: string[]): string =>
    patterns.map((w) => `(?:${w})`).join("|");

const tokenPatterns: TokenPattern[] = [
    { type: "reserved", regex: joinPatterns(reservedKeywords) },
    { type: "comparisonOperator", regex: joinPatterns(comparisonOperators) },
    { type: "logicalOperator", regex: joinPatterns(logicalOperators) },
    { type: "arithmeticOperator", regex: joinPatterns(arithmeticOperators) },
    { type: "specialCharacter", regex: joinPatterns(specialCharacters) },
    { type: "stringLiteral", regex: joinPatterns(stringLiteralPatterns) },
    { type: "numberLiteral", regex: joinPatterns(numberLiteralPatterns) },
    { type: "booleanLiteral", regex: joinPatterns(booleanLiteral) },
    { type: "newline", regex: "\\n" },
    { type: "identifier", regex: "[A-Za-z_][\\w_]*" },
];

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
    #inputString: string = "";
    #row: number = 1;
    #col: number = 1;

    constructor(inputString: string) {
        this.#inputString = inputString;
    }

    /**
     *
     * @returns Next token in the program input or null if end of program
     * @throws {LexicalError}
     */
    getToken(): Token {
        if (this.#inputString.length === 0)
            return {
                token: "EOF",
                type: "eof",
                col: this.#col,
                row: this.#row,
            };

        for (let { type, regex } of tokenPatterns) {
            const match = this.#inputString.match(regex);
            if (match === null || match.index !== 0) continue;

            const token = match[0];
            this.#inputString = this.#inputString.substring(token.length);

            // Ammount of chars to remove from the beginning
            // Length of token + following spaces
            const columnDelta = token.length + this.#removeLeadingSpace();

            const tokenReturn = {
                token,
                type,
                row: this.#row,
                col: this.#col,
            };

            if (token == "\n") {
                this.#row++;
                this.#col = 1;
            } else {
                this.#col += columnDelta;
            }

            return tokenReturn;
        }

        const unknownToken = this.#getFirstWord(this.#inputString);
        throw new LexicalError(
            `Token no esperado: "${unknownToken}"`,
            this.#row,
            this.#col
        );
    }

    #getFirstWord = (str: string): string => {
        str = str.trim();
        const spaceIndex = str.indexOf(" ");

        if (spaceIndex === -1) return str;

        // Otherwise, return the substring up to the first space character
        return str.slice(0, spaceIndex).trim();
    };

    /**
     * @summary Removes leading spaces from the input string
     * @returns {number} ammount of spaces removed
     */
    #removeLeadingSpace(): number {
        let p = /[\t ]*/;

        const match = this.#inputString.match(p);
        if (match === null || match.index !== 0) return 0;

        this.#inputString = this.#inputString.substring(match[0].length);
        return match[0].length;
    }
}
