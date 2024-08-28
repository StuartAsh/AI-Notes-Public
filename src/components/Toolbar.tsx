import axios, { AxiosResponse } from 'axios';
import { Tab } from "../pages/notepad/notepad";
import { useContext, useState } from 'react';
import LoadingModal from './LoadingModal';
import { OpenAiContext, OpenAiContextType } from '../App';

type toolbarProps = {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
  selectedTab: number;
};

type undoContentType = {
  content: string;
  tabId: number;
};

export default function Toolbar({ tabs, setTabs, selectedTab }: toolbarProps) {
  const [undoContent, setUndoContent] = useState<undoContentType>({content: "", tabId: 999});
  const [loading, setLoading] = useState(false);
  const { openAiKeyID, selectedModel } = useContext<OpenAiContextType>(OpenAiContext);

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

  const handleSummarize = () => {
    console.log('in HandleSummarize: ');
    const selectedTabContent = tabs.find((tab) => tab.id === selectedTab)?.content || "";

    if(selectedTabContent !== ""){
      setLoading(true);
      axios.post("http://127.0.0.1:8020/process", {
        prompt: "Please provide a concise and comprehensive summary of the following information, highlighting key points, main ideas, and essential conclusions.: " + selectedTabContent,
        id: openAiKeyID,
        model: selectedModel
      })
      .then((response:AxiosResponse) => {
        setUndoContent({content: selectedTabContent, tabId: selectedTab})
        const newTabs = tabs.map((tab) => {
          if (tab.id === selectedTab) {
            return {
              ...tab,
              content: response.data.choices[0].message.content,
            };
          }
          return tab;
        });
        setTabs(newTabs);
        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setLoading(false);
      });
    } 
  }

  const handleExpand = () => {
    console.log('in handleExpand: ');
    const selectedTabContent = tabs.find((tab) => tab.id === selectedTab)?.content || "";

    if(selectedTabContent !== ""){
      setLoading(true);
      axios.post("http://127.0.0.1:8020/research", {
        prompt: selectedTabContent,
        id: openAiKeyID,
        model: selectedModel
      })
      .then((response:AxiosResponse) => {
        setUndoContent({content: selectedTabContent, tabId: selectedTab})
        const newTabs = tabs.map((tab) => {
          if (tab.id === selectedTab) {
            return {
              ...tab,
              content: response.data,
            };
          }
          return tab;
        });
        setTabs(newTabs);
        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setLoading(false);
      });
    } 
  }

  const handleOrganize = () => {
    console.log('in handleOrganize: ');
    const selectedTabContent = tabs.find((tab) => tab.id === selectedTab)?.content || "";
    if(selectedTabContent !== ""){
      setLoading(true);
      axios.post("http://127.0.0.1:8020/process", {
        prompt: "Strategically organize the following information into a cohesive structure by categorizing related information, applying uniform formatting, and introducing distinct sections for each primary topic. Please include clear labels for these sections to facilitate easy navigation and comprehension: " + selectedTabContent,
        id: openAiKeyID,
        model: selectedModel
      })
      .then((response:AxiosResponse) => {
        setUndoContent({content: selectedTabContent, tabId: selectedTab})
        const newTabs = tabs.map((tab) => {
          if (tab.id === selectedTab) {
            return {
              ...tab,
              content: response.data.choices[0].message.content,
            };
          }
          return tab;
        });
        setTabs(newTabs);
        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setLoading(false);
      });
    }   
  }

  const handleRewrite = () => {
    console.log('in handleRewrite: ');
    const selectedTabContent = tabs.find((tab) => tab.id === selectedTab)?.content || "";
    if(selectedTabContent !== ""){
      setLoading(true);
      axios.post("http://127.0.0.1:8020/process", {
        prompt: "Transform the following content into a professional, crystal-clear, and engaging narrative: " + selectedTabContent,
        id: openAiKeyID,
        model: selectedModel
      })
      .then((response:AxiosResponse) => {
        setUndoContent({content: selectedTabContent, tabId: selectedTab})
        const newTabs = tabs.map((tab) => {
          if (tab.id === selectedTab) {
            return {
              ...tab,
              content: response.data.choices[0].message.content,
            };
          }
          return tab;
        });
        setTabs(newTabs);
        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setLoading(false);
      });
    }   
  }

  const generateContent = () => {
    console.log('in generateContent: ');
    const selectedTabContent = tabs.find((tab) => tab.id === selectedTab)?.content || "";
    if(selectedTabContent !== ""){
      setLoading(true);
      axios.post("http://127.0.0.1:8020/generate", {
        prompt: selectedTabContent,
        id: openAiKeyID,
        model: selectedModel
      })
      .then((response:AxiosResponse) => {
        setUndoContent({content: selectedTabContent, tabId: selectedTab})
        const newTabs = tabs.map((tab) => {
          if (tab.id === selectedTab) {
            return {
              ...tab,
              content: response.data.choices[0].message.content,
            };
          }
          return tab;
        });
        setTabs(newTabs);
        setLoading(false);
      }).catch((error) => {
        console.log(error);
        setLoading(false);
      });
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