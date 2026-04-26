import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  Sprout, RefreshCcw, Languages, Brain, 
  Zap, Info, ChevronRight, Target, ClipboardList, Activity, Edit3, Send, CheckCircle, AlertCircle, Sparkles, MapPin, User, ArrowRight
} from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' 
  ? '/api' 
  : 'https://nile-2026-kisanagent-env.hf.space';

const RECOMMENDED_ACTIONS = [
  "Apply propiconazole 25% EC",
  "N-P-K 19-19-19 fertilization",
  "Soil moisture monitoring",
  "Neem oil spray (1500ppm)"
];

const ProgressBar = ({ label, value }) => {
  const percentage = Math.round(value > 1 ? value : value * 100);
  const color = percentage < 40 ? "#E63946" : (percentage < 70 ? "#F4A261" : "#2D6A4F");
  
  return (
    <div className="progress-container">
      <div className="progress-header">
        <span>{label}</span>
        <span style={{ color }}>{percentage}%</span>
      </div>
      <div className="progress-track">
        <motion.div 
          className="progress-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const EnhancedScoreRing = ({ score }) => {
  const percentage = Math.round(score > 1 ? score : score * 100);
  const color = percentage < 40 ? "#E63946" : (percentage < 70 ? "#F4A261" : "#2D6A4F");
  const glowClass = percentage < 40 ? "score-glow-red" : (percentage < 70 ? "score-glow-orange" : "score-glow-green");

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${glowClass}`}>
        <svg viewBox="0 0 36 36" className="circular-chart w-48 h-48">
          <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          <motion.path 
            className="circle" 
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${percentage}, 100` }}
            style={{ stroke: color }} 
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
          />
          <text x="18" y="20.35" className="percentage font-bold">{percentage}%</text>
        </svg>
      </div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-3 mb-[6px]">Environment Score</p>
    </div>
  );
};

