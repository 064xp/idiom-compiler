import "./App.css";
import { compileTest } from "./compiler/compiler";
import Editor from "./views/Editor";
import { useEffect } from "react";
import IdiomRuntime from "./compiler/runtime";

function App() {
    return (
        <div className="App">
            <Editor />
        </div>
    );
}

export default App;
