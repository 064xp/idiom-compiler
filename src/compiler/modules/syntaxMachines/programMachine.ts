import { BaseActionObject, StateNodeConfig, createMachine } from "xstate";
import { Token, TokenType } from "../lexicalAnalyzer";
import { SyntaxError } from "../syntacticAnalyzer";
import DeclarationMachine from "./declaration";

export type TokenEvent = {
    type: string;
    tokenType: TokenType;
    row: number;
    col: number;
};

export type SyntaxContext = {};

export type SyntaxMachine = StateNodeConfig<
    SyntaxContext,
    any,
    TokenEvent,
    BaseActionObject
>;

export const raiseSyntaxError = (
    context: SyntaxContext,
    event: TokenEvent,
    message: string
) => {
    throw new SyntaxError(message, event.row, event.col);
};

const ProgramMachine = createMachine({
    predictableActionArguments: true,
    id: "program",
    initial: "start",
    schema: {
        context: {},
        events: {} as TokenEvent,
    },
    states: {
        start: {
            on: {
                declara: "declaration",
                "*": [
                    {
                        target: "done",
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "eof",
                    },
                    {
                        actions: (c: SyntaxContext, e: TokenEvent) =>
                            raiseSyntaxError(
                                c,
                                e,
                                "Se esperaba un identificador o una literal"
                            ),
                    },
                ],
            },
        },
        declaration: {
            invoke: {
                src: DeclarationMachine,
                autoForward: true,
                onDone: "start",
            },
        },
        done: {
            type: "final",
        },
    },
});

export default ProgramMachine;
