import axios from 'axios';
import { Tab } from "../pages/notepad/notepad";
import { useContext, useState } from 'react';
import LoadingModal from './LoadingModal';
import { OpenAiContext, OpenAiContextType } from '../App';

type toolbarProps = {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
  selectedTab: number;
};

export default function Toolbar({ tabs, setTabs, selectedTab }: toolbarProps) {
  const [undoContent, setUndoContent] = useState({ content: "", tabId: 999 });
  const [loading, setLoading] = useState(false);
  const { selectedModel } = useContext<OpenAiContextType>(OpenAiContext);

  const token = localStorage.getItem('token');

  const handleApiRequest = async (endpoint: string, prompt: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`http://localhost:8020/${endpoint}`, {
        prompt,
        model: selectedModel
      }, {
        headers: { Authorization: token }
      });
      
      setUndoContent({ content: tabs.find(tab => tab.id === selectedTab)?.content || "", tabId: selectedTab });
      console.log("Response.data: ", response.data);
      let newContent = "";
      
      if(endpoint === "research"){
        newContent = response.data
      } else {
        newContent = response.data.choices[0].message.content;
      }
      
      const newTabs = tabs.map(tab => {
        if (tab.id === selectedTab) {
          return {
            ...tab,
            content: newContent,
          };
        }
        return tab;
      });
      
      setTabs(newTabs);
    } catch (error) {
      if(error.response.data.error = "Failed to authenticate token"){
        // temporary solution. Need to add graceful token expiration handling
        localStorage.removeItem('token');
        window.location.reload();
      }
      console.error('Error:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = () => handleApiRequest('process', "Please provide a concise and comprehensive summary of the following information: " + tabs.find(tab => tab.id === selectedTab)?.content);
  const handleExpand = () => handleApiRequest('research', tabs.find(tab => tab.id === selectedTab)?.content || "");
  const handleOrganize = () => handleApiRequest('process', "Strategically organize the following information into a cohesive structure: " + tabs.find(tab => tab.id === selectedTab)?.content);
  const handleRewrite = () => handleApiRequest('process', "Transform the following content into a professional, crystal-clear, and engaging narrative: " + tabs.find(tab => tab.id === selectedTab)?.content);
  const generateContent = () => handleApiRequest('generate', tabs.find(tab => tab.id === selectedTab)?.content || "");

  const handleUndo = () => {
    if(undoContent.tabId !== 999){
      const newTabs = tabs.map((tab) => {
        if (tab.id === undoContent.tabId) {
          return {
            ...tab,
            content: undoContent.content,
          };
        }
        return tab;
      });

      setTabs(newTabs);
      setUndoContent({content: "", tabId: 999});
    }
  }
  
  return (
    <>
      <div className="toolbar">
        <button className="toolbar-button" onClick={generateContent}>Generate</button>
        <button className="toolbar-button" onClick={handleSummarize}>Summarize</button>
        <button className="toolbar-button" onClick={handleExpand}>Expand</button>
        <button className="toolbar-button" onClick={handleOrganize}>Organize</button>
        <button className="toolbar-button" onClick={handleRewrite}>Rewrite</button>
        <button disabled={undoContent.tabId === 999 || undoContent.tabId !== selectedTab} onClick={handleUndo} className="toolbar-button-undo">Undo</button>
      </div>
      {loading && <LoadingModal />}
    </>
  );
}