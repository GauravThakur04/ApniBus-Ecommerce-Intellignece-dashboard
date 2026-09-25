import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  period,
  prefix = '', 
  suffix = '',
  icon: Icon
}) => {
  const parseChange = (ch) => {
    if (!ch) return { type: 'neutral', value: '' };
    const str = String(ch);
    if (str.startsWith('+')) return { type: 'positive', value: str.substring(1) };
    if (str.startsWith('-')) return { type: 'negative', value: str.substring(1) };
    return { type: 'neutral', value: str };
  };

  const { type, value: changeVal } = parseChange(change);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
        {Icon && (
          <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 rounded-lg">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-baseline space-x-1 mb-2">
        {prefix && <span className="text-gray-400 dark:text-slate-500 text-xl font-medium">{prefix}</span>}
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        {suffix && <span className="text-gray-400 dark:text-slate-500 text-xl font-medium">{suffix}</span>}
      </div>
      
      {(change || period) && (
        <div className="flex items-center text-xs mt-3">
          {type === 'positive' && (
            <span className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full font-medium">
              <ArrowUpIcon size={12} className="mr-1" />
              {changeVal}
            </span>
          )}
          {type === 'negative' && (
            <span className="flex items-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full font-medium">
              <ArrowDownIcon size={12} className="mr-1" />
              {changeVal}
            </span>
          )}
          {type === 'neutral' && change && (
            <span className="flex items-center text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
              <MinusIcon size={12} className="mr-1" />
              {changeVal}
            </span>
          )}
          {period && <span className="text-gray-400 dark:text-slate-500 ml-2 truncate">{period}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
