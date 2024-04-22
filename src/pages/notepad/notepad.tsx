import NoteEditor from "../../components/NoteEditor";
import Toolbar from "../../components/Toolbar";
import Tabs from "../../components/Tabs";
import { useState } from "react";

export type Tab = {
  id: number;
  content: string;
};

export default function Notepad() {
  const [selectedTab, setSelectedTab] = useState(1);
  const [tabs, setTabs] = useState<Tab[]>([{ id: 1, content: "" }]);
  return (
    <div className="page">
      <header className="App-header">
        <p>
          AI Notepad
        </p>
      </header>
      <Tabs tabs={tabs} setTabs={setTabs} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      <NoteEditor tabs={tabs} setTabs={setTabs} selectedTab={selectedTab}/>
      <Toolbar tabs={tabs} setTabs={setTabs} selectedTab={selectedTab} />
    </div>
  );
}