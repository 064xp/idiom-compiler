import { createMachine, send, sendTo } from "xstate";
import { stop } from "xstate/lib/actions";
import ProgramMachine, { TokenEvent, raiseSyntaxError } from "./programMachine";

const LoopMachine = createMachine({
    predictableActionArguments: true,
    id: "loop",
    initial: "expectNum",
    schema: {
        context: {},
        events: {} as TokenEvent,
    },
    states: {
        expectNum: {
            on: {
                "*": {
                    target: "expectVeces",
                    cond: (_, event: TokenEvent) =>
                        event.tokenType === "numberLiteral" ||
                        event.tokenType === "identifier",
                },
            },
        },
        expectVeces: {
            on: {
                veces: {
                    target: "instructions",
                },
            },
        },
        instructions: {
            entry: () => console.log("entering loop instructions"),
            invoke: {
                id: "programSubMachine",
                src: () => ProgramMachine,
                autoForward: true,
                data: {
                    isChild: true,
                },
                onDone: "expectInstrOrFin",
            },
            on: {
                "*": [
                    {
                        // In case of empty loop
                        // actions: send((_, e) => e),
                        cond: (_, e) =>
                            (e as TokenEvent).forwardedByChild &&
                            (e as TokenEvent).type === "fin",
                        target: "done",
                        actions: [
                            stop("programSubmachine"),
                            () => console.log("got fin from child"),
                        ],
                    },
                    {
                        cond: (_, e) => e.forwardedByChild,
                        actions: [
                            (c, e) =>
                                console.log(
                                    "loop got and is forwarding to self",
                                    e
                                ),
                            send((_, e) => ({...e, forwardedByChild: false})),
                        ],
                    },
                ],
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
                        cond: (_, event: TokenEvent) =>
                            event.tokenType === "eof",
                        actions: (c, e) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Palabra faltante "fin" para terminar el ciclo`,
                                false
                            ),
                    },
                    // If it's anything other than "fin", "\n" or an eof
                    // forward the event to expectInstructions state
                    {
                        target: "instructions",
                        actions: [
                            send((_: any, event: TokenEvent) => event),
                            (c, e) =>
                                console.log("forwarding to instructions", e),
                        ],
                    },
                ],
            },
        },
        done: {
            type: "final",
        },
    },
});

export default LoopMachine;
