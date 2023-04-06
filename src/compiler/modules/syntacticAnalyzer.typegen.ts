// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
    "@@xstate/typegen": true;
    internalEvents: {
        "xstate.init": { type: "xstate.init" };
    };
    invokeSrcNameMap: {};
    missingImplementations: {
        actions: never;
        delays: never;
        guards: never;
        services: never;
    };
    eventsCausingActions: {};
    eventsCausingDelays: {};
    eventsCausingGuards: {};
    eventsCausingServices: {};
    matchesStates:
        | "declaration"
        | "declaration.declareStatement"
        | "declaration.end"
        | "declaration.expectIdentifier"
        | "declaration.expectValue"
        | "declaration.syntaxError"
        | "start"
        | {
              declaration?:
                  | "declareStatement"
                  | "end"
                  | "expectIdentifier"
                  | "expectValue"
                  | "syntaxError";
          };
    tags: never;
}
