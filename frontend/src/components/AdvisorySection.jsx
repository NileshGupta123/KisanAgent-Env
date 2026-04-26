import React from 'react';
import { Leaf, AlertTriangle, Tractor, Languages } from 'lucide-react';

export const AdvisorySection = ({ tip }) => {
  // Break down the tip into components
  let problem = "Abnormal crop/soil condition detected requiring intervention.";
  let recommendation = tip || "Maintain careful monitoring of the situation and adjust farm practices accordingly.";
  let steps = [];

  if (tip && tip.includes('- ')) {
     steps = tip.split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^- /, '').trim());
     recommendation = tip.split('\n').find(line => !line.trim().startsWith('-') && line.trim() !== '') || recommendation;
  }

  // Generate generic Hindi dynamically
  const hindiAdvisory = "नियमित रूप से अपनी फसल और मिट्टी की स्थिति की जांच करें। " +
   "दवाओं और खाद का प्रयोग कृषि विशेषज्ञ की सलाह अनुसार ही करें। " +
   "अगले कुछ दिनों तक स्थिति पर विशेष रूप से नज़र रखें।";

  return (
    <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-emerald-100 flex flex-col md:flex-row mt-6">
       <div className="flex-1 p-8 sm:p-10 space-y-6">
           <div className="flex items-center gap-3 mb-2 pb-4 border-b border-zinc-100">
               <Languages size={24} className="text-emerald-600"/>
               <h3 className="text-xl font-extrabold text-zinc-800 tracking-tight m-0">Kisan Advisory</h3>
           </div>
           
           <div className="bg-orange-50/50 p-5 rounded-2xl border-l-4 border-l-orange-400">
              <h4 className="flex items-center gap-2 text-[11px] font-black text-orange-700 uppercase tracking-widest mb-2">⚠️ Problem</h4>
              <p className="text-orange-900/80 font-bold">{problem}</p>
           </div>

           <div className="bg-emerald-50/50 p-5 rounded-2xl border-l-4 border-l-emerald-400">
              <h4 className="flex items-center gap-2 text-[11px] font-black text-emerald-700 uppercase tracking-widest mb-2">🌿 Recommendation</h4>
              <p className="text-emerald-900/80 font-bold">{recommendation}</p>
           </div>

           {steps.length > 0 && (
             <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                <h4 className="flex items-center gap-2 text-[11px] font-black text-emerald-800 uppercase tracking-widest mb-3">🚜 Action Steps</h4>
                <ul className="space-y-3">
                  {steps.map((s, i) => (
                     <li key={i} className="flex gap-3 text-emerald-900 font-medium text-sm">
                        <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                        <span className="mt-0.5">{s}</span>
                     </li>
                  ))}
                </ul>
             </div>
           )}
       </div>

       <div className="flex-1 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 opacity-10">
             <Tractor size={240} className="translate-x-12 -translate-y-12"/>
          </div>
          <div className="relative z-10">
             <h4 className="text-[12px] font-black text-emerald-300/80 uppercase mb-8 tracking-widest flex items-center gap-2">
                 <span>किसान सलाह (Hindi Translation)</span>
             </h4>
             <p className="font-bold text-emerald-50 leading-relaxed text-2xl drop-shadow-sm">
                {hindiAdvisory}
             </p>
          </div>
       </div>
    </div>
  );
};
