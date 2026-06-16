import React, { useState } from 'react';
import { Terminal, Database, FileText, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
import type { RAGLogEntry } from '../hooks/useRAG';

interface RAGStatusProps {
  logs: RAGLogEntry[];
  clearLogs: () => void;
  results: { article: any; score: number }[];
  activeArticle: any;
  isProcessing: boolean;
}

export const RAGStatus: React.FC<RAGStatusProps> = ({
  logs,
  clearLogs,
  results,
  activeArticle,
  isProcessing,
}) => {
  const [showPromptPreview, setShowPromptPreview] = useState(false);

  const getLogColor = (type: RAGLogEntry['type']) => {
    switch (type) {
      case 'retrieval':
        return 'text-cyan';
      case 'augmentation':
        return 'text-amber';
      case 'generation':
        return 'text-emerald';
      default:
        return 'text-slate-400';
    }
  };

  // Generate a mock System Prompt similar to what gets compiled in a real RAG server
  const getAugmentedPrompt = () => {
    if (!activeArticle) return '';
    return `[SYSTEM INSTRUCTIONS]
You are a specialized medical responder assistant. Below are verified first aid guidelines.
Synthesize the provided facts into a concise checklist for the user. Do not make up any medical procedures.

[RETRIEVED CONTEXT]
Document ID: ${activeArticle.id}
Title: ${activeArticle.title}
Severity: ${activeArticle.severity}
Immediate Actions: ${JSON.stringify(activeArticle.immediateActions, null, 2)}
Warnings: ${JSON.stringify(activeArticle.warnings, null, 2)}
Steps: ${JSON.stringify(activeArticle.steps, null, 2)}

[USER CONTEXT]
Location: Web Browser UI
Selected body part: ${activeArticle.bodyParts.join(', ')}

[ASSISTANT RESPONSE]
(Tailoring instructions for display... Checklists and emergency timers ready.)`;
  };

  return (
    <div className="rag-status-card">
      <div className="rag-status-header">
        <div className="title-section">
          <Database size={18} className="db-icon" />
          <h4>Client-Side RAG Pipeline Status</h4>
        </div>
        <div className="header-actions">
          {isProcessing && <div className="spinner-small"></div>}
          <button className="btn-icon-small" onClick={clearLogs} title="Clear pipeline logs">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Database / Vector Search Metrics */}
      <div className="rag-metrics">
        <div className="metric-box">
          <span className="metric-label">DB Index Size</span>
          <span className="metric-val">12 Documents</span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Relevance Score</span>
          <span className="metric-val text-cyan">
            {results.length > 0 ? `${results[0].score.toFixed(1)} pts` : '0.0 pts'}
          </span>
        </div>
        <div className="metric-box">
          <span className="metric-label">Retrieval Speed</span>
          <span className="metric-val text-emerald">{isProcessing ? 'Calculates...' : '40ms'}</span>
        </div>
      </div>

      {/* Candidate Documents List */}
      <div className="rag-candidates">
        <div className="candidate-header">Retrieved Documents Ranked</div>
        {results.length === 0 ? (
          <div className="candidate-empty">No documents retrieved yet. Click a body part or enter a query.</div>
        ) : (
          <ul className="candidate-list">
            {results.map((res) => (
              <li
                key={res.article.id}
                className={`candidate-item ${activeArticle?.id === res.article.id ? 'active' : ''}`}
              >
                <FileText size={12} className="doc-icon" />
                <span className="doc-title">{res.article.title}</span>
                <span className="doc-score">Score: {res.score.toFixed(1)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Collapsible Prompt Context Preview */}
      {activeArticle && (
        <div className="prompt-preview-container">
          <button
            className="prompt-preview-toggle"
            onClick={() => setShowPromptPreview(!showPromptPreview)}
          >
            <span>Augmented Context Prompt</span>
            {showPromptPreview ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
          {showPromptPreview && (
            <pre className="prompt-content">
              <code>{getAugmentedPrompt()}</code>
            </pre>
          )}
        </div>
      )}

      {/* Terminal Output Logs */}
      <div className="rag-logs-terminal">
        <div className="terminal-header">
          <Terminal size={14} />
          <span>Execution Console Logs</span>
        </div>
        <div className="terminal-body">
          {logs.length === 0 ? (
            <div className="log-empty">Waiting for retrieval events...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="log-row">
                <span className="log-time">[{log.timestamp}]</span>
                <span className={`log-type ${log.type}`}>[{log.type.toUpperCase()}]</span>
                <span className={`log-msg ${getLogColor(log.type)}`}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
