import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import EditorPane from "./ components/EditorPane/EditorPane";
import MainToolbar from "./ components/MainToolbar/MainToolbar";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="App">
      <MainToolbar />
      <EditorPane />
    </div>
  );
}

export default App;
