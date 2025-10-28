import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  icon?: string;
}

interface SelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = ""
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`
          w-full px-4 py-3 
          bg-white dark:bg-gray-700 
          border border-gray-200 dark:border-gray-600 
          rounded-xl 
          text-gray-900 dark:text-white 
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:border-transparent 
          transition-all duration-200
          appearance-none
          disabled:opacity-50 disabled:cursor-not-allowed
          ${disabled ? 'bg-gray-50 dark:bg-gray-800' : 'hover:border-gray-300 dark:hover:border-gray-500'}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon ? `${option.icon} ${option.label}` : option.label}
          </option>
        ))}
      </select>
      
      {/* Custom chevron icon */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <ChevronDown className={`w-5 h-5 ${disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`} />
      </div>
    </div>
  );
};

export default SelectField;
