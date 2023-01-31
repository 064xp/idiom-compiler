import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import Editor from "@monaco-editor/react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        defaultValue="// some comment"
      />
    </div>
  );
}

export default App;
