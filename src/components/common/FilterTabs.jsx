import React from 'react';

const FilterChip = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 h-[29px] rounded-full text-[14px] font-open-sans transition-all flex items-center justify-center shadow-[0px_0px_12px_0.5px_#02949D33]  ${
        isActive 
          ? 'bg-primary text-white font-semibold border border-primary-dark'
          : 'bg-white text-text font-normal border border-border hover:border-accent hover:text-accent'
      }`}
    >
      {label}
    </button>
  );
};

const FilterTabs = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <div className="flex items-center gap-[24px] mb-6">
      {filters.map((filter) => (
        <FilterChip
          key={filter.id}
          label={filter.label}
          isActive={activeFilter === filter.id}
          onClick={() => onFilterChange(filter.id)}
        />
      ))}
    </div>
  );
};

export default FilterTabs;