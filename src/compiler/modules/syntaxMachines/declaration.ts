import { assign, createMachine } from "xstate";
import { TokenEvent, raiseSyntaxError, SyntaxContext } from "./programMachine";
import AssignmentMachine from "./assignment";

type DeclarationContext = {
    identifier: string;
};

const declarationMachine = createMachine({
    predictableActionArguments: true,
    id: "declaration",
    initial: "expectIdentifier",
    schema: {
        context: { identifier: "" } as DeclarationContext,
        events: {} as TokenEvent,
    },
    context: {
        identifier: "",
    },
    states: {
        expectIdentifier: {
            on: {
                "*": [
                    {
                        target: "expectAsigna",
                        cond: (_: SyntaxContext, event: TokenEvent) =>
                            event.tokenType === "identifier",
                        actions: assign({
                            identifier: (_, e: TokenEvent) => e.type,
                        }),
                    },
                    {
                        actions: (c: SyntaxContext, e: TokenEvent) =>
                            raiseSyntaxError(
                                c,
                                e,
                                `Se esperaba un identificador`
                            ),
                    },
                ],
            },
        },
        expectAsigna: {
            on: {
                asigna: "invokeAssignment",
                "*": [
                    {
                        target: "done",
                        cond: (_: SyntaxContext, event: TokenEvent) =>
                            event.tokenType === "newline" ||
                            event.tokenType === "eof",
                    },
                    {
                        actions: (c: SyntaxContext, e: TokenEvent) =>
                            raiseSyntaxError(c, e, `Se esperaba un "asigna"`),
                    },
                ],
            },
        },
        invokeAssignment: {
            invoke: {
                id: "assignmentMachine",
                src: AssignmentMachine,
                autoForward: true,
                data: {
                    identifier: (c: DeclarationContext) => c.identifier,
                },
                onDone: {
                    target: "done",
                },
            },
        },
        done: {
            type: "final",
        },
    },
});

export default declarationMachine;
