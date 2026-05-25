import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckCircle2, Clock, TrendingUp, Zap, Moon, Droplets, Dumbbell, Brain, X, Sparkles } from 'lucide-react';

const initialGoals = [
  { id: 1, title: 'Sleep 8 Hours Daily', category: 'sleep', target: 8, current: 6.5, unit: 'hrs', deadline: '2026-06-01', status: 'in-progress', icon: 'moon' },
  { id: 2, title: 'Reduce Stress Below 3', category: 'stress', target: 3, current: 5, unit: '/10', deadline: '2026-05-30', status: 'in-progress', icon: 'brain' },
  { id: 3, title: 'Exercise 45 Min Daily', category: 'exercise', target: 45, current: 45, unit: 'min', deadline: '2026-05-25', status: 'completed', icon: 'dumbbell' },
  { id: 4, title: 'Drink 3L Water Daily', category: 'hydration', target: 3, current: 2.1, unit: 'L', deadline: '2026-06-10', status: 'in-progress', icon: 'droplets' },
  { id: 5, title: 'Energy Score Above 85', category: 'energy', target: 85, current: 72, unit: 'pts', deadline: '2026-06-15', status: 'in-progress', icon: 'zap' },
];

const iconMap = { moon: Moon, brain: Brain, dumbbell: Dumbbell, droplets: Droplets, zap: Zap };
const categoryColors = {
  sleep: { color: 'var(--text-primary)', bg: 'var(--glass-border)' },
  stress: { color: 'var(--primary-color)', bg: 'rgba(239, 68, 68, 0.12)' },
  exercise: { color: 'var(--text-primary)', bg: 'var(--glass-border)' },
  hydration: { color: 'var(--primary-color)', bg: 'rgba(239, 68, 68, 0.12)' },
  energy: { color: 'var(--primary-color)', bg: 'rgba(239, 68, 68, 0.12)' },
};

const CircleProgress = ({ percent, color, size = 65 }) => {
  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--glass-border)" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
    </svg>
  );
};

const GoalCard = ({ goal, onDelete, onComplete }) => {
  const Icon = iconMap[goal.icon] || Target;
  const col = categoryColors[goal.category] || { color: 'var(--text-primary)', bg: 'var(--glass-border)' };
  const progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const isCompleted = goal.status === 'completed';

  return (
    <div className={`goal-card-pro glass-card ${isCompleted ? 'goal-completed' : ''}`} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative', overflow: 'hidden', borderLeft: `4px solid ${col.color}`, transition: 'all 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: col.bg, width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color={col.color} />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: col.color, marginBottom: '0.2rem' }}>
              {goal.category}
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{goal.title}</h3>
          </div>
        </div>
        
        {isCompleted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--primary-color)', padding: '0.4rem 0.8rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
            <CheckCircle2 size={14} /> Achieved!
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button onClick={() => onComplete(goal.id)} title="Mark Complete" style={{ background: 'var(--glass-hover)', border: 'none', color: 'var(--text-secondary)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}>
              <CheckCircle2 size={16} />
            </button>
            <button onClick={() => onDelete(goal.id)} title="Delete" style={{ background: 'var(--glass-hover)', border: 'none', color: 'var(--text-secondary)', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--primary-color)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}>
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1 }}>
        <div style={{ flex: 1, paddingRight: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1.2rem', fontWeight: 500 }}>
            <Clock size={14} />
            <span>Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: col.color, fontSize: '1.25rem', fontWeight: 700 }}>{goal.current}<span style={{fontSize: '0.7em', marginLeft: '2px'}}>{goal.unit}</span></span>
            <span style={{ color: 'var(--text-secondary)' }}>/</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{goal.target}{goal.unit}</span>
          </div>
          <div style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: col.color, borderRadius: '99px', transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircleProgress percent={progress} color={col.color} size={60} />
          <div style={{ position: 'absolute', color: col.color, fontSize: '0.8rem', fontWeight: 700 }}>{progress}%</div>
        </div>
      </div>
    </div>
  );
};

