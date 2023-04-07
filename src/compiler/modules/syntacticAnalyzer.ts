import { interpret } from "xstate";
import { Token } from "./lexicalAnalyzer";
import ProgramMachine from "./syntaxMachines";

export class SyntaxError extends Error {
    row: number;
    col: number;
    constructor(message: string, row: number, col: number) {
        super();
        this.message = message;
        this.row = row;
        this.col = col;
    }
}

export default class SyntaxAnalyzer {
    #service;
    #lastToken: Token | undefined;

    constructor() {
        this.#service = interpret(ProgramMachine);
        this.#service.start();
        console.log("init", this.#service.state);
    }

    parseToken(token: Token | null) {
        if (token === null) {
            if (!this.#service.getSnapshot().done) {
                throw new SyntaxError(
                    "Incomplete statement",
                    this.#lastToken?.row as number,
                    this.#lastToken?.col as number
                );
            }
            return;
        }

        this.#lastToken = token;

        const obj = {
            type: token.token,
            tokenType: token.type,
            row: token.row,
            col: token.col,
        };

        this.#service.send(obj);
        console.log(this.#service.getSnapshot());
        return;
    }
}
