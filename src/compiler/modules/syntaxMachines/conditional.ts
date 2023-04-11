import { assign, createMachine, send, sendTo } from "xstate";
import { forwardTo } from "xstate/lib/actions";
import ConditionMachine, { ConditionFinalEvent } from "./condition";
import ProgramMachine, { TokenEvent, raiseSyntaxError } from "./programMachine";

const ConditionalMachine = createMachine({
    predictableActionArguments: true,
    id: "conditional",
    initial: "expectCondition",
    schema: {
        context: { conditionInFinalState: false },
        events: {} as TokenEvent | ConditionFinalEvent,
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
                        conditionInFinalState: (
                            _,
                            event: ConditionFinalEvent
                        ) => event.data,
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
                // forward anything that isn't entonces to condition machine
                "*": {
                    actions: forwardTo("conditionMachine"),
                },
            },
        },
        expectInstructions: {
            invoke: {
                src: () => ProgramMachine,
                autoForward: true,
                data: {
                    isChild: true,
                },
                onDone: "expectInstrOrFin",
            },
        },
        expectInstrOrFin: {
            on: {
                fin: {
                    target: "done",
                },
                "\n": {},
                "*": [
                    {
                        cond: (_, event) =>
                            (event as TokenEvent).tokenType === "eof",
                        actions: (c, e: TokenEvent) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Palabra faltante "fin" para terminar el ciclo`,
                                false
                            ),
                    },
                    {
                        target: "expectInstructions",
                        actions: send((_: any, event: TokenEvent) => ({
                            ...event,
                        })),
                    },
                ],
            },
        },
        done: {
            type: "final",
        },
    },
});

export default ConditionalMachine;