const Goals = () => {
  const [goals, setGoals] = useState(initialGoals);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [newGoal, setNewGoal] = useState({ title: '', category: 'sleep', target: '', current: '', unit: '', deadline: '', icon: 'moon' });

  const handleDelete = (id) => setGoals(g => g.filter(x => x.id !== id));
  const handleComplete = (id) => setGoals(g => g.map(x => x.id === id ? { ...x, status: 'completed', current: x.target } : x));

  const handleAdd = () => {
    if (!newGoal.title || !newGoal.target) return;
    setGoals(g => [...g, { ...newGoal, id: Date.now(), status: 'in-progress', target: parseFloat(newGoal.target), current: parseFloat(newGoal.current) || 0 }]);
    setNewGoal({ title: '', category: 'sleep', target: '', current: '', unit: '', deadline: '', icon: 'moon' });
    setShowModal(false);
  };

  const filtered = filter === 'all' ? goals : goals.filter(g => g.status === filter);
  const completed = goals.filter(g => g.status === 'completed').length;
  const total = goals.length;

  return (
    <div className="goals-page fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header & Summary */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={24} color="var(--primary-color)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Health Goals</h1>
        </div>
        
        <div className="goals-summary-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{total}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Goals</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>{completed}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Completed</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-secondary)' }}>{total - completed}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>In Progress</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(0,0,0,0))' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-color)' }}>{total > 0 ? Math.round((completed / total) * 100) : 0}%</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Success Rate</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="goals-filter-tabs">
          {['all', 'in-progress', 'completed'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Goals' : f === 'in-progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ background: 'var(--primary-color)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '99px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.length > 0 ? filtered.map(g => (
          <GoalCard key={g.id} goal={g} onDelete={handleDelete} onComplete={handleComplete} />
        )) : (
          <div className="glass-card" style={{ gridColumn: '1 / -1', padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--glass-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={28} color="var(--primary-color)" />
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.2rem' }}>No goals found</h3>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Click "New Goal" to set a health target and track your progress.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-color)', border: '1px solid var(--glass-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Set a New Goal</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'var(--glass-hover)', border: 'none', color: 'var(--text-secondary)', padding: '0.4rem', borderRadius: '50%', cursor: 'pointer' }}><X size={20} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Goal Title</label>
                <input style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }} type="text" placeholder="e.g. Sleep 8 hours" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 140px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Category</label>
                  <select style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }} value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value, icon: { sleep: 'moon', stress: 'brain', exercise: 'dumbbell', hydration: 'droplets', energy: 'zap' }[e.target.value] || 'zap'})}>
                    <option value="sleep">Sleep</option>
                    <option value="stress">Stress</option>
                    <option value="exercise">Exercise</option>
                    <option value="hydration">Hydration</option>
                    <option value="energy">Energy</option>
                  </select>
                </div>
                <div style={{ flex: '1 1 140px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Unit</label>
                  <input style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }} type="text" placeholder="hrs, L, min..." value={newGoal.unit} onChange={e => setNewGoal({...newGoal, unit: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: '1 1 140px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Target Value</label>
                  <input style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }} type="number" placeholder="8" value={newGoal.target} onChange={e => setNewGoal({...newGoal, target: e.target.value})} />
                </div>
                <div style={{ flex: '1 1 140px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Current Value</label>
                  <input style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }} type="number" placeholder="0" value={newGoal.current} onChange={e => setNewGoal({...newGoal, current: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Deadline</label>
                <input style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg)', color: 'var(--text-primary)' }} type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, padding: '0.6rem 1.2rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAdd} style={{ background: 'var(--primary-color)', border: 'none', color: '#fff', fontWeight: 600, padding: '0.6rem 1.5rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Plus size={16} /> Create Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
