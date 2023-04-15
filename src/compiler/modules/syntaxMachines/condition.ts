import { assign, createMachine, sendParent } from "xstate";
import { respond } from "xstate/lib/actions";
import { CodeGenEvent,  generateCondition } from "../jsCodegen";
import { SymbolTable } from "../syntacticAnalyzer";
import { TokenEvent, raiseSyntaxError } from "./programMachine";

export type FinalStateEvent = {
    type: string;
    isFinal: boolean;
};

type ConditionContext = {
    tokens: TokenEvent[];
    symbolTable?: SymbolTable;
};

const ConditionMachine = createMachine(
    {
        predictableActionArguments: true,
        id: "condition",
        initial: "conditionStart",
        schema: {
            context: {} as ConditionContext,
            events: {} as TokenEvent | CodeGenEvent,
        },
        context: {
            tokens: [],
        },
        states: {
            conditionStart: {
                on: {
                    "*": [
                        {
                            target: "MUX",
                            cond: (_, event: TokenEvent) =>
                                event.tokenType === "identifier" ||
                                event.tokenType === "stringLiteral" ||
                                event.tokenType === "numberLiteral" ||
                                event.tokenType === "booleanLiteral",
                            actions: "addToken",
                        },
                        {
                            actions: (_, event: TokenEvent) =>
                                raiseSyntaxError(
                                    _,
                                    event,
                                    `Se esperaba un identificador o un valor literal`
                                ),
                        },
                    ],
                },
            },
            MUX: {
                entry: sendParent({ type: "CONDITION_FINAL", isFinal: true }),
                exit: sendParent({ type: "CONDITION_FINAL", isFinal: false }),
                on: {
                    no: {
                        target: "expectCmpOp",
                        actions: "addToken",
                    },
                    GENERATE_CODE: {
                        actions: [
                            (c) => {
                                if (c.symbolTable === undefined)
                                    throw new Error(
                                        "Symbol table was not passed to program machine."
                                    );
                            },

                            respond(
                                (c: ConditionContext): CodeGenEvent => ({
                                    type: "CODE_GENERATED",
                                    result: generateCondition(
                                        c.symbolTable as SymbolTable,
                                        c.tokens
                                    ),
                                })
                            ),
                        ],
                    },
                    "*": [
                        {
                            target: "conditionStart",
                            cond: (_, event: TokenEvent) =>
                                event.tokenType === "comparisonOperator" ||
                                event.tokenType === "logicalOperator",
                            actions: "addToken",
                        },
                        {
                            actions: (_, event: TokenEvent) =>
                                raiseSyntaxError(
                                    _,
                                    event,
                                    `Se esperaba un operador de comparación o negación`
                                ),
                        },
                    ],
                },
            },
            expectCmpOp: {
                on: {
                    "*": [
                        {
                            target: "conditionStart",
                            cond: (_, event: TokenEvent) =>
                                event.tokenType === "comparisonOperator",
                            actions: "addToken",
                        },
                        {
                            actions: (_, event: TokenEvent) =>
                                raiseSyntaxError(
                                    _,
                                    event,
                                    `Se esperaba un operador de comparación`
                                ),
                        },
                    ],
                },
            },
        },
    },
    {
        actions: {
            addToken: assign({
                tokens: (c: ConditionContext, e) => [
                    ...c.tokens,
                    e as TokenEvent,
                ],
            }),
        },
    }
);

export default ConditionMachine;
