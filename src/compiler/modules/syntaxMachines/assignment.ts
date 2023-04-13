import { createMachine, send } from "xstate";
import { TokenEvent, raiseSyntaxError } from "./programMachine";

type AssignmentContext = {
    identifier: string;
};

const AssignmentMachine = createMachine({
    predictableActionArguments: true,
    id: "assignment",
    initial: "expectValue",
    schema: {
        context: { identifier: "" } as AssignmentContext,
        events: {} as TokenEvent,
    },
    context: {
        identifier: "",
    },
    states: {
        expectValue: {
            on: {
                "*": [
                    {
                        // if id or literal
                        target: "expectOperator",
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
        expectOperator: {
            on: {
                "*": [
                    // if arithmetic operator
                    {
                        target: "expectValue",
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "arithmeticOperator",
                    },
                    // if eof
                    {
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "eof",
                        target: "done",
                    },
                    {
                        actions: (c, e: TokenEvent) =>
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

export default AssignmentMachine;
