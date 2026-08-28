import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  dir?: 'rtl' | 'ltr';
  error?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'اختر...',
  className = '',
  dir = 'rtl',
  error = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`} dir={dir}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-5 py-2.5 bg-white border text-start font-medium rounded-full text-sm flex items-center justify-between transition-all cursor-pointer ${
          error ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-gray-200 hover:border-gray-300 focus:ring-2 focus:ring-black/5'
        } ${isOpen ? 'ring-2 ring-black/5 border-black/80' : ''}`}
      >
        <span className={`truncate ${selectedOption ? 'text-black font-medium' : 'text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 shrink-0 ${dir === 'rtl' ? 'mr-2' : 'ml-2'} ${isOpen ? 'rotate-180 text-black' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 p-1.5 space-y-0.5 overflow-hidden max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-start px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between cursor-pointer ${
                  isSelected ? 'bg-black text-white font-semibold' : 'text-gray-700 hover:bg-gray-100/80 hover:text-black font-medium'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Check size={16} className="text-white shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
