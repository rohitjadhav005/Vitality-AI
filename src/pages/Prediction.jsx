import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { apiUrl } from '../config/api';
import { Moon, Brain, Dumbbell, Droplets, Monitor, Smile, Zap, Activity, Loader2, Sparkles, AlertTriangle, Frown, Meh, SmilePlus } from 'lucide-react';

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
    <div className="score-ring-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
      <div className="score-ring-label" style={{ fontWeight: 600, color: 'var(--text-secondary)', marginTop: '8px' }}>{label}</div>
    </div>
  );
};

// --- Custom Input Components ---

const EmojiSelector = ({ value, onChange, name, max = 10, reversed = false }) => {
  const emojis = reversed ? [
    { icon: <SmilePlus size={28} />, color: '#10b981', label: 'Low' },
    { icon: <Meh size={28} />, color: '#f59e0b', label: 'Moderate' },
    { icon: <Frown size={28} />, color: '#ef4444', label: 'High' }
  ] : [
    { icon: <Frown size={28} />, color: '#ef4444', label: 'Low' },
    { icon: <Meh size={28} />, color: '#f59e0b', label: 'Moderate' },
    { icon: <SmilePlus size={28} />, color: '#10b981', label: 'High' }
  ];

  const currentEmoji = value <= 3 ? emojis[0] : value <= 7 ? emojis[1] : emojis[2];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', color: currentEmoji.color, transition: 'color 0.2s' }}>
          {currentEmoji.icon}
        </span>
        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: currentEmoji.color }}>
          {value}/10
        </span>
      </div>
      <input
        type="range" name={name}
        min="1" max="10" step="1"
        value={value}
        onChange={onChange}
        className="pred-slider interactive-slider"
        style={{ '--pct': `${((value - 1) / 9) * 100}%`, '--thumb-color': currentEmoji.color }}
      />
    </div>
  );
};

const WaterTracker = ({ value, onChange, name }) => {
  const cups = Array.from({ length: 6 }, (_, i) => i + 1); // Up to 6 Liters
  
  const handleClick = (cupValue) => {
    onChange({ target: { name, value: cupValue } });
  };

  return (
    <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '8px' }}>
      {cups.map((cup) => (
        <button
          key={cup}
          type="button"
          onClick={() => handleClick(cup)}
          style={{
            background: value >= cup ? 'rgba(59, 130, 246, 0.15)' : 'var(--glass-border)',
            border: `1.5px solid ${value >= cup ? '#3b82f6' : 'transparent'}`,
            borderRadius: '10px',
            padding: '6px 4px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minWidth: '0'
          }}
        >
          <Droplets size={16} color={value >= cup ? '#3b82f6' : 'var(--text-secondary)'} style={{ marginBottom: '2px' }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: value >= cup ? '#3b82f6' : 'var(--text-secondary)' }}>{cup}L</span>
        </button>
      ))}
    </div>
  );
};

