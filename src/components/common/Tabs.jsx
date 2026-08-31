import React from "react";

const Tabs = ({ tabs = [], activeTab, onChange }) => {
  return (
    <div className="w-full border-b border-[#E6EEF0]">
      <div className="flex w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => onChange(tab.value)}
              className={`relative pb-4 pt-4 flex-1 text-center 
                font-open-sans text-[18px] leading-[24px] capitalize transition-all duration-200
                ${isActive
                  ? "font-semibold text-[#000000]"
                  : "font-normal text-[#000000]"
                }
              `}
            >
              {tab.label}

              {isActive && (
                <span className="absolute left-0 bottom-0 w-full h-[5px] bg-[#334155] rounded-t-md"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;