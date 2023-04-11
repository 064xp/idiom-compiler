import { createMachine } from "xstate";
import { TokenEvent, raiseSyntaxError, SyntaxContext } from "./programMachine";

const declarationMachine = createMachine({
    predictableActionArguments: true,
    id: "declaration",
    initial: "expectIdentifier",
    schema: {
        context: {},
        events: {} as TokenEvent,
    },
    states: {
        expectIdentifier: {
            on: {
                "*": [
                    {
                        target: "expectAsigna",
                        cond: (_: SyntaxContext, event: TokenEvent) =>
                            event.tokenType === "identifier"
                    },
                    {
                        actions: (c: SyntaxContext, e: TokenEvent) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Se esperaba un identificador`
                            ),
                    },
                ],
            },
        },
        expectAsigna: {
            on: {
                asigna: "expectValue",
                "*": [
                    {
                        target: 'done',
                        cond: (_: SyntaxContext, event: TokenEvent) =>
                            event.tokenType === "newline" || event.tokenType === "eof"
                    },
                    {
                        actions: (c: SyntaxContext, e: TokenEvent) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Se esperaba un "asigna"`
                            ),
                    },
                ],
            },
        },
        expectValue: {
            on: [
                {
                    // if id or literal
                    event: "*",
                    target: "expectOperator",
                    cond: (_: {}, event: TokenEvent) =>
                        event.tokenType === "identifier" ||
                        event.tokenType === "stringLiteral" ||
                        event.tokenType === "numberLiteral",
                },
                {
                    event: "*",
                    actions: (c: SyntaxContext, e: TokenEvent) =>
                        raiseSyntaxError(
                            c,
                            e,
                            `Se esperaba un identificador o una literal`
                        ),
                },
            ],
        },
        expectOperator: {
            on: {
                "*": [
                    // if arithmetic operator
                    {
                        target: "expectValue",
                        cond: (_: SyntaxContext, event: TokenEvent) =>
                            event.tokenType === "arithmeticOperator",
                    },
                    // if eof
                    {
                        cond: (_: SyntaxContext, event: TokenEvent) =>
                            event.tokenType === "eof",
                        target: "done",
                    },
                    {
                        actions: (c: SyntaxContext, e: TokenEvent) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Se esperaba un operador aritmético o fin de instrucción`
                            ),
                    },
                ],
                "\n": {
                    target: "done",
                },
            },
        },
        done: {
            type: "final",
        },
    },
});

export default declarationMachine;
