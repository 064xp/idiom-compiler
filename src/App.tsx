import "./App.css";
import { compileTest } from "./compiler/compiler";
import Editor from "./views/Editor";
import { useEffect } from "react";

function App() {
    useEffect(() => {
        console.log("----------------------------------");
        compileTest();
    }, []);
    return (
        <div className="App">
            <Editor />
        </div>
    );
}

export default App;
