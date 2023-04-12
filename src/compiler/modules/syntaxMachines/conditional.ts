import {
    assign,
    createMachine,
    send,
    sendParent,
    sendTo,
    forwardTo,
} from "xstate";
import { stop } from "xstate/lib/actions";
import ConditionMachine, { FinalStateEvent } from "./condition";
import ProgramMachine, { TokenEvent, raiseSyntaxError } from "./programMachine";

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
                        cond: (context, _) => {
                            const cond = context.conditionInFinalState;

                            console.log("got entonces, going to exInst?", cond);
                            return cond;
                        }
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
                    actions: [
                        (c, e) =>
                            console.log("forwarding to condtion machine", c, e),
                        forwardTo("conditionMachine"),
                    ],
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
                autoForward: true
            },

            on: {
                fin: {
                    // When we get a "fin", if it comes from the child machine
                    // it means we have an empty conditional statement
                    // If it's not from the child, it a new token, forward it
                    // to child
                    cond: (_, e) => (e as TokenEvent).forwardedByChild,
                    target: "expectElse",
                    actions: [
                        (_, e) => console.log("got fin"),
                        stop("programSubMachine"),
                    ]
                },
                "*": [
                    {

                    },
                    // Forward event to self if it was forwarded by child
                    {
                        actions: [send((_, e) => e)],
                        cond: (_, e) => (e as TokenEvent).forwardedByChild,
                    },
                    // Forward anything else to the child machine
                    // {
                    //     actions: sendTo("programSubMachine", (_, e) => e),
                    // },
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
                        actions: [
                            send((_: any, event: TokenEvent) => event),
                            (c, e) => console.log("forwarding to exIns", e),
                        ],
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
                        actions: [
                            sendParent(
                                (_, e: TokenEvent): TokenEvent => ({
                                    ...e,
                                    forwardedByChild: true,
                                })
                            ),
                            (c, e) =>
                                console.log(
                                    "exiting and forwarding to parent",
                                    e,
                                    c
                                ),
                        ],

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
