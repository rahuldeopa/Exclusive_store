import React from 'react';
import { Music, Disc } from 'lucide-react';

export default function AudioSection({ tracks }) {
  if (!tracks || tracks.length === 0) return null;

  return (
    <div className="mt-12 w-full max-w-2xl mx-auto p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex justify-center items-center">
          <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Bonus Soundtrack</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest">Original Composition</p>
        </div>
      </div>

      <div className="space-y-4">
        {tracks.map(track => (
          <div key={track.id} className="p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Disc className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">{track.title}</p>
            </div>
            <audio controls className="h-8 max-w-[200px]" src={track.url} />
          </div>
        ))}
      </div>
    </div>
  );
}
