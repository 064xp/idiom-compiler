import { interpret } from "xstate";
import { Token, TokenType } from "./lexicalAnalyzer";
import ProgramMachine, {
    ProgramMachineContext,
    TokenEvent,
} from "./syntaxMachines/programMachine";
import * as stdLib from "../standardLibrary";

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

export type SymbolTable = Map<string, { type: TokenType; scopeID: string }>;

export default class SyntaxAnalyzer {
    #service;
    #lastToken: Token | undefined;
    #symbolTable: SymbolTable = new Map<string, { type: TokenType }>();

    constructor() {
        this.#initializeSymbolTable();
        //@ts-ignore
        this.#service = interpret(
            ProgramMachine.withContext({
                ...ProgramMachine.initialState.context,
                symbolTable: this.#symbolTable,
            })
        );
        this.#service.start();
    }

    #initializeSymbolTable() {
        Object.keys(stdLib).forEach((key) => {
            if (typeof stdLib[key as keyof typeof stdLib] === "function")
                this.#symbolTable.set(key, {
                    type: "builtinFunction",
                    scopeID: "global",
                });
        });
    }

    parseToken(token: Token): string | null {
        this.#lastToken = token;
        const obj: TokenEvent = {
            type: token.token,
            tokenType: token.type,
            row: token.row,
            col: token.col,
            forwardedByChild: false,
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

            const generatedCode = (ss.context as ProgramMachineContext)
                .generatedString as string;
            console.log("Analisis sintáctico exitoso!");

            console.log(generatedCode);
            console.log(this.#symbolTable);
            return generatedCode;
        }

        this.#lastToken = token;
        return null;
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
