import React from 'react';
import { Sparkles, TrendingUp, AlertCircle, Info } from 'lucide-react';

const ExecutiveAIHero = ({ executiveSummary }) => {
  if (!executiveSummary) return null;

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/20 border border-green-100 dark:border-green-900/40 rounded-xl p-4">
      <div className="flex items-center space-x-2 mb-3">
        <Sparkles className="text-green-600 dark:text-green-400" size={18} />
        <h2 className="text-sm font-semibold text-green-800 dark:text-green-300 uppercase tracking-wider">AI Executive Intelligence</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {executiveSummary.key_observation && (
          <div className="flex items-start space-x-3 bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg">
            <TrendingUp className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-xs text-green-800 dark:text-green-300 font-medium mb-1">Key Observation</p>
              <p className="text-sm text-gray-700 dark:text-slate-300">{executiveSummary.key_observation}</p>
            </div>
          </div>
        )}
        
        {executiveSummary.potential_issue && (
          <div className="flex items-start space-x-3 bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg">
            <AlertCircle className="text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium mb-1">Potential Issue</p>
              <p className="text-sm text-gray-700 dark:text-slate-300">{executiveSummary.potential_issue}</p>
            </div>
          </div>
        )}
        
        {executiveSummary.recommended_action && (
          <div className="flex items-start space-x-3 bg-white/60 dark:bg-slate-900/60 p-3 rounded-lg">
            <Info className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">Recommended Action</p>
              <p className="text-sm text-gray-700 dark:text-slate-300">{executiveSummary.recommended_action}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveAIHero;
