import { assign, createMachine, send } from "xstate";
import { generateFunctionCall } from "../jsCodegen";
import { SymbolTable } from "../syntacticAnalyzer";
import { TokenEvent, raiseSyntaxError } from "./programMachine";

type FunctionCallContext = {
    identifier?: TokenEvent;
    parameters: TokenEvent[];
    symbolTable?: SymbolTable;
};

const FunctionCallMachine = createMachine(
    {
        predictableActionArguments: true,
        initial: "expectArgOrParen",
        schema: {
            context: {} as FunctionCallContext,
            events: {} as TokenEvent,
        },
        context: {
            parameters: [],
        },
        states: {
            expectArgOrParen: {
                on: {
                    ")": {
                        target: "done",
                    },
                    "*": [
                        {
                            // if id or literal
                            target: "expectCommaOrParen",
                            cond: (_: {}, event: TokenEvent) =>
                                event.tokenType === "identifier" ||
                                event.tokenType === "stringLiteral" ||
                                event.tokenType === "numberLiteral" ||
                                event.tokenType === "booleanLiteral",
                            actions: "pushParameter",
                        },
                        {
                            actions: (c, e) =>
                                raiseSyntaxError(
                                    c,
                                    e,
                                    `Se esperaba un identificador o una literal`
                                ),
                        },
                    ],
                },
            },
            expectCommaOrParen: {
                on: {
                    ",": {
                        target: "expectArg",
                    },
                    ")": {
                        target: "done",
                    },
                    "*": {
                        actions: (c, e) =>
                            raiseSyntaxError(c, e, `Se esperaba "," o ")"`),
                    },
                },
            },
            expectArg: {
                on: {
                    "*": [
                        {
                            // if id or literal
                            target: "expectCommaOrParen",
                            cond: (_: {}, event: TokenEvent) =>
                                event.tokenType === "identifier" ||
                                event.tokenType === "stringLiteral" ||
                                event.tokenType === "numberLiteral" ||
                                event.tokenType === "booleanLiteral",
                            actions: "pushParameter",
                        },
                        {
                            actions: (c, e) =>
                                raiseSyntaxError(
                                    c,
                                    e,
                                    `Se esperaba un identificador o una literal`
                                ),
                        },
                    ],
                },
            },
            done: {
                type: "final",
                data: (c, _) => {
                    if (c.symbolTable === undefined)
                        throw new Error(
                            "Symbol table was not passed to function call machine."
                        );

                    return {
                        result: generateFunctionCall(
                            c.symbolTable,
                            c.parameters,
                            c.identifier as TokenEvent
                        ),
                    };
                },
            },
        },
    },
    {
        actions: {
            pushParameter: assign({
                parameters: (c: FunctionCallContext, e: TokenEvent) => [
                    ...c.parameters,
                    e,
                ],
            }),
        },
    }
);

export default FunctionCallMachine;
