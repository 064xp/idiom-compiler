import { interpret } from "xstate";
import { Token } from "./lexicalAnalyzer";
import ProgramMachine from "./syntaxMachines/programMachine";

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
        //@ts-ignore
        this.#service = interpret(ProgramMachine);
        this.#service.start();
    }

    parseToken(token: Token) {
        this.#lastToken = token;
        const obj = {
            type: token.token,
            tokenType: token.type,
            row: token.row,
            col: token.col,
        };

        this.#service.send(obj);

        // DEBUG:
        this.#printCurrentState();

        if (token.type === "eof") {
            // If EOF reached and state machine is not in a final state,
            // throw error
            const ss = this.#service.getSnapshot();
            if (!ss.done && ss.value !== "start") {
                throw new SyntaxError(
                    "Incomplete statement",
                    this.#lastToken?.row as number,
                    this.#lastToken?.col as number
                );
            }

            console.log("Analisis sintáctico exitoso!");
        }

        this.#lastToken = token;
    }

    /**
     * @summary Print current state of syntax state
     * machine, including state of children
     */
    #printCurrentState() {
        const ss = this.#service.getSnapshot();
        const children = ss.children;
        const childkeys = Object.keys(children);

        let currentState: string = ("<MachineState> " + ss.value) as string;

        childkeys.forEach((k) => {
            //@ts-ignore
            currentState += ` > ${children[k]._state.value}`;
        });

        console.log(currentState);
    }
}
