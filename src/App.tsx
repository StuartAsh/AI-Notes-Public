import './App.css';
import Notepad from './pages/notepad/notepad';
import OpenAiPrompt from './components/OpenAiPrompt';
import { createContext, useEffect, useState } from "react";
import axios from 'axios';

export type OpenAiContextType = {
  selectedModel: string;
  setSelectedModel: (selectedModel: string) => void;
};

type openAiModel = {
  created: number;
  id: string;
  object: string;
  owned_by: string;
}

export const OpenAiContext = createContext<OpenAiContextType>({
  selectedModel: "",
  setSelectedModel: () => {},
});

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showPrompt, setShowPrompt] = useState(!token);
  const [selectedModel, setSelectedModel] = useState("");
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchModels();
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const fetchModels = async () => {
    try {
      const response = await axios.get('http://localhost:8020/models', {
        headers: { Authorization: token }
      }).then((res) => {  
        // Process models and set options...
        const models: openAiModel[] = res.data.data;
        let tempOptions: string[]  = [];
        models.forEach((model) => {
          if(model.id.startsWith("gpt") && model.owned_by === "system") {
            tempOptions.push(model.id);
          }
        });
        setOptions(tempOptions);
        setSelectedModel("gpt-4o-mini-2024-07-18");
      });
    } catch (error) {
      console.error('Error fetching models:', error);
      setToken(null);
      setShowPrompt(true);
    }
  };

  const logout = () => {
    setToken(null);
    setOptions([]);
    setSelectedModel("");
    setShowPrompt(true);
  };

  return (
    <div className="App">
      {token ? (<span className='logout-button' onClick={() => logout()}>Logout</span>) : null}
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
      <OpenAiContext.Provider value={{ selectedModel, setSelectedModel }}>
        {token ? <Notepad /> : null}
      </OpenAiContext.Provider>
      {showPrompt ? (
        <OpenAiPrompt setShowPrompt={setShowPrompt} setToken={setToken} />
      ) : null}
    </div>
  );
}

export default App;
