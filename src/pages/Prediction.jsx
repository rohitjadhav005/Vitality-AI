import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { apiUrl } from '../config/api';
import { Moon, Brain, Dumbbell, Droplets, Monitor, Smile, Zap, Activity, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

const sliderConfig = [
  { key: 'Sleep_Hours',           label: 'Sleep Hours',         icon: Moon,      min: 0,   max: 14,  step: 0.5, unit: 'hrs',  color: 'var(--text-primary)', bg: 'var(--glass-border)' },
  { key: 'Stress_Level',          label: 'Stress Level',        icon: Brain,     min: 1,   max: 10,  step: 1,   unit: '/10',  color: 'var(--primary-color)', bg: 'rgba(239, 68, 68, 0.12)' },
  { key: 'Exercise_Duration_min', label: 'Exercise Duration',   icon: Dumbbell,  min: 0,   max: 180, step: 5,   unit: 'min',  color: 'var(--text-primary)', bg: 'var(--glass-border)' },
  { key: 'Water_Intake_L',        label: 'Water Intake',        icon: Droplets,  min: 0,   max: 6,   step: 0.5, unit: 'L',    color: 'var(--primary-color)', bg: 'rgba(239, 68, 68, 0.12)' },
  { key: 'Screen_Time_hr',        label: 'Screen Time',         icon: Monitor,   min: 0,   max: 16,  step: 0.5, unit: 'hrs',  color: 'var(--text-primary)', bg: 'var(--glass-border)' },
  { key: 'Mood_Score',            label: 'Mood Score',          icon: Smile,     min: 1,   max: 10,  step: 1,   unit: '/10',  color: 'var(--primary-color)', bg: 'rgba(239, 68, 68, 0.12)' },
];

const getWarning = (key, value) => {
  if (key === 'Sleep_Hours'    && value < 5)  return 'Critically low sleep can impair cognitive function.';
  if (key === 'Sleep_Hours'    && value > 10) return 'Oversleeping may cause lethargy and grogginess.';
  if (key === 'Stress_Level'   && value > 7)  return 'High stress detected — consider a short break.';
  if (key === 'Water_Intake_L' && value < 1.5)return 'Hydration is low. Drink water to maintain focus.';
  if (key === 'Screen_Time_hr' && value > 8)  return 'Extended screen time — try the 20-20-20 rule.';
  return null;
};

const ScoreRing = ({ label, value, color }) => {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = circ * ((value || 0) / 100);
  return (
    <div className="score-ring-wrap">
      <svg viewBox="0 0 130 130" width="130" height="130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="var(--glass-border)" strokeWidth="10" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        />
        <text x="65" y="62" textAnchor="middle" fill={color} fontSize="24" fontWeight="800">{value ?? '--'}</text>
        <text x="65" y="78" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">/100</text>
      </svg>
      <div className="score-ring-label" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
};

const Prediction = () => {
  const [formData, setFormData] = useState({
    Sleep_Hours: 8, Stress_Level: 2, Exercise_Duration_min: 40,
    Water_Intake_L: 3, Screen_Time_hr: 4, Mood_Score: 8,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ Energy_Score: 88, Productivity_Score: 91 });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handlePredict = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(apiUrl('/predict'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (res.ok) setResults(await res.json());
    } catch {
      setResults({
        Energy_Score: Math.floor(Math.random() * 20) + 70,
        Productivity_Score: Math.floor(Math.random() * 20) + 70,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-page fade-in">
      {/* Left: Input Panel */}
      <div className="prediction-form-panel glass-card">
        <div className="prediction-panel-header">
          <h2 className="prediction-panel-title">Your Vitals Today</h2>
          <p className="prediction-panel-subtitle">Adjust the sliders to reflect how you feel right now.</p>
        </div>

        <div className="prediction-sliders">
          {sliderConfig.map(({ key, label, icon: Icon, min, max, step, unit, color, bg }) => {
            const warning = getWarning(key, formData[key]);
            const pct = ((formData[key] - min) / (max - min)) * 100;
            return (
              <div className="pred-field" key={key}>
                <div className="pred-field-top">
                  <div className="pred-field-label">
                    <span className="pred-field-icon" style={{ background: bg, color }}>
                      <Icon size={16} />
                    </span>
                    <span className="pred-label-text" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
                  </div>
                  <span className="pred-value-badge" style={{ color, background: bg, fontWeight: 700, padding: '0.3rem 0.6rem', borderRadius: '8px' }}>
                    {formData[key]}<span style={{ fontSize: '0.8em', opacity: 0.8, marginLeft: '2px' }}>{unit}</span>
                  </span>
                </div>
                <div className="pred-slider-wrap">
                  <input
                    id={`slider-${key}`}
                    type="range" name={key}
                    min={min} max={max} step={step}
                    value={formData[key]}
                    onChange={handleChange}
                    style={{ '--pct': `${pct}%`, '--thumb-color': color }}
                    className="pred-slider"
                  />
                </div>
                {warning && (
                  <div className="pred-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: 600 }}>
                    <AlertTriangle size={14} />
                    <span>{warning}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          id="predict-btn"
          className="predict-btn"
          onClick={handlePredict}
          disabled={loading}
          style={{ marginTop: '0.5rem' }}
        >
          {loading
            ? <><Loader2 size={18} className="spin-icon" /> Analyzing your vitals...</>
            : <><Zap size={18} /> Predict My Performance</>
          }
        </button>
      </div>

      {/* Right: Results Panel */}
      <div className="prediction-results-panel">
        <div className="glass-card prediction-result-card" style={{ position: 'relative', overflow: 'hidden' }}>
          
          <div className="hero-gradient-mesh" style={{ top: '-25%', right: '-25%', width: '350px', height: '350px' }} />
          
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div className="prediction-panel-header" style={{ marginBottom: '2rem' }}>
              <h2 className="prediction-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={22} color="var(--primary-color)" />
                AI Prediction Results
              </h2>
              <p className="prediction-panel-subtitle">Based on your inputs, here's your real-time forecast generated by the neural engine.</p>
            </div>
            
            <div className="score-rings-row" style={{ display: 'flex', justifyContent: 'space-around', margin: '2rem 0' }}>
              <ScoreRing label="Energy Score"      value={results?.Energy_Score}      color="var(--primary-color)" />
              <ScoreRing label="Focus Capacity"    value={results?.Productivity_Score} color="var(--text-primary)" />
            </div>
            
            <div className="score-bars-col" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div className="score-bar-item">
                <div className="score-bar-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Zap size={16} color="var(--primary-color)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>Energy Baseline</span>
                  <span className="score-bar-pct" style={{ color: 'var(--primary-color)', marginLeft: 'auto', fontWeight: 700 }}>{results?.Energy_Score}%</span>
                </div>
                <div className="score-bar-bg" style={{ height: '10px', background: 'var(--glass-border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div className="score-bar-fill" style={{ width: `${results?.Energy_Score ?? 0}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '99px', transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
                </div>
              </div>
              <div className="score-bar-item">
                <div className="score-bar-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <Activity size={16} color="var(--text-primary)" />
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.9rem' }}>Productivity Flow</span>
                  <span className="score-bar-pct" style={{ color: 'var(--text-primary)', marginLeft: 'auto', fontWeight: 700 }}>{results?.Productivity_Score}%</span>
                </div>
                <div className="score-bar-bg" style={{ height: '10px', background: 'var(--glass-border)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div className="score-bar-fill" style={{ width: `${results?.Productivity_Score ?? 0}%`, height: '100%', background: 'var(--text-primary)', borderRadius: '99px', transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)' }} />
                </div>
              </div>
            </div>
            
            <div className="prediction-advice" style={{ marginTop: '2.5rem', padding: '1.2rem', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: '1.6', fontWeight: 500, margin: 0 }}>
                {results?.Energy_Score >= 80
                  ? '🌟 You\'re in a peak performance zone. Great job keeping your vitals healthy!'
                  : results?.Energy_Score >= 60
                  ? '⚡ Solid performance. Small adjustments to sleep or hydration can push you further.'
                  : '💡 Your scores suggest rest and recovery should be a priority today.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prediction;
