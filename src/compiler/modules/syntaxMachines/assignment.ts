import { assign, createMachine } from "xstate";
import { generateAssignment } from "../jsCodegen";
import { SymbolTable } from "../syntacticAnalyzer";
import { TokenEvent, raiseSyntaxError } from "./programMachine";

type AssignmentContext = {
    identifier?: TokenEvent;
    tokens: TokenEvent[];
    symbolTable?: SymbolTable;
};

const AssignmentMachine = createMachine({
    predictableActionArguments: true,
    id: "assignment",
    initial: "expectValue",
    schema: {
        context: {} as AssignmentContext,
        events: {} as TokenEvent,
    },
    context: {
        tokens: [],
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
                        actions: assign({
                            tokens: (c, e) => [...c.tokens, e],
                        }),
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
                        actions: assign({
                            tokens: (c, e) => [...c.tokens, e],
                        }),
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
            data: (c, _) => {
                if (c.symbolTable === undefined)
                    throw new Error(
                        "Symbol table was not passed to assignment machine."
                    );

                return {
                    result: generateAssignment(
                        c.symbolTable,
                        c.tokens,
                        c.identifier as TokenEvent
                    ),
                };
            },
        },
    },
});

export default AssignmentMachine;
