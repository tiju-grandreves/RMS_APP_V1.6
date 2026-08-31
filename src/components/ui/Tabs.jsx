import React from 'react';

const Tabs = ({ children, value, onChange, className = '' }) => {
  return (
    <div className={className}>
      <TabsContext.Provider value={{ value, onChange }}>
        {children}
      </TabsContext.Provider>
    </div>
  );
};

const TabsContext = React.createContext();

const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center border-b border-border relative ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className = '' }) => {
  const context = React.useContext(TabsContext);
  const isActive = context.value === value;

  return (
    <button
      type="button"
      onClick={() => context.onChange(value)}
      className={`
        px-8 py-3 text-[18px] font-dm-sans capitalize transition-all duration-200 relative
        ${isActive 
          ? 'text-text font-normal' 
          : 'text-text font-normal hover:text-accent hover:bg-bg-light'
        }
        ${className}
      `}
    >
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-[4px] rounded-full bg-primary transition-all" />
      )}
    </button>
  );
};

const TabsContent = ({ value, children, className = '' }) => {
  const context = React.useContext(TabsContext);
  
  if (context.value !== value) return null;

  return (
    <div className={`py-6 ${className}`}>
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
