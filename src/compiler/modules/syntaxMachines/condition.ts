import { createMachine, sendParent } from "xstate";
import { TokenEvent, raiseSyntaxError } from "./programMachine";

export type ConditionFinalEvent = {
    type: string;
    data: boolean;
}

const ConditionMachine = createMachine({
    predictableActionArguments: true,
    id: "condition",
    initial: "conditionStart",
    schema: {
        context: {},
        events: {} as TokenEvent,
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
            entry: sendParent({ type: "CONDITION_FINAL", data: true }),
            exit: sendParent({ type: "CONDITION_FINAL", data: false }),
            on: {
                no: "expectCmpOp",
                "*": [
                    {
                        target: "conditionStart",
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "comparisonOperator" ||
                            event.tokenType === "logicalOperator",
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
});

export default ConditionMachine;
