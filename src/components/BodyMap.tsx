import type React from 'react';
import { useState } from 'react';
import { BodyModel3D } from './BodyModel3D';
import { ChevronDown, ChevronUp, Crosshair } from 'lucide-react';

interface BodyMapProps {
  selectedPart: string | null;
  onPartSelect: (part: string | null) => void;
}

interface BodyPartConfig {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const BODY_PARTS: BodyPartConfig[] = [
  { id: 'head', label: 'Head & Face', description: 'Brain trauma, eye splash, nosebleeds, strokes', icon: '🧠' },
  { id: 'neck', label: 'Neck & Throat', description: 'Choking, airway blockages, whiplash', icon: '🫁' },
  { id: 'shoulders', label: 'Shoulders', description: 'Dislocations, rotator cuff, collarbone fractures', icon: '💪' },
  { id: 'chest', label: 'Chest & Ribcage', description: 'Cardiac arrest, chest wounds, rib fractures', icon: '❤️' },
  { id: 'upper_back', label: 'Upper Back', description: 'Spinal injuries, muscle strains, shoulder blade pain', icon: '🔙' },
  { id: 'abdomen', label: 'Abdomen & Core', description: 'Poisoning, severe pain, internal bleeding', icon: '🫃' },
  { id: 'lower_back', label: 'Lower Back', description: 'Disc injuries, kidney pain, muscle spasms', icon: '🦴' },
  { id: 'pelvis', label: 'Pelvis & Groin', description: 'Hip fractures, hernia, pelvic injuries', icon: '🦿' },
  { id: 'arms', label: 'Arms', description: 'Fractures, sprains, burns, deep cuts', icon: '🦾' },
  { id: 'hands', label: 'Hands & Wrists', description: 'Burns, finger cuts, carpal injuries', icon: '🤚' },
  { id: 'legs', label: 'Legs & Knees', description: 'Fractures, sprains, ligament tears, bites', icon: '🦵' },
  { id: 'feet', label: 'Feet & Ankles', description: 'Sprains, frostbite, cuts, ankle fractures', icon: '🦶' },
];

export const BodyMap: React.FC<BodyMapProps> = ({ selectedPart, onPartSelect }) => {
  const [selectorExpanded, setSelectorExpanded] = useState(false);

  const handlePartClick = (partId: string) => {
    if (selectedPart === partId) {
      onPartSelect(null);
    } else {
      onPartSelect(partId);
    }
  };

  const selectedPartConfig = BODY_PARTS.find(p => p.id === selectedPart);

  return (
    <div className="body-map-container">
      {/* Header */}
      <div className="body-map-header">
        <div className="body-map-title-row">
          <Crosshair size={18} className="body-map-icon" />
          <h3>3D Anatomy Locator</h3>
        </div>
        <p className="subtitle">Rotate, zoom &amp; tap hotspots on the 3D model to select a body region</p>
      </div>

      {/* 3D Interactive Body Model - Full width hero placement */}
      <div className="body-model-wrapper">
        <BodyModel3D
          selectedPart={selectedPart}
          onPartSelect={onPartSelect}
        />

        {/* Selected Part Indicator Overlay */}
        {selectedPartConfig && (
          <div className="selected-part-indicator">
            <span className="selected-part-icon">{selectedPartConfig.icon}</span>
            <div className="selected-part-info">
              <span className="selected-part-name">{selectedPartConfig.label}</span>
              <span className="selected-part-desc">{selectedPartConfig.description}</span>
            </div>
            <button
              className="deselect-btn"
              onClick={() => onPartSelect(null)}
              aria-label="Clear selection"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Manual Selection Grid - Collapsible on mobile */}
      <div className="manual-selector-section">
        <button
          className="manual-selector-toggle"
          onClick={() => setSelectorExpanded(!selectorExpanded)}
          aria-expanded={selectorExpanded}
        >
          <span className="toggle-label">
            <span className="toggle-dot" />
            Quick Select Body Region
          </span>
          {selectorExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <div className={`manual-selector-grid ${selectorExpanded ? 'expanded' : ''}`}>
          {BODY_PARTS.map((part) => (
            <button
              key={part.id}
              onClick={() => handlePartClick(part.id)}
              className={`manual-part-btn ${selectedPart === part.id ? 'active' : ''}`}
              aria-pressed={selectedPart === part.id}
              title={part.description}
            >
              <span className="part-emoji">{part.icon}</span>
              <span className="part-label">{part.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
