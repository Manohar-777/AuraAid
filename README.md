# AuraAid — First Aid Companion & Emergency Medical Guide

AuraAid is an interactive, premium first-aid assistant and emergency medical guide. It combines interactive 3D body mapping, structured offline guides, life-saving emergency timers (like a CPR metronome), and a simulated Retrieval-Augmented Generation (RAG) interface to provide swift, authoritative medical instruction in critical moments.

---

## 🌟 Key Features

- **Interactive 3D Body Map**: Pinpoint injuries on a fully interactive 3D human body model. Clicking different anatomical zones instantly filters the appropriate medical guides.
- **RAG-Powered Medical AI**: Simulated Retrieval-Augmented Generation (RAG) chat assistant that fetches, references, and synthesizes step-by-step instructions from trusted resources (e.g., Red Cross, WHO, CDC).
- **Emergency Action Timers**: Life-saving audio-visual guides, including a CPR metronome (100–120 BPM audio/visual pacing) and step-by-step emergency instructions for critical choking scenarios.
- **Dynamic First Aid Search**: Searchable repository of first-aid procedures covering burns, fractures, poisoning, insect/animal bites, and bleeding.
- **Premium UX/UI**: Sleek modern dark mode, glassmorphism UI components, fluid micro-interactions, and visual status indicators.

---

## 🛠️ Tech Stack

- **Framework**: React 19 (TypeScript)
- **Bundler & Dev Server**: Vite 8
- **3D Rendering**: Three.js, React Three Fiber (`@react-three/fiber`), and `@react-three/drei`
- **Styling**: Modern CSS with glassmorphic cards and HSL-based colors
- **Icons**: Lucide React

---

## 🚀 Getting Started

Follow these steps to run AuraAid locally:

### 1. Prerequisites

Make sure you have Node.js (version 18+ recommended) installed.

### 2. Installation

Clone this repository and navigate to the directory:

```bash
git clone https://github.com/Manohar-777/AuraAid.git
cd AuraAid
```

Install the required dependencies:

```bash
npm install
```

### 3. Run the Development Server

Start the local server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### 4. Build for Production

To build the static production files:

```bash
npm run build
```

The output will be generated inside the `dist/` directory.
