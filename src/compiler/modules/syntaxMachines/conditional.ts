import {
    assign,
    createMachine,
    send,
    sendParent,
    sendTo,
    forwardTo,
} from "xstate";
import ConditionMachine, { FinalStateEvent } from "./condition";
import ProgramMachine, { TokenEvent, raiseSyntaxError } from "./programMachine";

//@ts-ignore
const ConditionalMachine = createMachine({
    predictableActionArguments: true,
    id: "conditional",
    initial: "expectCondition",
    schema: {
        context: { conditionInFinalState: false },
        events: {} as TokenEvent | FinalStateEvent,
    },
    context: {
        conditionInFinalState: false,
    },
    states: {
        expectCondition: {
            invoke: {
                src: () => ConditionMachine,
                id: "conditionMachine",
            },

            // Update the context to know if the condition is
            // in a final state or not
            on: {
                CONDITION_FINAL: {
                    actions: assign({
                        conditionInFinalState: (_, event: FinalStateEvent) =>
                            event.isFinal,
                    }),
                },
                entonces: [
                    // Go to instructions if encounter "entonces" and
                    // condition is in final state
                    {
                        target: "expectInstructions",
                        cond: (context, _) => context.conditionInFinalState,
                    },
                    // If condition machine is not in final state
                    // forward "entonces" so that the corresponding state
                    // will throw its syntax error
                    {
                        actions: sendTo("conditionMachine", {
                            type: "entonces",
                        }),
                    },
                ],
                // forward anything that isn't "entonces" to condition machine
                "*": {
                    actions: forwardTo("conditionMachine"),
                },
            },
        },
        expectInstructions: {
            invoke: {
                id: "programSubMachine",
                src: () => ProgramMachine,
                data: {
                    isChild: true,
                },
                onDone: "expectInstrOrFin",
                autoForward: true,
            },

            on: {
                "*": [
                    // Forward event to self if it was forwarded by child
                    {
                        actions: send((_, e) => e),
                        cond: (_, e) => (e as TokenEvent).forwardedByChild,
                    },
                ],
            },
        },
        expectInstrOrFin: {
            on: {
                fin: {
                    target: "expectElse",
                },
                "\n": {},
                "*": [
                    // If eof
                    {
                        cond: (_, event) =>
                            (event as TokenEvent).tokenType === "eof",
                        actions: (c, e: TokenEvent) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Palabra faltante "fin" para terminar la sentencia condicional`,
                                false
                            ),
                    },
                    // If it's anything other than "fin", "\n" or an eof
                    // forward the event to expectInstructions state
                    {
                        target: "expectInstructions",
                        actions: send((_: any, event: TokenEvent) => event),
                    },
                ],
            },
        },
        expectElse: {
            on: {
                "si no": "expectEntonces",
                "si no pero": "expectCondition",
                "\n": {},
                "*": [
                    // If we get anything else, it means the if statement
                    // is finished (we won't have any else's after this)
                    // So we transition to done state
                    // and forward this token to the parent (because the parent
                    // must handle it, not us)
                    {
                        actions: sendParent(
                            (_, e: TokenEvent): TokenEvent => ({
                                ...e,
                                forwardedByChild: true,
                            })
                        ),

                        target: "done",
                    },
                ],
            },
        },
        expectEntonces: {
            on: {
                entonces: "expectInstructions",
                "*": {
                    actions: (c, e) =>
                        raiseSyntaxError(
                            c,
                            e as TokenEvent,
                            `Se esperaba "entonces"`
                        ),
                },
            },
        },
        done: {
            type: "final",
        },
    },
});

export default ConditionalMachine;
