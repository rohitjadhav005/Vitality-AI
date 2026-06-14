import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, ChevronUp, ChevronDown, Calendar, Zap, Brain, Moon, Eye } from 'lucide-react';
import { apiUrl } from '../config/api';
import { useRealtime } from '../hooks/useRealtime';

const getEnergyClass = (score) => score >= 80 ? 'score-high' : score >= 55 ? 'score-mid' : 'score-low';

const ScorePill = ({ value }) => (
  <span className={`score-pill ${getEnergyClass(value)}`}>{value}</span>
);

const MiniBar = ({ value, max = 100, color }) => (
  <div className="mini-bar-bg">
    <div className="mini-bar-fill" style={{ width: `${(value / max) * 100}%`, background: color }} />
  </div>
);

const History = () => {
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [sortKey, setSortKey]       = useState('date');
  const [sortDir, setSortDir]       = useState('desc');
  const [selectedRow, setSelectedRow] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('/api/history'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setHistory(await res.json());
    } catch (e) {
      console.error('Failed to fetch history', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useRealtime(fetchHistory);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const SortIcon = ({ k }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />)
    : <ChevronDown size={13} style={{ opacity: 0.25 }} />;

  const filtered = history
    .filter(r =>
      r.date.includes(search) ||
      String(r.energy_score).includes(search) ||
      String(r.productivity_score).includes(search)
    )
    .sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const avgEnergy = history.length ? Math.round(history.reduce((a, b) => a + b.energy_score, 0) / history.length) : 0;
  const avgProd   = history.length ? Math.round(history.reduce((a, b) => a + b.productivity_score, 0) / history.length) : 0;
  const avgSleep  = history.length ? (history.reduce((a, b) => a + b.sleep_hours, 0) / history.length).toFixed(1) : '0.0';

  const exportCSV = () => {
    if (!history.length) return;
    const header = 'Date,Sleep (hrs),Stress,Energy Score,Productivity Score';
    const rows = history.map(r => `${r.date},${r.sleep_hours},${r.stress_level},${r.energy_score},${r.productivity_score}`);
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'vitality_history.csv'; a.click();
  };

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>Loading your history...</span>
    </div>
  );

  const summaryStats = [
    { label: 'Total Sessions', value: history.length,  color: '#EF4444', Icon: Calendar },
    { label: 'Avg Energy',     value: `${avgEnergy}%`, color: '#EF4444', Icon: Zap },
    { label: 'Avg Productivity',value: `${avgProd}%`,  color: '#EF4444', Icon: Brain },
    { label: 'Avg Sleep',      value: `${avgSleep}h`,  color: '#EF4444', Icon: Moon },
  ];

  return (
    <div className="history-page fade-in">

      {/* Summary Cards */}
      <div className="history-summary-row">
        {summaryStats.map((s, i) => (
          <div key={i} className="history-stat glass-card">
            <div className="hstat-icon" style={{ background: s.color + '18' }}>
              <s.Icon size={18} color={s.color} />
            </div>
            <div>
              <div className="hstat-val">{s.value}</div>
              <div className="hstat-lbl">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Export */}
      <div className="history-controls glass-card">
        <div className="history-search">
          <Search size={15} color="var(--text-secondary)" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Search by date or score..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="history-search-input"
          />
        </div>
        <div className="history-ctrl-right">
          <button id="history-export-btn" className="history-export-btn" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Table or Empty State */}
      {filtered.length > 0 ? (
        <div className="glass-card history-table-card">
          <table className="history-table-pro">
            <thead>
              <tr>
                {[
                  { key: 'date',               label: 'Date' },
                  { key: 'sleep_hours',        label: 'Sleep' },
                  { key: 'stress_level',       label: 'Stress' },
                  { key: 'energy_score',       label: 'Energy' },
                  { key: 'productivity_score', label: 'Productivity' },
                ].map(col => (
                  <th key={col.key} onClick={() => handleSort(col.key)} className="sortable-th">
                    {col.label} <SortIcon k={col.key} />
                  </th>
                ))}
                <th>Bars</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(record => (
                <React.Fragment key={record.id}>
                  <tr className={`history-row ${selectedRow === record.id ? 'selected-row' : ''}`}>
                    <td className="date-cell">
                      <Calendar size={12} style={{ marginRight: '6px', verticalAlign: 'middle', opacity: 0.5 }} />
                      {record.date}
                    </td>
                    <td>{record.sleep_hours} <span className="unit-label">hrs</span></td>
                    <td>
                      <span className={`stress-badge ${record.stress_level >= 7 ? 'stress-high' : record.stress_level >= 4 ? 'stress-mid' : 'stress-low'}`}>
                        {record.stress_level}/10
                      </span>
                    </td>
                    <td><ScorePill value={record.energy_score} /></td>
                    <td><ScorePill value={record.productivity_score} /></td>
                    <td className="bars-cell">
                      <MiniBar value={record.energy_score}       color="#EF4444" />
                      <MiniBar value={record.productivity_score} color="var(--text-primary)" />
                    </td>
                    <td>
                      <button
                        id={`detail-btn-${record.id}`}
                        className="row-detail-btn"
                        onClick={() => setSelectedRow(selectedRow === record.id ? null : record.id)}
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                  {selectedRow === record.id && (
                    <tr className="detail-expand-row">
                      <td colSpan={7}>
                        <div className="detail-expand-content">
                          <div className="detail-chip"><span>💤 Sleep</span><strong>{record.sleep_hours} hrs</strong></div>
                          <div className="detail-chip"><span>🧠 Stress</span><strong>{record.stress_level}/10</strong></div>
                          <div className="detail-chip"><span>⚡ Energy</span><strong>{record.energy_score}/100</strong></div>
                          <div className="detail-chip"><span>🎯 Productivity</span><strong>{record.productivity_score}/100</strong></div>
                          <div className="detail-chip"><span>📅 Logged</span><strong>{record.date}</strong></div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="history-empty glass-card">
          <Calendar size={44} color="var(--text-secondary)" />
          <h3>{search ? 'No matching records' : 'No history yet'}</h3>
          <p>{search ? 'Try clearing your search filter.' : 'Make your first prediction to start building your history.'}</p>
        </div>
      )}

    </div>
  );
};

export default History;
