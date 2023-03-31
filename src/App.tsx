import "./App.css";
import Editor from "./views/Editor";
import LexicalAnalyzer from "./compiler/modules/lexicalAnalyzer";
import { useEffect } from "react";

function App() {
  useEffect(()=>{
    const l = new LexicalAnalyzer("");

  }, [])
  return (
    <div className="App">
      <Editor />
    </div>
  );
}

export default App;
