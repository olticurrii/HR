import React from 'react';
import { motion } from 'framer-motion';

interface ToggleFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ToggleField: React.FC<ToggleFieldProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md'
}) => {
  const sizes = {
    sm: {
      switch: 'w-8 h-5',
      thumb: 'w-3 h-3',
      translate: checked ? 'translate-x-3' : 'translate-x-0.5'
    },
    md: {
      switch: 'w-11 h-6',
      thumb: 'w-4 h-4',
      translate: checked ? 'translate-x-5' : 'translate-x-1'
    },
    lg: {
      switch: 'w-14 h-8',
      thumb: 'w-6 h-6',
      translate: checked ? 'translate-x-6' : 'translate-x-1'
    }
  };

  const sizeConfig = sizes[size];

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex items-center
        ${sizeConfig.switch}
        flex-shrink-0 cursor-pointer
        ${checked 
          ? 'bg-blue-600 dark:bg-primary-500' 
          : 'bg-gray-200 dark:bg-gray-700'
        }
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-opacity-80'
        }
        border-2 border-transparent
        rounded-full
        focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800
        transition-colors duration-200
      `}
      role="switch"
      aria-checked={checked}
    >
      <span className="sr-only">Toggle</span>
      <motion.span
        className={`
          ${sizeConfig.thumb}
          bg-white
          rounded-full
          shadow-lg
          ring-0
          transition-transform duration-200
          ${sizeConfig.translate}
        `}
        animate={{
          x: checked ? (size === 'sm' ? 12 : size === 'md' ? 20 : 24) : 2
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      />
    </button>
  );
};

export default ToggleField;
