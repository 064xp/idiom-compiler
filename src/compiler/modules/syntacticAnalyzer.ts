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

    constructor() {
        this.#service = interpret(ProgramMachine);
        this.#service.start();
        console.log("init", this.#service.state);
    }

    parseToken(token: Token) {
        const obj = {
            type: token.token,
            tokenType: token.type,
            row: token.row,
            col: token.col,
        };

        this.#service.send(obj);
        console.log(this.#service.state);
    }
}
