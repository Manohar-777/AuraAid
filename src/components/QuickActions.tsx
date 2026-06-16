import React from 'react';
import { AlertCircle, ShieldAlert, Heart, Activity } from 'lucide-react';

interface QuickActionsProps {
  onSelectArticle: (id: string) => void;
  activeId: string | undefined;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectArticle, activeId }) => {
  const CRITICAL_ACTIONS = [
    {
      id: 'cardiac-arrest',
      label: 'CARDIAC ARREST (CPR)',
      icon: Heart,
      colorClass: 'cpr-pulse-btn',
    },
    {
      id: 'choking',
      label: 'CHOKING (HEIMLICH)',
      icon: Activity,
      colorClass: 'choking-pulse-btn',
    },
    {
      id: 'severe-bleeding',
      label: 'SEVERE BLEEDING',
      icon: ShieldAlert,
      colorClass: 'bleeding-pulse-btn',
    },
  ];

  return (
    <div className="quick-actions-card">
      <div className="quick-actions-header">
        <AlertCircle className="emergency-alert-icon" size={18} />
        <h4>IMMEDIATE CRITICAL EMERGENCIES</h4>
      </div>
      <p className="quick-actions-desc">
        Click below for instant directions if the victim is unresponsive, choking, or bleeding heavily.
      </p>
      <div className="quick-actions-buttons">
        {CRITICAL_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => onSelectArticle(action.id)}
              className={`quick-action-btn ${action.colorClass} ${activeId === action.id ? 'active' : ''}`}
            >
              <span className="flashing-indicator"></span>
              <Icon size={20} className="btn-icon" />
              <span className="btn-label">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
