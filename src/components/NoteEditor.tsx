import { useEffect, ChangeEvent, useState } from "react";
import { Tab } from "../pages/notepad/notepad";

type NoteEditorProps = {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
  selectedTab: number;
};

export default function NoteEditor({ tabs, setTabs, selectedTab} : NoteEditorProps) {
  const [selectedTabContent, setSelectedTabContent] = useState("");
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setSelectedTabContent(event.target.value);
    const newTabs = tabs.map((tab) => {
      if (tab.id === selectedTab) {
        return {
          ...tab,
          content: event.target.value,
        };
      }
      return tab;
    });
    setTabs(newTabs);
  };

  useEffect(() => {
    console.log("set selectedTabContent - selectedTab:", selectedTab);
    const newSelectedTabContent = tabs.find((tab) => tab.id === selectedTab)?.content || "";
    setSelectedTabContent(newSelectedTabContent);
  }, [selectedTab, tabs]);

  return (
    <div className="note-editor">
      <textarea className="editor" value={selectedTabContent} onChange={handleChange}></textarea>
    </div>
  );
}
