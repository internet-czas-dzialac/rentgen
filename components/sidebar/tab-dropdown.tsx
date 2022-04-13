import React from 'react';

export default function TabDropdown({
    setPickedTab,
    pickedTab,
}: {
    setPickedTab: (tab_id: number) => void;
    pickedTab: number;
}) {
    const [tabs, setTabs] = React.useState([]);
    React.useEffect(() => {
        browser.tabs.query({ currentWindow: true }).then(setTabs);
    }, []);
    return (
        <select
            id="tab_dropdown"
            value={pickedTab}
            onChange={async (e) => {
                setPickedTab(parseInt(e.target.value));
            }}
        >
            {tabs.map((tab) => (
                <option value={tab.id} key={tab.id}>
                    {tab.title}
                </option>
            ))}
        </select>
    );
}
