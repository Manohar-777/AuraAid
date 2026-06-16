import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, AlertTriangle, Activity } from 'lucide-react';

interface EmergencyTimerProps {
  type: 'cpr' | 'bleeding' | 'eyeflush' | 'none';
}

export const EmergencyTimer: React.FC<EmergencyTimerProps> = ({ type }) => {
  const [isActive, setIsActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [cprCount, setCprCount] = useState(0);
  const [cprPhase, setCprPhase] = useState<'PUSH' | 'RELEASE'>('PUSH');

  const timerRef = useRef<any | null>(null);
  const cprIntervalRef = useRef<any | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize timers based on type
  useEffect(() => {
    setIsActive(false);
    setCprCount(0);
    if (type === 'bleeding') {
      setSecondsLeft(600); // 10 minutes
      setTotalSeconds(600);
    } else if (type === 'eyeflush') {
      setSecondsLeft(900); // 15 minutes
      setTotalSeconds(900);
    } else {
      setSecondsLeft(0);
      setTotalSeconds(0);
    }

    return () => {
      stopAll();
    };
  }, [type]);

  const stopAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
  };

  // Web Audio API click synthesizer for CPR
  const playMetronomeClick = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      // High pitch for compression beats
      osc.frequency.setValueAtTime(1000, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn('Audio metronome click failed:', e);
    }
  };

  // General countdown timer logic
  useEffect(() => {
    if (isActive && (type === 'bleeding' || type === 'eyeflush') && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            stopAll();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsLeft, type]);

  // CPR Metronome logic: 110 beats per minute -> ~545ms interval
  useEffect(() => {
    if (isActive && type === 'cpr') {
      const intervalMs = Math.round(60000 / 110); // 110 BPM
      cprIntervalRef.current = setInterval(() => {
        setCprCount((prev) => prev + 1);
        setCprPhase((prev) => (prev === 'PUSH' ? 'RELEASE' : 'PUSH'));
        if (soundEnabled) {
          playMetronomeClick();
        }
      }, intervalMs);
    }

    return () => {
      if (cprIntervalRef.current) clearInterval(cprIntervalRef.current);
    };
  }, [isActive, type, soundEnabled]);

  if (type === 'none') return null;

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    stopAll();
    setCprCount(0);
    if (type === 'bleeding') {
      setSecondsLeft(600);
    } else if (type === 'eyeflush') {
      setSecondsLeft(900);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const percentProgress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;

  return (
    <div className={`emergency-timer-card ${type}`}>
      <div className="timer-badge">
        <Activity size={16} className="pulse-icon" />
        <span>EMERGENCY ASSISTANT ACTIVE</span>
      </div>

      {type === 'cpr' ? (
        <div className="cpr-coach-layout">
          <div className="cpr-header">
            <h4>Hands-Only CPR Metronome</h4>
            <p>Maintain chest compressions at 110 beats per minute (Stayin\' Alive pace)</p>
          </div>

          <div className="cpr-visualizer">
            {/* Pulsing indicator */}
            <div className={`cpr-pulse-circle ${isActive ? 'pulsing' : ''}`}>
              <div className="beat-text">{isActive ? cprPhase : 'PAUSED'}</div>
              <div className="compressions-count">{cprCount} compressions</div>
            </div>
          </div>

          <div className="cpr-controls">
            <button className="btn-primary" onClick={toggleTimer}>
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              {isActive ? 'Pause Coach' : 'Start CPR Coach'}
            </button>
            <button className="btn-secondary" onClick={resetTimer}>
              <RotateCcw size={18} /> Reset Counter
            </button>
            <button
              className={`btn-icon ${soundEnabled ? 'active' : ''}`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>

          <div className="cpr-instruction-callout">
            <AlertTriangle size={18} className="warn-icon" />
            <p>Push hard and fast in the center of the chest. Push 2 inches deep. Let the chest rise completely between pushes.</p>
          </div>
        </div>
      ) : (
        <div className="countdown-timer-layout">
          <div className="countdown-header">
            <h4>
              {type === 'bleeding'
                ? 'Wound Pressure Duration Timer'
                : 'Chemical Eye Irrigation Timer'}
            </h4>
            <p>
              {type === 'bleeding'
                ? 'Apply firm, continuous pressure on the wound. Do not lift dressing to look.'
                : 'Flush eye continuously with clean water. Keep eyelids open.'}
            </p>
          </div>

          <div className="circular-progress-container">
            <svg className="progress-ring" viewBox="0 0 120 120">
              <circle className="progress-ring-bg" cx="60" cy="60" r="50" />
              <circle
                className="progress-ring-bar"
                cx="60"
                cy="60"
                r="50"
                style={{
                  strokeDasharray: `${2 * Math.PI * 50}`,
                  strokeDashoffset: `${2 * Math.PI * 50 * (1 - percentProgress / 100)}`,
                }}
              />
            </svg>
            <div className="progress-text">
              <span className="time-display">{formatTime(secondsLeft)}</span>
              <span className="progress-status">{isActive ? 'RUNNING' : 'PAUSED'}</span>
            </div>
          </div>

          <div className="timer-controls">
            <button className="btn-primary" onClick={toggleTimer}>
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              {isActive ? 'Pause Timer' : 'Start Timer'}
            </button>
            <button className="btn-secondary" onClick={resetTimer}>
              <RotateCcw size={18} /> Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
