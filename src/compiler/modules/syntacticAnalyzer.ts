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

        let currentState: string = ("<MachineState> " + ss.value) as string;

        currentState += " > " + this.#getStateValues(children).join(" > ");
        console.log(`%c${currentState}`, "color: #27ae60");
    }

    /**
        * @summary for debug purposes only. 
        * Recursively gets the state of the children of all machines
    */
    #getStateValues(children: any): string[] {
        const values: string[] = [];

        for (const key in children) {
            const childState = children[key]._state;
            values.push(childState.value);

            const childValues = this.#getStateValues(childState.children);
            values.push(...childValues);
        }
        return values;
    }
}
