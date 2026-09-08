import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, LucideIcon } from 'lucide-react';
import { suggestAddresses } from '../services/geminiService';

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  icon?: LucideIcon;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  className,
  rows = 3,
  icon: Icon
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Use ReturnType<typeof setTimeout> to handle both browser (number) and Node (Timeout) environments
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (newValue.length > 4) {
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        const results = await suggestAddresses(newValue);
        if (results && results.length > 0) {
          setSuggestions(results);
          setShowSuggestions(true);
        } else {
          setShowSuggestions(false);
        }
        setLoading(false);
      }, 800); // 800ms debounce to avoid API spam
    } else {
      setShowSuggestions(false);
      setLoading(false);
    }
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        {Icon && (
            <Icon className="absolute left-3 top-3 text-neutral-400 pointer-events-none" size={16} />
        )}
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`${className} ${Icon ? 'pl-10' : ''}`}
          rows={rows}
        />
        {loading && (
          <div className="absolute right-3 bottom-3">
             <Loader2 size={16} className="animate-spin text-neutral-400" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <ul>
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="px-4 py-3 text-sm cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-b border-neutral-100 dark:border-neutral-700 last:border-0 flex items-start gap-2"
              >
                <MapPin size={16} className="mt-0.5 text-neutral-400 flex-shrink-0" />
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
          <div className="px-2 py-1 bg-neutral-50 dark:bg-neutral-900 text-[10px] text-neutral-400 text-right">
            Suggestions by Gemini AI
          </div>
        </div>
      )}
    </div>
  );
};