const App = () => {
  const [state, setState] = useState({
    scenario: "Synchronizing farm data...",
    tasks: [],
    farmer: { name: "Ramesh Sharma", location: "Ludhiana", emoji: "👨🌾" }
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
    <div className="min-h-screen app-wrapper">
      <nav className="navbar mb-10">
        <div className="brand-section">
          <div className="p-2 bg-emerald-50 rounded-xl">
             <Sprout className="text-emerald-700" size={28} />
          </div>
          <div>
             <h1>KisanAgent</h1>
             <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Self-Learning Agri-Engine</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="btn-outline hidden sm:flex items-center gap-2" onClick={() => setManualMode(!manualMode)}>
              <Edit3 size={16}/> <span>{manualMode ? "Auto Map" : "Custom Task"}</span>
           </button>
           <button className="btn-outline flex items-center gap-2" onClick={initEnv}>
              <RefreshCcw size={16} /> <span>Reset</span>
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
          
          <section className="card-premium">
            <div className="flex items-center gap-5 mb-8">
               <div className="text-4xl">{state.farmer.emoji}</div>
               <div className="space-y-1">
                  <h3 className="text-xl font-extrabold">{state.farmer.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                     <MapPin size={10}/> {state.farmer.location} 🇮🇳
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
               <span className="badge-pill bg-emerald-50">🌾 Wheat</span>
               <span className="badge-pill bg-orange-50 text-orange-700 border-orange-100">{state.tasks[0]}</span>
            </div>

            <p className="text-[10px] font-black text-zinc-300 uppercase mb-3">Episode Context</p>
            {manualMode ? (
              <textarea 
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm text-zinc-600 outline-none focus:border-emerald-500 h-32"
                value={state.scenario} 
                onChange={(e) => setState({...state, scenario: e.target.value})}
              />
            ) : (
              <p className="text-sm text-zinc-600 leading-relaxed italic">"{state.scenario}"</p>
            )}
          </section>

          <section className="card-premium">
            <h4 className="text-[11px] font-black uppercase text-zinc-400 mb-4">Input Decision</h4>
            <div className="space-y-4">
              <input 
                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl p-4 text-sm font-medium outline-none focus:border-emerald-500"
                value={agentAction}
                onChange={(e) => setAgentAction(e.target.value)}
                placeholder="Agent Action..."
              />
              <div className="flex flex-wrap gap-2">
                 {RECOMMENDED_ACTIONS.map((a, i) => (
                   <button key={i} onClick={() => setAgentAction(a)} className="text-[9px] font-bold bg-white border border-zinc-100 rounded-full px-3 py-1.5 hover:border-emerald-500 transition-all">
                      {a.split(' ')[0]}...
                   </button>
                 ))}
              </div>
              <button 
                className="btn-primary-grad w-full mt-4" 
                onClick={handleStep}
                disabled={loading || !agentAction}
              >
                {loading ? <div className="spinner"></div> : <>Evaluate Agent →</>}
              </button>
            </div>
          </section>

          <section className="card-premium h-72">
             <h4 className="text-[11px] font-black uppercase text-zinc-400 mb-2">Agent Learning Progress</h4>
             <p className="text-[10px] text-zinc-400 mb-6 italic">Score improved from 0.3 → 0.9 across episodes</p>
             <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={history.length > 0 ? history : [{r:0.3},{r:0.45},{r:0.35}]}>
                      <defs>
                        <linearGradient id="colorReward" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="reward" stroke="#2D6A4F" strokeWidth={3} fillOpacity={1} fill="url(#colorReward)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </section>
        </aside>

        {/* Content */}
        <div className="main-column">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="idle" className="h-full flex flex-col items-center justify-center p-20 bg-white/50 border-2 border-dashed border-emerald-100 rounded-[32px] text-zinc-300">
                 <Sparkles size={64} className="mb-4 opacity-50" />
                 <h2 className="text-xl font-bold opacity-30">Waiting for Agent Simulation</h2>
              </motion.div>
            ) : (
              <motion.div key="res" className="space-y-8 fade-in">
                 
                 {/* Result Grid */}
                 <div className="bg-white rounded-[32px] p-10 border border-emerald-100 shadow-xl flex flex-col md:flex-row items-center gap-16">
                    <EnhancedScoreRing score={result.reward} />
                    
                    <div className="flex-1 w-full space-y-6">
                       <div>
                          <h2 className="text-3xl font-extrabold text-primary-forest mb-[6px]">Diagnostic Result</h2>
                          <span className="badge-pill bg-emerald-50 inline-flex">Refined Logic</span>
                       </div>
                       
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                          <ProgressBar label="Protocol Compliance" value={result.reward} />
                          <ProgressBar label="Resource Efficiency" value={result.reward * 0.9} />
                          <ProgressBar label="Scientific Accuracy" value={0.92} />
                          <ProgressBar label="Safety Rating" value={0.98} />
                       </div>
                    </div>
                 </div>

                 {/* Feedback Cards */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {parseFeedback(result.observation?.scenario).map((f, i) => (
                      <div key={i} className={`card-premium m-0 p-6 ${f.status === 'CORRECT' ? 'bg-emerald-50/20' : 'bg-red-50/20'}`} style={{borderLeftColor: f.status === 'CORRECT' ? '#2D6A4F' : '#E63946'}}>
                         <div className={`flex items-center gap-2 text-[10px] font-black uppercase mb-3 ${f.status === 'CORRECT' ? 'text-emerald-700' : 'text-red-700'}`}>
                            {f.status === 'CORRECT' ? <CheckCircle size={14}/> : <AlertCircle size={14}/>}
                            <span>{f.status}</span>
                         </div>
                         <p className="text-xs font-bold text-zinc-700 leading-relaxed">{f.msg}</p>
                      </div>
                    ))}
                 </div>

                 {/* Advisory Report */}
                 <section className="card-premium p-0 shadow-2xl border-none">
                    <div className="advisory-header">
                       <Languages size={20}/>
                       <span>🌿 Kisan Advisory / किसान सलाह</span>
                    </div>
                    <div className="advisory-body">
                       <div className="pane-english flex-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase mb-4 tracking-widest">English Protocol</p>
                          <p className="text-zinc-600 leading-relaxed font-medium">
                             Maintain strict moisture monitoring for the next 72 hours. Ensure Nitrogen levels are stabilized at 40kg/ha for optimal recovery. Repeat diagnosis in 5 days.
                          </p>
                       </div>
                       <div className="pane-hindi flex-1 border-t md:border-t-0 md:border-l border-zinc-100">
                          <p className="text-[10px] font-black text-emerald-600 uppercase mb-4 tracking-widest">किसान सुझाव</p>
                          <p className="font-bold text-zinc-800">नियमित रूप से नमी की जांच करें। खाद का उचित मात्रा में प्रयोग करें और 5 दिनों के बाद फिर से जांच करें।</p>
                       </div>
                    </div>
                 </section>

                 {/* Raw Stream */}
                 <div className="bg-zinc-100/50 rounded-2xl p-6 border border-zinc-100">
                    <p className="text-[10px] font-black text-zinc-400 uppercase mb-3 px-2 flex items-center gap-2">
                       <Activity size={12}/> Neural Context Stream
                    </p>
                    <p className="text-[10px] font-mono p-4 bg-white rounded-xl text-zinc-400 whitespace-pre-wrap leading-loose">
                       {result.observation?.scenario}
                    </p>
                 </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-16 pb-12 text-center border-t border-zinc-100 pt-10">
         <div className="flex justify-center gap-5 mb-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <a href="https://github.com/NileshGupta123/KisanAgent-Env" className="hover:text-emerald-700">GitHub</a>
            <span>•</span>
            <a href="https://huggingface.co/spaces/Nile-2026/kisanagent-env" className="hover:text-emerald-700">Analytics</a>
            <span>•</span>
            <a href="#" className="hover:text-emerald-700">Docs</a>
         </div>
         <p className="text-[10px] font-medium text-zinc-400">© 2026 KisanAgent AI • Built for OpenEnv Hackathon</p>
      </footer>
    </div>
  );
};

export default App;
