import React, { useState, useEffect } from 'react';
import { AlertOctagon, HelpCircle, ShieldAlert, Award, CheckSquare, Square, Info } from 'lucide-react';
import type { FirstAidArticle } from '../data/firstAidData';
import { EmergencyTimer } from './EmergencyTimer';

interface InstructionViewerProps {
  article: FirstAidArticle | null;
  isLoading: boolean;
}

type TabType = 'immediate' | 'steps' | 'warnings' | 'sources';

export const InstructionViewer: React.FC<InstructionViewerProps> = ({ article, isLoading }) => {
  const [activeTab, setActiveTab] = useState<TabType>('immediate');
  const [checkedSteps, setCheckedSteps] = useState<{ [key: string]: boolean }>({});

  // Reset checked steps and default to immediate action tab on article change
  useEffect(() => {
    setCheckedSteps({});
    setActiveTab('immediate');
  }, [article]);

  if (isLoading) {
    return (
      <div className="instruction-viewer-loading">
        <div className="spinner-large"></div>
        <p>Synthesizing instruction context...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="instruction-viewer-empty">
        <div className="empty-glowing-shield">
          <HelpCircle size={40} className="shield-icon animate-pulse" />
        </div>
        <h4>No Protocol Loaded</h4>
        <p>Select a body region on the left, search for an injury, or click one of the immediate critical action buttons above to retrieve instructions.</p>
      </div>
    );
  }

  const toggleStep = (index: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getSeverityColor = (sev: FirstAidArticle['severity']) => {
    switch (sev) {
      case 'CRITICAL':
        return 'severity-critical';
      case 'MODERATE':
        return 'severity-moderate';
      default:
        return 'severity-mild';
    }
  };

  return (
    <div className="instruction-viewer-card">
      {/* Header with Title and Severity */}
      <div className="viewer-header">
        <div className="title-area">
          <span className={`severity-badge ${getSeverityColor(article.severity)}`}>
            {article.severity} EMERGENCY
          </span>
          <h2>{article.title}</h2>
          <p className="description">{article.description}</p>
        </div>
      </div>

      {/* Embedded Context-Aware Timer */}
      {article.timerType && article.timerType !== 'none' && (
        <div className="viewer-timer-section">
          <EmergencyTimer type={article.timerType} />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="viewer-tabs">
        <button
          className={`tab-btn ${activeTab === 'immediate' ? 'active' : ''}`}
          onClick={() => setActiveTab('immediate')}
        >
          <ShieldAlert size={16} />
          <span>Immediate Action</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'steps' ? 'active' : ''}`}
          onClick={() => setActiveTab('steps')}
        >
          <CheckSquare size={16} />
          <span>Step-by-Step</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'warnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('warnings')}
        >
          <AlertOctagon size={16} />
          <span>What NOT to Do</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'sources' ? 'active' : ''}`}
          onClick={() => setActiveTab('sources')}
        >
          <Award size={16} />
          <span>References</span>
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="tab-content">
        {activeTab === 'immediate' && (
          <div className="tab-pane-immediate">
            <div className="action-warning-callout">
              <span className="bullet-flash"></span>
              <h5>DO THIS FIRST:</h5>
            </div>
            <ul className="immediate-actions-list">
              {article.immediateActions.map((action, idx) => (
                <li key={idx} className="immediate-action-item">
                  <span className="item-number">0{idx + 1}</span>
                  <p>{action}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="tab-pane-steps">
            <p className="tab-info-text">
              <Info size={14} /> Tap steps to check them off as you perform them.
            </p>
            <div className="steps-list">
              {article.steps.map((step, idx) => {
                const isChecked = !!checkedSteps[idx];
                return (
                  <div
                    key={idx}
                    className={`step-item-card ${isChecked ? 'completed' : ''}`}
                    onClick={() => toggleStep(idx)}
                  >
                    <div className="step-checkbox">
                      {isChecked ? (
                        <CheckSquare className="checkbox-icon checked" size={20} />
                      ) : (
                        <Square className="checkbox-icon" size={20} />
                      )}
                    </div>
                    <div className="step-details">
                      <h5 className="step-title">{step.text}</h5>
                      {step.substeps && step.substeps.length > 0 && (
                        <ul className="step-substeps">
                          {step.substeps.map((sub, sidx) => (
                            <li key={sidx}>{sub}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'warnings' && (
          <div className="tab-pane-warnings">
            <div className="contraindications-header">
              <AlertOctagon size={20} className="danger-icon" />
              <h5>CRITICAL CONTRAINDICATIONS</h5>
            </div>
            <ul className="warnings-list">
              {article.warnings.map((warning, idx) => (
                <li key={idx} className="warning-item">
                  <span className="warning-bullet">!</span>
                  <p>{warning}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'sources' && (
          <div className="tab-pane-sources">
            <div className="sources-header">
              <Award size={20} className="award-icon" />
              <h5>Verified Medical Standards</h5>
            </div>
            <p className="sources-intro">
              This retrieval context was generated from the following accredited first aid guidelines and medical libraries:
            </p>
            <ul className="sources-list">
              {article.sources.map((source, idx) => (
                <li key={idx} className="source-item">
                  <span className="source-dot"></span>
                  <p>{source}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
