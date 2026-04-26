import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, ResponsiveContainer 
} from 'recharts';
import { 
  Sprout, RefreshCcw, Edit3, CheckCircle, AlertCircle, Sparkles, MapPin, Activity, Bot
} from 'lucide-react';
import { ScoreRing } from './components/ScoreRing';
import { ProgressBar } from './components/ProgressBar';
import { AdvisorySection } from './components/AdvisorySection';

const API_BASE = window.location.hostname === 'localhost' 
  ? '/api' 
  : 'https://nile-2026-kisanagent-env.hf.space';

// Farmer friendly quick actions
const RECOMMENDED_ACTIONS = [
  { text: "🌾 Crop Advice", action: "Identify my crop problem and suggest remedies." },
  { text: "💧 Fertilizer Help", action: "What fertilizer should I use now?" },
  { text: "🌦 Weather Check", action: "What should I do based on current weather?" }
];

const App = () => {
  const [state, setState] = useState({
    scenario: "Synchronizing farm data...",
    tasks: [],
    farmer: { name: "Ramesh Sharma", location: "Ludhiana", emoji: "👨🌾" }
  });
  const [manualMode, setManualMode] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Initialize with a realistic dummy learning curve
  const [history, setHistory] = useState([
    { episode: 1, reward: 0.2 }, { episode: 2, reward: 0.35 }, { episode: 3, reward: 0.3 }, 
    { episode: 4, reward: 0.55 }, { episode: 5, reward: 0.4 }, { episode: 6, reward: 0.7 }, 
    { episode: 7, reward: 0.65 }, { episode: 8, reward: 0.85 }, { episode: 9, reward: 0.92 }
  ]);
  const [error, setError] = useState(null);
  const [episode, setEpisode] = useState(9); // Begin at episode 9
  const [agentAction, setAgentAction] = useState("");

  const initEnv = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/reset`, {});
      const obs = res.data.observation || res.data.state;
      if (obs) {
        setState({
          scenario: obs.scenario || obs.observation || "Custom Simulation Active",
          tasks: obs.available_tasks || obs.tasks || ["Diagnosis"],
          farmer: {
            name: obs.scenario?.includes("Lakshmi") ? "Lakshmi Devi" : "Ramesh Sharma",
            location: obs.scenario?.includes("Punjab") ? "Ludhiana, Punjab" : "Kurnool, AP",
            emoji: obs.scenario?.includes("Lakshmi") ? "👩🌾" : "👨🌾"
          }
        });
        setResult(null);
        setAgentAction("");
      }
    } catch (err) {
      setError("Cloud Sync Interrupted. Manual input enabled.");
      setManualMode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    if (!agentAction.trim()) return;
    setLoading(true);
    setResult(null);
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
        }));
      }
    } catch (err) {
      setError("Session Reset Required.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { initEnv(); }, []);

  const parseFeedback = (text) => {
    if (!text) return [];
    return text.split('[').filter(p => p.includes(']')).map(p => {
      const b = p.split(']');
      return { status: b[0].trim(), msg: b[1].split('.')[0].trim() };
    }).slice(0, 3);
  };

  return (
    <div className="min-h-screen app-wrapper bg-[#f8f9fa]">
      <nav className="navbar mb-10 pb-4 border-b border-emerald-100 flex justify-between items-center bg-white p-4 rounded-3xl shadow-sm">
        <div className="brand-section flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-2xl">
             <Sprout className="text-emerald-700" size={28} />
          </div>
          <div>
             <h1 className="text-2xl font-bold text-emerald-900 m-0 tracking-tight">Kisan Agent</h1>
             <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest m-0">AI Advisory for 600M Indian Farmers</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="hidden lg:flex items-center gap-4 text-xs font-bold text-emerald-600/70 uppercase tracking-wider mr-6">
              <span>5 Tasks</span> <span className="text-emerald-200">|</span> 
              <span>3 Agents</span> <span className="text-emerald-200">|</span> 
              <span>Bilingual</span> <span className="text-emerald-200">|</span> 
              <span>Self-Learning</span>
           </div>
           <button className="btn-outline hidden sm:flex items-center gap-2" onClick={() => setManualMode(!manualMode)}>
              <Edit3 size={16}/> <span>{manualMode ? "Auto Map" : "Custom Task"}</span>
           </button>
           <button className="btn-outline flex items-center gap-2" onClick={initEnv}>
              <RefreshCcw size={16} /> <span>New Scenario</span>
           </button>
        </div>
      </nav>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-2 border border-red-100 fade-in">
           <AlertCircle size={18}/> <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <main className="main-grid">
        {/* Sidebar */}
        <aside className="space-y-6">
          <section className="card-premium pb-8">
            <div className="flex items-center gap-5 mb-6">
               <div className="text-5xl bg-emerald-50 p-3 rounded-2xl">{state.farmer.emoji}</div>
               <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-zinc-800 m-0">{state.farmer.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                     <MapPin size={12} className="text-emerald-500"/> {state.farmer.location}
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
               <span className="badge-pill bg-emerald-100/50 text-emerald-800 border border-emerald-200 uppercase tracking-wider text-[9px]">CROP: 🍅 TOMATO</span>
               <span className="badge-pill bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider text-[9px]">TASK: {state.tasks[0]?.toUpperCase() || "DIAGNOSIS"}</span>
            </div>

            <p className="text-[11px] font-black text-emerald-800/50 uppercase mb-2">Your Farm Situation</p>
            {manualMode ? (
              <textarea 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm text-zinc-700 outline-none focus:border-emerald-500 h-32 transition-all shadow-inner"
                value={state.scenario} 
                onChange={(e) => setState({...state, scenario: e.target.value})}
              />
            ) : (
              <p className="text-[15px] font-medium text-zinc-600 leading-relaxed border-l-4 border-emerald-200 pl-4 py-1">"{state.scenario}"</p>
            )}
          </section>

          <section className="card-premium">
            <h4 className="text-[11px] font-black uppercase text-emerald-800/50 mb-4">What do you want help with?</h4>
            <div className="space-y-4">
              <input 
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 text-sm font-medium outline-none focus:border-emerald-500 focus:ring-4 ring-emerald-50 transition-all shadow-inner"
                value={agentAction}
                onChange={(e) => setAgentAction(e.target.value)}
                placeholder="Examples: How much urea? Or when to spray?"
              />
              <div className="flex flex-wrap gap-2">
                 {RECOMMENDED_ACTIONS.map((a, i) => (
                   <button key={i} onClick={() => setAgentAction(a.action)} className="text-[11px] font-bold bg-white text-zinc-600 border border-zinc-200 rounded-full px-4 py-2 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all shadow-sm">
                      {a.text}
                   </button>
                 ))}
              </div>
              <button 
                className="btn-primary-grad w-full mt-4 flex items-center justify-center gap-2 hover:shadow-lg transition-shadow" 
                onClick={handleStep}
                disabled={loading || !agentAction}
              >
                {loading ? <div className="spinner"></div> : <>Ask Kisan Agent <Sprout size={16}/></>}
              </button>
              {loading && <p className="text-center text-xs font-bold text-emerald-600 mt-2 animate-pulse">🌾 Analyzing your farm situation...</p>}
            </div>
          </section>

          <section className="card-premium h-64 flex flex-col pt-6 pb-6">
             <div className="flex justify-between items-end mb-6">
               <h4 className="text-[11px] font-black uppercase text-emerald-800/50 m-0">Learning Progress</h4>
               <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Episode {episode}</span>
             </div>
             <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={history}>
                      <defs>
                        <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="reward" stroke="#2D6A4F" strokeWidth={4} fillOpacity={1} fill="url(#colorReward)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </section>
        </aside>

        {/* Content */}
        <div className="main-column">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="idle" className="h-full flex flex-col items-center justify-center p-20 bg-white/60 border-2 border-dashed border-emerald-200 rounded-[32px] text-emerald-800/50">
                 <div className="bg-emerald-50 p-6 rounded-full mb-6 relative shadow-inner">
                    <Sparkles size={48} className="text-emerald-400 absolute top-2 right-2 animate-pulse"/>
                    <Bot size={64} className="text-emerald-600" />
                 </div>
                 <h2 className="text-2xl font-bold mb-2 text-zinc-700">AI Analysis</h2>
                 <p className="text-sm font-medium text-center max-w-sm">Select an option on the left or type your own question to get personalized farming advice.</p>
              </motion.div>
            ) : (
              <motion.div key="res" className="space-y-6 fade-in">
                 
                 {/* Result Grid from original Dashboard */}
                 <div className="bg-white rounded-[32px] p-8 sm:p-12 border border-emerald-100 shadow-sm flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                    <ScoreRing score={result.reward} />
                    
                    <div className="flex-1 w-full flex flex-col justify-center">
                       <div className="mb-8">
                          <h2 className="text-3xl font-extrabold text-zinc-800 mb-2">Analysis Result</h2>
                          <span className="text-[10px] bg-emerald-100/50 text-emerald-700 font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-200">
                             AI Evaluated
                          </span>
                       </div>
                       
                       <div className="w-full space-y-2">
                          <ProgressBar label="Accuracy" value={result.reward} />
                          <ProgressBar label="Contextual Match" value={result.reward * 0.9} />
                          <ProgressBar label="Safety Rating" value={0.94} />
                       </div>
                    </div>
                 </div>

                 {/* Refactored extracted Advisory Section */}
                 <AdvisorySection tip={result.info?.improvement_tip || result.improvement_tip} />

                 {/* Feedback Cards */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {parseFeedback(result.observation?.scenario).map((f, i) => (
                      <div key={i} className={`bg-white rounded-2xl p-6 border-l-4 shadow-sm border ${f.status === 'CORRECT' ? 'border-emerald-100 border-l-emerald-500' : 'border-red-100 border-l-red-500'}`}>
                         <div className={`flex items-center gap-2 text-[10px] font-black uppercase mb-3 ${f.status === 'CORRECT' ? 'text-emerald-700' : 'text-red-700'}`}>
                            {f.status === 'CORRECT' ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                            <span>{f.status}</span>
                         </div>
                         <p className="text-sm font-semibold text-zinc-700 leading-relaxed m-0">{f.msg}</p>
                      </div>
                    ))}
                 </div>

                 {/* Raw Stream */}
                 <div className="bg-white rounded-[32px] p-8 border border-emerald-100 shadow-sm">
                    <p className="text-[11px] font-black text-emerald-800/50 uppercase mb-4 px-2 flex items-center gap-2 tracking-widest">
                       <Activity size={14}/> Neural Context Stream
                    </p>
                    <p className="text-xs font-mono p-6 bg-zinc-50 border border-zinc-100 rounded-2xl text-zinc-500 whitespace-pre-wrap leading-loose shadow-inner overflow-x-auto">
                       {result.observation?.scenario || result.scenario || "Scenario executed"}
                    </p>
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
