import { BaseActionObject, StateNodeConfig, createMachine } from "xstate";
import { TokenType } from "./lexicalAnalyzer";
import { SyntaxError } from "./syntacticAnalyzer";

type TokenEvent = {
    type: string;
    tokenType: TokenType;
    row: number;
    col: number;
};

type SyntaxContext = {};

type SyntaxMachine = StateNodeConfig<
    SyntaxContext,
    any,
    TokenEvent,
    BaseActionObject
>;

const raiseSyntaxError = (
    context: SyntaxContext,
    event: TokenEvent,
    message: string
) => {
    throw new SyntaxError(message, event.row, event.col);
};

const declarationMachine: SyntaxMachine = {
    id: "declaration",
    initial: "expectIdentifier",
    states: {
        expectIdentifier: {
            on: [
                {
                    event: "*",
                    target: "expectAsigna",
                    cond: (context: {}, event: TokenEvent) => {
                        console.log(event);
                        return event.tokenType === "identifier";
                    },
                },
                {
                    event: "*",
                    actions: (c, e) =>
                        raiseSyntaxError(
                            c,
                            e,
                            `Se esperaba un identificador, se obtuvo ${e.type}`
                        ),
                },
            ],
        },
        expectAsigna: {
            on: [
                {
                    event: "asigna",
                    target: "expectValue",
                },
                {
                    event: "*",
                    actions: (c, e) =>
                        raiseSyntaxError(
                            c,
                            e,
                            `Se esperaba un 'asigna', se obtuvo ${e.type}`
                        ),
                },
            ],
        },
        expectValue: {
            on: [
                {
                    // if id or literal
                    event: "*",
                    target: "expectOperator",
                    cond: (context: {}, event: TokenEvent) =>
                        event.tokenType === "identifier" ||
                        event.tokenType === "literal",
                },
                {
                    event: "*",
                    actions: (c, e) =>
                        raiseSyntaxError(
                            c,
                            e,
                            `Se esperaba un identificador o una literal, se obtuvo ${e.type}`
                        ),
                },
            ],
        },
        expectOperator: {
            on: [
                {
                    // if arithmetic operator
                    event: "*",
                    target: "expectValue",
                    cond: (context: {}, event: TokenEvent) =>
                        event.tokenType === "arithmeticOperator",
                },
                {
                    event: "\n",
                    target: "done",
                },
            ],
        },
        done: {
            type: "final",
        },
    },
};

const conditionalMachine: SyntaxMachine = {};

const ProgramMachine = createMachine({
    id: "program",
    tsTypes: {} as import("./syntaxMachines.typegen").Typegen0,
    initial: "start",
    schema: {
        context: {},
        events: {} as TokenEvent,
    },
    states: {
        start: {
            on: [
                {
                    event: "declara",
                    target: "declaration",
                },
                {
                    event: "*",
                    actions: (c: SyntaxContext, e: TokenEvent) =>
                        raiseSyntaxError(
                            c,
                            e,
                            "Se esperaba un identificador o una literal"
                        ),
                },
            ],
        },
        declaration: {
            ...declarationMachine,
            onDone: "start",
        },
    },
});

export default ProgramMachine;
