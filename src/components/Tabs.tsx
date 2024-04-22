import { Tab } from "../pages/notepad/notepad";

type tabsProps = {
  tabs: Tab[];
  setTabs: (tabs: Tab[]) => void;
  selectedTab: number;
  setSelectedTab: (tabNumber: number) => void;
};

export default function Tabs({ tabs, setTabs, selectedTab, setSelectedTab }: tabsProps) {
  

  const handleTabClick = (tabNumber: number) => {
    setSelectedTab(tabNumber);
  };

  const handleAddTab = () => {
    if (tabs.length >= 8) {
      return;
    }
    const newTabId = tabs[tabs.length - 1].id + 1;
    const newTab: Tab = {
      id: newTabId,
      content: "",
    };
    setTabs([...tabs, newTab]);
    setSelectedTab(newTab.id);
  };

  const deleteTab = () => {
    if (tabs.length < 1) {
      return;
    }
    const newTabs = tabs.filter((tab) => tab.id !== selectedTab);
    setTabs(newTabs);
    setSelectedTab(newTabs[0].id);
  };

  const renderTab = (tab: Tab) => {
    const tabName = `Page ${tab.id}`;
    const isSelected = selectedTab === tab.id;
    const tabClassName = `tab ${isSelected ? "selected" : ""}`;

    return (
      <div
        key={tab.id}
        className={tabClassName}
        onClick={() => handleTabClick(tab.id)}
      >
        {tabName}
      </div>
    );
  };

  return <div className="tabs">{tabs.map((tab) => (renderTab(tab)))}<div className="plus-button" onClick={handleAddTab}><span>+</span></div><div className="minus-button" onClick={deleteTab}><span>-</span></div></div>;
}