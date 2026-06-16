import type React from 'react';
import { BodyModel3D } from './BodyModel3D';

interface BodyMapProps {
  selectedPart: string | null;
  onPartSelect: (part: string | null) => void;
}

interface BodyPartConfig {
  id: string;
  label: string;
  description: string;
}

const BODY_PARTS: BodyPartConfig[] = [
  { id: 'head', label: 'Head & Face', description: 'Brain trauma, eye splash, nosebleeds, strokes' },
  { id: 'neck', label: 'Neck & Throat', description: 'Choking, airway blockages, whiplash' },
  { id: 'shoulders', label: 'Shoulders', description: 'Dislocations, rotator cuff, collarbone fractures' },
  { id: 'chest', label: 'Chest & Ribcage', description: 'Cardiac arrest, chest wounds, rib fractures' },
  { id: 'upper_back', label: 'Upper Back', description: 'Spinal injuries, muscle strains, shoulder blade pain' },
  { id: 'abdomen', label: 'Abdomen & Core', description: 'Poisoning, severe pain, internal bleeding' },
  { id: 'lower_back', label: 'Lower Back', description: 'Disc injuries, kidney pain, muscle spasms' },
  { id: 'pelvis', label: 'Pelvis & Groin', description: 'Hip fractures, hernia, pelvic injuries' },
  { id: 'arms', label: 'Arms', description: 'Fractures, sprains, burns, deep cuts' },
  { id: 'hands', label: 'Hands & Wrists', description: 'Burns, finger cuts, carpal injuries' },
  { id: 'legs', label: 'Legs & Knees', description: 'Fractures, sprains, ligament tears, bites' },
  { id: 'feet', label: 'Feet & Ankles', description: 'Sprains, frostbite, cuts, ankle fractures' },
];

export const BodyMap: React.FC<BodyMapProps> = ({ selectedPart, onPartSelect }) => {
  const handlePartClick = (partId: string) => {
    if (selectedPart === partId) {
      onPartSelect(null);
    } else {
      onPartSelect(partId);
    }
  };

  return (
    <div className="body-map-container">
      <div className="body-map-header">
        <h3>3D Anatomy Locator</h3>
        <p className="subtitle">Rotate, zoom &amp; click the 3D body to select a region for first aid protocols</p>
      </div>

      {/* 3D Interactive Body Model */}
      <BodyModel3D
        selectedPart={selectedPart}
        onPartSelect={onPartSelect}
      />

      {/* Manual Selection Grid for Mobile / Keyboard Accessibility */}
      <div className="manual-selector-grid">
        {BODY_PARTS.map((part) => (
          <button
            key={part.id}
            onClick={() => handlePartClick(part.id)}
            className={`manual-part-btn ${selectedPart === part.id ? 'active' : ''}`}
            aria-pressed={selectedPart === part.id}
            title={part.description}
          >
            <span className="dot"></span>
            {part.label}
          </button>
        ))}
      </div>
    </div>
  );
};
