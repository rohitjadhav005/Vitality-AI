import React, { useState } from 'react';
import { Target, Plus, Trash2, CheckCircle2, Clock, TrendingUp, Zap, Moon, Droplets, Dumbbell, Brain, X, Sparkles, Award } from 'lucide-react';

import { apiUrl } from '../config/api';
import { useRealtime } from '../hooks/useRealtime';

const initialGoals = [
  { id: 1, title: 'Sleep 8 Hours Daily', category: 'sleep', target: 8, current: 6.5, unit: 'hrs', deadline: '2026-06-01', status: 'in-progress', icon: 'moon', metricKey: 'Sleep_Quality' },
  { id: 2, title: 'Reduce Stress Below 3', category: 'stress', target: 3, current: 5, unit: '/10', deadline: '2026-05-30', status: 'in-progress', icon: 'brain', metricKey: 'Stress_Level' },
  { id: 3, title: 'Exercise 45 Min Daily', category: 'exercise', target: 45, current: 45, unit: 'min', deadline: '2026-05-25', status: 'completed', icon: 'dumbbell' },
  { id: 4, title: 'Drink 3L Water Daily', category: 'hydration', target: 3, current: 2.1, unit: 'L', deadline: '2026-06-10', status: 'in-progress', icon: 'droplets' },
  { id: 5, title: 'Energy Score Above 85', category: 'energy', target: 85, current: 72, unit: 'pts', deadline: '2026-06-15', status: 'in-progress', icon: 'zap', metricKey: 'Energy_Score' },
];

const iconMap = { moon: Moon, brain: Brain, dumbbell: Dumbbell, droplets: Droplets, zap: Zap };

