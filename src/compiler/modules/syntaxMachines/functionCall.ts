import { createMachine } from "xstate";
import { TokenEvent, raiseSyntaxError } from "./programMachine";

type FunctionCallContext = {
    identifier: string;
};

const FunctionCallMachine = createMachine({
    predictableActionArguments: true,
    initial: "expectArgOrParen",
    schema: {
        context: { identifier: "" } as FunctionCallContext,
        events: {} as TokenEvent,
    },
    context: {
        identifier: "",
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
        },
    },
});

export default FunctionCallMachine;
