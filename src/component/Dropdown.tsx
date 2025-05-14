import React from "react";

interface DropdownProps {
  rounded?: boolean;
  options: string[];
  selectedOption: string;
  displayOptions: string[];
  onChange: (option: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ rounded, options, selectedOption, displayOptions, onChange }) => {
  return (
    <select
      className={`border border-gray-300 p-2 ${rounded ? "rounded-full" : "rounded"}`}
      value={selectedOption}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option, index) => (
        <option key={option} value={option}>
          {displayOptions[index]}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;