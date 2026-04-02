import React from 'react';
import { PlayCircle } from 'lucide-react';

export default function VideoTrigger({ title, url }) {
  return (
    <div className="my-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-red-50 hover:border-red-200 dark:hover:bg-slate-700 dark:hover:border-slate-600 transition-all group"
      >
        <PlayCircle className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold">Watch Scene</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{title}</p>
        </div>
      </a>
    </div>
  );
}