const SliderWithPresets = ({ value, onChange, name, min, max, step, presets, unit, color }) => {
  const pct = ((value - min) / (max - min)) * 100;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', width: '100%' }}>
        {presets.map(preset => (
          <button
            key={preset.value}
            type="button"
            onClick={() => onChange({ target: { name, value: preset.value } })}
            style={{
              padding: '4px 6px',
              borderRadius: '12px',
              background: value === preset.value ? color : 'var(--glass-bg)',
              color: value === preset.value ? (color === 'var(--text-primary)' ? 'var(--bg-color)' : '#fff') : 'var(--text-secondary)',
              border: `1px solid ${value === preset.value ? color : 'var(--glass-border)'}`,
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              flex: 1,
              minWidth: '0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textAlign: 'center'
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <input
        type="range" name={name}
        min={min} max={max} step={step}
        value={value}
        onChange={onChange}
        style={{ '--pct': `${pct}%`, '--thumb-color': color }}
        className="pred-slider"
      />
    </div>
  );
};

const Prediction = () => {
  const [formData, setFormData] = useState({
    Sleep_Hours: 8, Stress_Level: 2, Exercise_Duration_min: 40,
    Water_Intake_L: 3, Screen_Time_hr: 4, Mood_Score: 8,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

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
      if (res.ok) {
        setResults(await res.json());
      } else {
        throw new Error("Failed to fetch");
      }
    } catch {
      // Fallback mock logic for testing
      setResults({
        Energy_Score: Math.floor(Math.random() * 20) + 70,
        Productivity_Score: Math.floor(Math.random() * 20) + 70,
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (key, label, icon, content) => {
    const warning = getWarning(key, formData[key]);
    return (
      <div className="pred-field interactive-card" key={key} style={{
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1.2rem',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        transition: 'transform 0.2s ease',
      }}>
        <div className="pred-field-top" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="pred-field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pred-field-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--primary-color)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              {icon}
            </span>
            <span className="pred-label-text" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem' }}>{label}</span>
          </div>
          {key !== 'Stress_Level' && key !== 'Mood_Score' && (
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              {formData[key]}
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: '2px' }}>
                {key === 'Sleep_Hours' ? ' hrs' : key === 'Exercise_Duration_min' ? ' mins' : key === 'Screen_Time_hr' ? ' hrs' : key === 'Water_Intake_L' ? ' L' : ''}
              </span>
            </span>
          )}
        </div>
        {content}
        {warning && (
          <div className="pred-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', color: 'var(--primary-color)', fontSize: '0.82rem', fontWeight: 600, background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '8px' }}>
            <AlertTriangle size={14} />
            <span>{warning}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="prediction-page fade-in" style={{ padding: 'clamp(1rem, 3vw, 2rem) 0' }}>
      
      {/* Left: Input Panel */}
      <div className="prediction-form-panel">
        <div className="prediction-panel-header" style={{ marginBottom: 'clamp(1.5rem, 3vw, 2rem)' }}>
          <h2 className="prediction-panel-title" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.2 }}>How are you feeling?</h2>
          <p className="prediction-panel-subtitle" style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: 'var(--text-secondary)' }}>Log your daily vitals to get an accurate AI-driven energy forecast.</p>
        </div>

        <div className="prediction-interactive-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          
          {renderField('Mood_Score', 'Mood & Vibe', <Smile size={20} />, 
            <EmojiSelector value={formData.Mood_Score} onChange={handleChange} name="Mood_Score" />
          )}

          {renderField('Stress_Level', 'Stress Level', <Brain size={20} />, 
            <EmojiSelector value={formData.Stress_Level} onChange={handleChange} name="Stress_Level" reversed />
          )}

          {renderField('Water_Intake_L', 'Hydration (Liters)', <Droplets size={20} />, 
            <WaterTracker value={formData.Water_Intake_L} onChange={handleChange} name="Water_Intake_L" />
          )}

          {renderField('Sleep_Hours', 'Sleep Duration', <Moon size={20} />, 
            <SliderWithPresets 
              value={formData.Sleep_Hours} onChange={handleChange} name="Sleep_Hours" 
              min={0} max={14} step={0.5} color="var(--text-primary)"
              presets={[
                { label: '4h', value: 4 }, { label: '6h', value: 6 }, 
                { label: '8h', value: 8 }, { label: '10h', value: 10 }
              ]}
            />
          )}

          {renderField('Exercise_Duration_min', 'Exercise (Minutes)', <Dumbbell size={20} />, 
            <SliderWithPresets 
              value={formData.Exercise_Duration_min} onChange={handleChange} name="Exercise_Duration_min" 
              min={0} max={180} step={5} color="var(--primary-color)"
              presets={[
                { label: 'None', value: 0 }, { label: '15m (Light)', value: 15 }, 
                { label: '45m (Mod)', value: 45 }, { label: '90m (Intense)', value: 90 }
              ]}
            />
          )}

          {renderField('Screen_Time_hr', 'Screen Time (Hours)', <Monitor size={20} />, 
            <SliderWithPresets 
              value={formData.Screen_Time_hr} onChange={handleChange} name="Screen_Time_hr" 
              min={0} max={16} step={0.5} color="var(--text-primary)"
              presets={[
                { label: '2h', value: 2 }, { label: '4h', value: 4 }, 
                { label: '8h', value: 8 }, { label: '12h+', value: 12 }
              ]}
            />
          )}

        </div>

        <button
          id="predict-btn"
          className="predict-btn"
          onClick={handlePredict}
          disabled={loading}
          style={{
            width: '100%',
            maxWidth: '380px',
            margin: '2rem auto 0 auto',
            padding: 'clamp(1rem, 3vw, 1.2rem)',
            fontSize: 'clamp(1.05rem, 3vw, 1.2rem)',
            fontWeight: 800,
            fontFamily: 'inherit',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary-color), #f43f5e)',
            boxShadow: '0 8px 20px rgba(239, 68, 68, 0.3)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(239, 68, 68, 0.45)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.3)';
          }}
        >
          {loading
            ? <><Loader2 size={24} className="spin-icon" /> Analyzing your vitals...</>
            : <><Zap size={24} /> Generate My Forecast</>
          }
        </button>
      </div>

      {/* Right: Results Panel */}
      <div className="prediction-results-panel" style={{ position: 'relative', height: 'fit-content' }}>
        {results ? (
          <div className="glass-card prediction-result-card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
            <div className="hero-gradient-mesh" style={{ top: '-10%', right: '-10%', width: '300px', height: '300px', opacity: 0.5 }} />
            
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="prediction-panel-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '50%', marginBottom: '1rem' }}>
                  <Sparkles size={32} color="var(--primary-color)" />
                </div>
                <h2 className="prediction-panel-title" style={{ fontSize: 'clamp(1.4rem, 4vw, 1.8rem)' }}>Your Daily Forecast</h2>
                <p className="prediction-panel-subtitle" style={{ fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>Here is your predicted performance capacity based on your vitals.</p>
              </div>
              
              <div className="score-rings-row" style={{ display: 'flex', justifyContent: 'space-around', margin: 'clamp(1.5rem, 4vw, 3rem) 0', gap: '1rem', flexWrap: 'wrap' }}>
                <ScoreRing label="Energy Level"      value={results?.Energy_Score}      color="var(--primary-color)" />
                <ScoreRing label="Focus Potential"    value={results?.Productivity_Score} color="var(--text-primary)" />
              </div>
              
              <div className="prediction-advice" style={{ marginTop: '2rem', padding: 'clamp(1rem, 3vw, 1.5rem)', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-primary)', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', lineHeight: '1.6', fontWeight: 600, margin: 0 }}>
                  {results?.Energy_Score >= 80
                    ? '🌟 Exceptional! You are primed for deep work and high performance today. Tackle your hardest tasks first!'
                    : results?.Energy_Score >= 60
                    ? '⚡ Solid baseline. You have steady energy, but remember to take breaks to sustain it.'
                    : '💡 Your vitals suggest fatigue. Focus on light tasks and prioritize recovery tonight.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
           <div className="glass-card prediction-result-card" style={{ padding: 'clamp(2rem, 5vw, 3rem)', borderRadius: '24px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', opacity: 0.7 }}>
              <Activity size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-primary)', fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', marginBottom: '0.5rem', textAlign: 'center' }}>Awaiting Input</h3>
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '90%', fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>Fill out your vitals and click "Generate My Forecast" to see your AI predictions here.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;