const CircleProgress = ({ percent, color, size = 56 }) => {
  const strokeWidth = 5;
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
  
  // Calculate progress dynamically based on target and current values
  let progress = 0;
  if (goal.category === 'stress') {
    // For stress, lower is better. Target is 3, max stress is 10.
    // If current is 3 or below, it's 100%. If current is 10, it's 0%.
    progress = goal.current <= goal.target ? 100 : Math.max(0, Math.round(((10 - goal.current) / (10 - goal.target)) * 100));
  } else {
    progress = Math.min(100, Math.round((goal.current / goal.target) * 100));
  }
  
  const isCompleted = goal.status === 'completed' || progress >= 100;

  return (
    <div className={`goal-card-pro goal-cat-${goal.category} ${isCompleted ? 'goal-completed' : ''}`}>
      <div className="card-bg-glow" />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ background: 'var(--cat-bg)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color="var(--cat-color)" />
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.75px', color: 'var(--cat-color)', marginBottom: '0.15rem' }}>
              {goal.category}
            </div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>{goal.title}</h3>
          </div>
        </div>
        
        {isCompleted ? (
          <div className="goal-completed-badge">
            <CheckCircle2 size={13} /> Achieved!
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="action-btn complete" onClick={() => onComplete(goal.id)} title="Mark Complete">
              <CheckCircle2 size={15} />
            </button>
            <button className="action-btn delete" onClick={() => onDelete(goal.id)} title="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', position: 'relative', zIndex: 1, marginTop: 'auto' }}>
        <div style={{ flex: 1, paddingRight: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem', marginBottom: '0.8rem', fontWeight: 500 }}>
            <Clock size={13} />
            <span>Deadline: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--cat-color)', fontSize: '1.35rem', fontWeight: 800 }}>{goal.current}<span style={{fontSize: '0.7em', marginLeft: '2px', fontWeight: 600}}>{goal.unit}</span></span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>/</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>{goal.target}{goal.unit}</span>
          </div>
          <div className="goal-progress-bar-bg" style={{ height: '6px', background: 'var(--glass-border)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--cat-color)', borderRadius: '99px', transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <CircleProgress percent={progress} color="var(--cat-color)" size={52} />
          <div style={{ position: 'absolute', color: 'var(--cat-color)', fontSize: '0.75rem', fontWeight: 800 }}>{progress}%</div>
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

  // Fetch live health metrics to update goal progress
  const fetchLiveMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(apiUrl('/api/dashboard/summary'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGoals(prev => prev.map(goal => {
          if (goal.metricKey && data[goal.metricKey] !== undefined) {
            return { ...goal, current: parseFloat(data[goal.metricKey].toFixed(1)) };
          }
          return goal;
        }));
      }
    } catch (e) {
      console.error('Failed to sync live metrics for goals', e);
    }
  };

  React.useEffect(() => {
    fetchLiveMetrics();
  }, []);

  useRealtime(fetchLiveMetrics);

  const handleDelete = (id) => setGoals(g => g.filter(x => x.id !== id));
  const handleComplete = (id) => setGoals(g => g.map(x => x.id === id ? { ...x, status: 'completed', current: x.target } : x));

  const handleAdd = () => {
    if (!newGoal.title || !newGoal.target) return;
    setGoals(g => [...g, { ...newGoal, id: Date.now(), status: 'in-progress', target: parseFloat(newGoal.target), current: parseFloat(newGoal.current) || 0 }]);
    setNewGoal({ title: '', category: 'sleep', target: '', current: '', unit: '', deadline: '', icon: 'moon' });
    setShowModal(false);
  };

  const filtered = filter === 'all' ? goals : goals.filter(g => g.status === filter);
  const completed = goals.filter(g => g.status === 'completed' || (g.category === 'stress' ? g.current <= g.target : (g.current / g.target) >= 1)).length;
  const total = goals.length;

  return (
    <div className="goals-page fade-in">
      {/* Summary Stats Row */}
      <div className="goals-summary-row">
        <div className="goals-stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366F1' }}>
            <Target size={20} />
          </div>
          <div className="stat-num">{total}</div>
          <div className="stat-lbl">Active Goals</div>
        </div>
        <div className="goals-stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
            <Award size={20} />
          </div>
          <div className="stat-num">{completed}</div>
          <div className="stat-lbl">Completed</div>
        </div>
        <div className="goals-stat-card">
          <div className="stat-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
            <Clock size={20} />
          </div>
          <div className="stat-num">{total - completed}</div>
          <div className="stat-lbl">In Progress</div>
        </div>
        <div className="goals-stat-card" style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), var(--glass-bg))' }}>
          <div className="stat-icon-box">
            <TrendingUp size={20} />
          </div>
          <div className="stat-num">{total > 0 ? Math.round((completed / total) * 100) : 0}%</div>
          <div className="stat-lbl">Success Rate</div>
        </div>
      </div>

      {/* Controls & Filter */}
      <div className="goals-controls">
        <div className="goals-filter-tabs">
          {['all', 'in-progress', 'completed'].map(f => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All Goals' : f === 'in-progress' ? 'In Progress' : 'Completed'}
            </button>
          ))}
        </div>
        <button onClick={() => setShowModal(true)} className="add-goal-btn">
          <Plus size={18} /> New Goal
        </button>
      </div>

      {/* Goals Grid */}
      <div className="goals-grid">
        {filtered.length > 0 ? (
          filtered.map(g => (
            <GoalCard key={g.id} goal={g} onDelete={handleDelete} onComplete={handleComplete} />
          ))
        ) : (
          <div className="goals-empty">
            <div className="empty-icon-wrap">
              <Sparkles size={30} />
            </div>
            <div>
              <h3>No goals found</h3>
              <p>Click "New Goal" to set a health target and track your progress.</p>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Set a New Goal</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-row">
                <label>Goal Title</label>
                <input 
                  className="modal-input" 
                  type="text" 
                  placeholder="e.g. Sleep 8 hours daily" 
                  value={newGoal.title} 
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})} 
                />
              </div>
              
              <div className="form-row-2col">
                <div className="form-row">
                  <label>Category</label>
                  <select 
                    className="modal-input" 
                    value={newGoal.category} 
                    onChange={e => setNewGoal({
                      ...newGoal, 
                      category: e.target.value, 
                      icon: { sleep: 'moon', stress: 'brain', exercise: 'dumbbell', hydration: 'droplets', energy: 'zap' }[e.target.value] || 'zap'
                    })}
                  >
                    <option value="sleep">Sleep</option>
                    <option value="stress">Stress</option>
                    <option value="exercise">Exercise</option>
                    <option value="hydration">Hydration</option>
                    <option value="energy">Energy</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Unit</label>
                  <input 
                    className="modal-input" 
                    type="text" 
                    placeholder="e.g. hrs, L, min, %" 
                    value={newGoal.unit} 
                    onChange={e => setNewGoal({...newGoal, unit: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="form-row-2col">
                <div className="form-row">
                  <label>Target Value</label>
                  <input 
                    className="modal-input" 
                    type="number" 
                    placeholder="e.g. 8" 
                    value={newGoal.target} 
                    onChange={e => setNewGoal({...newGoal, target: e.target.value})} 
                  />
                </div>
                <div className="form-row">
                  <label>Current Value</label>
                  <input 
                    className="modal-input" 
                    type="number" 
                    placeholder="e.g. 0" 
                    value={newGoal.current} 
                    onChange={e => setNewGoal({...newGoal, current: e.target.value})} 
                  />
                </div>
              </div>
              
              <div className="form-row">
                <label>Deadline</label>
                <input 
                  className="modal-input" 
                  type="date" 
                  value={newGoal.deadline} 
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} 
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="modal-confirm" onClick={handleAdd}>
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
