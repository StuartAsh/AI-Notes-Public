// Desc: Main entry point for the application
import './App.css';
import Notepad from './pages/notepad/notepad';
import OpenAiPrompt from './components/openAiPrompt';
import { createContext, useEffect, useState } from "react";

export type OpenAiContextType = {
  openAiKeyID: string;
  selectedModel: string;
  setSelectedModel: (selectedModel: string) => void;
};

type openAiModel = {
  created: number;
  id: string;
  object: string;
  owned_by: string;
}

// Create the context
export const OpenAiContext = createContext<OpenAiContextType>({
  openAiKeyID: "",
  selectedModel: "",
  setSelectedModel: () => {},
});

// Main entry point for the application
function App() {
  const [openAiKeyID, setOpenAiKeyID] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<openAiModel[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  
  useEffect(() => {
    if (openAiKeyID === "") {
      setShowPrompt(true);
      console.log("showPrompt", showPrompt)
    }
  }, [showPrompt]);

  useEffect(() => {
    if(openAiKeyID !== "") {
      fetch('http://127.0.0.1:8020/models?id=' + openAiKeyID)
      .then(response => response.json())
      .then(data => {
        setModels(data.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    }
  }, [openAiKeyID]);

  useEffect(() => {
    if(models.length > 0) {
      console.log("models", models);
      let tempOptions: string[]  = [];
      models.forEach((model) => {
        if(model.id.startsWith("gpt") && model.owned_by === "system") {
          tempOptions.push(model.id);
        }
      });
      setOptions(tempOptions);
      setSelectedModel("gpt-4o-2024-05-13");
      console.log("options", tempOptions);
    }
  } , [models]);

  return (
    <div className="App">
      <div className="modelSelector">
        <strong>Select the OpenAI model you want to use: </strong>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <OpenAiContext.Provider value={{ openAiKeyID, selectedModel, setSelectedModel }}>
        {openAiKeyID !== "" ? <Notepad /> : null }        
      </OpenAiContext.Provider>
       {showPrompt ? <OpenAiPrompt setShowPrompt={setShowPrompt} setOpenAiKeyID={setOpenAiKeyID} /> : null}
    </div>
  );
}

export default App;
