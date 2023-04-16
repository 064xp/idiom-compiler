import "./App.css";
import { compileTest } from "./compiler/compiler";
import Editor from "./views/Editor";
import { useEffect } from "react";
import IdiomRuntime from "./compiler/runtime";

function App() {
    useEffect(() => {
        console.log("----------------------------------");
        const code = compileTest();
        IdiomRuntime.runCode(code)
    }, []);
    return (
        <div className="App">
            <Editor />
        </div>
    );
}

export default App;
