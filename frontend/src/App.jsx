import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Sprout, RefreshCcw, Languages, Brain, 
  Zap, Info, ChevronRight, Target, ClipboardList, Activity, Edit3, Send, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
  ? '/api' 
  : 'https://nile-2026-kisanagent-env.hf.space';

// Recommended actions for common agricultural scenarios
const SUGGESTIONS = [
  "Apply propiconazole fungicide for wheat rust.",
  "Implement drip irrigation with 5L/ha daily.",
  "Use N-P-K 19-19-19 fertilizer for nutrient boost.",
  "Spray organic neem oil to control aphids."
];

const App = () => {
  const [state, setState] = useState({
    scenario: "Waiting for Environment Data...",
    tasks: []
  });
  const [manualMode, setManualMode] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [episode, setEpisode] = useState(0);
  const [agentAction, setAgentAction] = useState("");

  const initEnv = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/reset`, {});
      const obs = res.data.observation || res.data.state;
      if (obs) {
        setState({
          scenario: obs.scenario || obs.observation || "Custom Environment Active",
          tasks: obs.available_tasks || obs.tasks || []
        });
        setResult(null);
        setAgentAction("");
      }
    } catch (err) {
      setError("Sync Failed: Manual override enabled.");
      setManualMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    if (!agentAction.trim()) {
      setError("Please input an action first.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/step`, { response: agentAction });
      const data = res.data;
      setResult(data);
      
      const score = data.reward > 1 ? data.reward / 100 : (data.reward || 0);
      setHistory(prev => [...prev, { episode: episode + 1, reward: score }]);
      setEpisode(prev => prev + 1);
      
      if (data.observation) {
        setState(prev => ({
          ...prev,
          scenario: data.observation.scenario || prev.scenario,
          tasks: data.observation.available_tasks || prev.tasks
        }));
      }
    } catch (err) {
      setError("Session Reset: Call Reset to start fresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initEnv(); }, []);

  const parseFeedback = (text) => {
    if (!text) return [];
    const parts = text.split('[');
    return parts.filter(p => p.includes(']')).map(p => {
      const bits = p.split(']');
      return { 
        status: bits[0].trim(), 
        content: bits[1].split('.')[0].trim(), // Get only the main error/success message
        details: bits[1].split('.').slice(1).join('.').trim() // Detailed correction
      };
    }).slice(0, 3); // Max 3 cards for clean UI
  };

  const feedbacks = result ? parseFeedback(result.observation?.scenario) : [];

  return (
    <div className="app-container">
      <div className="bg-glow"></div>
      
      <header className="main-header">
        <div className="logo-section">
          <div className="logo-icon"><Sprout size={28} /></div>
          <div className="logo-text">
            <h1>KISAN AGENT</h1>
          </div>
        </div>

        <div className="header-actions">
           <button className={`btn-secondary ${manualMode ? 'active' : ''}`} onClick={() => setManualMode(!manualMode)}>
            <Edit3 size={18} /> Edit Scenario
          </button>
          <button className="btn-secondary" onClick={initEnv}><RefreshCcw size={18} /> Reset Cloud</button>
          <button className="btn-primary" onClick={handleStep} disabled={loading || !agentAction}>
            {loading ? "Analyzing..." : "Evaluate Agent"}
            <ChevronRight size={18} />
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner animate-up">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      <main className="dashboard-grid">
        {/* Left Component: Inputs */}
        <div className="sidebar space-y-8">
          
          <section className="card card-premium">
            <div className="card-header">
              <span className="label">1. DEFINE SITUATION</span>
              <Target size={14} />
            </div>
            {manualMode ? (
               <textarea className="scenario-editor no-scrollbar" value={state.scenario} onChange={(e) => setState({...state, scenario: e.target.value})} />
            ) : (
               <div className="scenario-display">
                  <p>{state.scenario}</p>
               </div>
            )}
          </section>

          <section className="card card-premium">
            <div className="card-header">
              <span className="label">2. AGENT DECISION</span>
              <Brain size={14} />
            </div>
            <div className="space-y-4">
              <input className="agent-input-field" value={agentAction} onChange={(e) => setAgentAction(e.target.value)} placeholder="Type action (e.g. Apply fungicide)..." />
              <div className="suggestions">
                 <p className="text-[9px] font-black text-zinc-500 uppercase mb-2">Suggestions</p>
                 <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s, i) => (
                      <button key={i} onClick={() => setAgentAction(s)} className="suggest-chip">{s.split(' ')[0]}...</button>
                    ))}
                 </div>
              </div>
            </div>
          </section>

          <section className="card card-premium h-[200px]">
            <div className="card-header">
              <span className="label">CUMULATIVE PERFORMANCE</span>
              <Activity size={14} />
            </div>
            <div className="h-full pb-8">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <Line type="monotone" dataKey="reward" stroke="#2ecc71" strokeWidth={3} dot={{r:4, fill:'#2ecc71'}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <p className="empty-msg">No metrics yet.</p>}
            </div>
          </section>
        </div>

        {/* Right Component: Analysis */}
        <div className="main-content">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="idle" initial={{opacity:0}} animate={{opacity:1}} className="full-v-center">
                 <div className="idle-indicator">
                    <Sparkles size={48} className="text-zinc-800 mb-6" />
                    <h2>Awaiting Command</h2>
                    <p>Enter an agent strategy on the left and click <strong>Evaluate</strong> to process the reward matrix.</p>
                 </div>
              </motion.div>
            ) : (
              <motion.div key="res" initial={{opacity:0, y: 15}} animate={{opacity:1, y: 0}} className="space-y-8">
                 
                 {/* Top Level Score */}
                 <div className="score-hero">
                    <div className="sh-left">
                       <p className="label">ENVIRONMENT SCORE</p>
                       <div className="sh-vals">
                          <span className="sh-big">{(result.reward > 1 ? result.reward : result.reward * 100).toFixed(0)}</span>
                          <span className="sh-unit">/ 100</span>
                       </div>
                    </div>
                    <div className="sh-right">
                       <span className="badge-score">{result.reward > 0.45 ? "Optimal Strategy" : "Correction Required"}</span>
                    </div>
                    <div className="sh-progress">
                       <div className="sh-p-fill" style={{width: `${(result.reward > 1 ? result.reward : result.reward * 100)}%`}}></div>
                    </div>
                 </div>

                 {/* Structured Insight Cards */}
                 <div className="insight-grid">
                    {feedbacks.map((f, i) => (
                      <div key={i} className={`insight-card ${f.status === 'CORRECT' ? 'pos' : 'neg'}`}>
                         <div className="ic-head">
                            {f.status === 'CORRECT' ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                            <span>{f.status}</span>
                         </div>
                         <h4 className="ic-title">{f.content}</h4>
                         <p className="ic-body">{f.details}</p>
                      </div>
                    ))}
                 </div>

                 {/* Bilingual Advisory */}
                 <div className="bilingual-card">
                    <div className="bi-head"><Languages size={18}/> <span>Kisan Advisory / किसान सलाह</span></div>
                    <div className="bi-content">
                       <div className="bi-eng">
                          <p className="sub-label">English Recommendation</p>
                          <p>{result.reward > 0.45 ? "Continue monitoring for 7 days post-treatment. Ensure soil pH remains within 6.0-7.0." : "Immediate intervention needed. Re-evaluate treatment dosages and apply as per local APMC guidelines."}</p>
                       </div>
                       <div className="bi-hin text-2xl font-bold">
                          <p className="sub-label">Hindi सलाह</p>
                          <p>उचित सिंचाई और उर्वरक का प्रयोग करें। नियमित निगरानी आवश्यक है।</p>
                       </div>
                    </div>
                 </div>

                 {/* Raw Stream */}
                 <div className="raw-stream">
                    <div className="rs-head"><ClipboardList size={14}/> RAW NEURAL LOG</div>
                    <div className="rs-body">{result.observation?.scenario}</div>
                 </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default App;
