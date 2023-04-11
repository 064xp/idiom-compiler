import { createMachine, send } from "xstate";
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
                    {
                        target: "instructions",
                        actions: send((_context, event) => ({
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

export default LoopMachine;
