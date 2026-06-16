import { ShieldAlert, Heart, PhoneCall, Info, HelpCircle } from 'lucide-react';
import { useRAG } from './hooks/useRAG';
import { BodyMap } from './components/BodyMap';
import { SearchBar } from './components/SearchBar';
import { QuickActions } from './components/QuickActions';
import { InstructionViewer } from './components/InstructionViewer';
import { RAGStatus } from './components/RAGStatus';

function App() {
  const {
    query,
    setQuery,
    selectedBodyPart,
    setSelectedBodyPart,
    results,
    activeArticle,
    setActiveArticleById,
    logs,
    clearLogs,
    isProcessing,
  } = useRAG();

  const handleQuickActionSelect = (id: string) => {
    // Clear search query and body parts
    setQuery('');
    setSelectedBodyPart(null);
    // Directly set active article
    setActiveArticleById(id);
  };

  const handleBodyPartSelect = (part: string | null) => {
    setSelectedBodyPart(part);
  };

  return (
    <div className="app-container">
      {/* Top Banner Warning */}
      <div className="emergency-banner">
        <div className="banner-content">
          <ShieldAlert size={18} className="banner-icon animate-pulse" />
          <span>If someone is unconscious, bleeding uncontrollably, or cannot breathe: <strong>CALL EMERGENCY SERVICES IMMEDIATELY</strong></span>
        </div>
        <div className="emergency-hotlines">
          <a href="tel:911" className="hotline-btn">
            <PhoneCall size={14} />
            <span>Call 911 (US)</span>
          </a>
          <a href="tel:112" className="hotline-btn">
            <PhoneCall size={14} />
            <span>Call 112 (EU)</span>
          </a>
          <a href="tel:112" className="hotline-btn">
            <PhoneCall size={14} />
            <span>Call 112 (India)</span>
          </a>
        </div>
      </div>

      {/* Main Header */}
      <header className="app-header">
        <div className="header-logo">
          <div className="logo-icon-wrapper">
            <Heart size={24} className="logo-icon" />
          </div>
          <div className="logo-text">
            <h1>AuraAid <span>RAG-Powered First Responder</span></h1>
            <p>Instant Medical Retrieval System</p>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Quick Emergency Actions */}
        <QuickActions
          onSelectArticle={handleQuickActionSelect}
          activeId={activeArticle?.id}
        />

        {/* Dynamic Search Bar */}
        <SearchBar
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
        />

        {/* Dashboard Grid Layout */}
        <div className="dashboard-grid">
          {/* Left Panel: Anatomy Locator */}
          <section className="grid-panel panel-left">
            <BodyMap
              selectedPart={selectedBodyPart}
              onPartSelect={handleBodyPartSelect}
            />
          </section>

          {/* Right Panel: Protocol Display */}
          <section className="grid-panel panel-right">
            {activeArticle ? (
              <InstructionViewer
                article={activeArticle}
                isLoading={isProcessing}
              />
            ) : (
              <div className="viewer-empty-placeholder">
                <div className="placeholder-content">
                  <div className="glowing-circle">
                    <HelpCircle size={40} className="pulse-icon" />
                  </div>
                  <h3>Waiting for Selection</h3>
                  <p>
                    Please click a body part on the anatomical model (e.g. Head, Chest, Arms) or type symptoms in the search bar above to fetch the first aid protocol.
                  </p>
                  <div className="info-pills">
                    <div className="info-pill">
                      <Info size={14} />
                      <span>100% Client-Side Retrieval</span>
                    </div>
                    <div className="info-pill">
                      <Info size={14} />
                      <span>Interactive check-off guides</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RAG Pipeline logs and status */}
        <RAGStatus
          logs={logs}
          clearLogs={clearLogs}
          results={results}
          activeArticle={activeArticle}
          isProcessing={isProcessing}
        />
      </main>

      {/* Global Disclaimer Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div className="disclaimer-title">
            <Info size={16} />
            <h5>MEDICAL DISCLAIMER</h5>
          </div>
          <p className="disclaimer-text">
            This application is a simulated RAG (Retrieval-Augmented Generation) first aid assistant designed for educational and demonstration purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult certified medical practitioners or call your local emergency response services (911 / 112 / 999) in life-threatening situations. The 3D anatomy model is a stylized representation and may not accurately reflect human anatomy. Do not delay seeking professional care based on information presented here.
          </p>
          <div className="footer-credits">
            <p>&copy; {new Date().getFullYear()} AuraAid — RAG-Powered First Aid Companion. Built with React, Three.js &amp; Gemini AI. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
