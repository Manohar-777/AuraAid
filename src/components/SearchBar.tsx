import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

const SUGGESTIONS = [
  { label: 'CPR / Heart Attack', query: 'cpr' },
  { label: 'Bleeding Wounds', query: 'bleed' },
  { label: 'Burns', query: 'burn' },
  { label: 'Snake Bite', query: 'snake' },
  { label: 'Choking', query: 'choke' },
  { label: 'Eye Injury', query: 'eye' },
];

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onClear }) => {
  return (
    <div className="search-section">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search emergency symptoms... (e.g., 'knife cut', 'wasp sting', 'concussion')"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button className="search-clear-btn" onClick={onClear} title="Clear search">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="search-suggestions">
        <span className="suggestion-label">Suggested:</span>
        <div className="suggestion-pills">
          {SUGGESTIONS.map((sug) => (
            <button
              key={sug.query}
              className={`suggestion-pill ${value.toLowerCase() === sug.query ? 'active' : ''}`}
              onClick={() => onChange(sug.query)}
            >
              {sug.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
