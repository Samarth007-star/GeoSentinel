import React, { useState } from 'react';
import {
  Newspaper,
  Users,
  TrendingUp,
  Landmark,
  Mountain,
  Orbit,
  Network,
  Wifi,
  MessageSquare
} from 'lucide-react';

interface RightSidebarProps {
  onSelectQuestion: (question: string) => void;
  onOpenConnectors: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onSelectQuestion,
  onOpenConnectors
}) => {
  const [dataSources, setDataSources] = useState([
    { id: 'gdelt', name: 'News Sources (GDELT)', icon: Newspaper, enabled: true },
    { id: 'reliefweb', name: 'ReliefWeb (Humanitarian)', icon: Users, enabled: true },
    { id: 'worldbank', name: 'World Bank (Economic)', icon: TrendingUp, enabled: true },
    { id: 'imf', name: 'IMF (Financial)', icon: Landmark, enabled: true },
    { id: 'usgs', name: 'USGS (Disaster)', icon: Mountain, enabled: true },
    { id: 'nasa', name: 'NASA EONET (Disaster)', icon: Orbit, enabled: true },
    { id: 'wikidata', name: 'Wikidata (Entities)', icon: Network, enabled: true },
    { id: 'ooni', name: 'OONI (Internet)', icon: Wifi, enabled: true },
  ]);

  const toggleSource = (id: string) => {
    setDataSources((prev) =>
      prev.map((src) => (src.id === id ? { ...src, enabled: !src.enabled } : src))
    );
  };

  const exampleQuestions = [
    'What are the latest developments in the US-Iran tensions?',
    'How could a conflict in the Middle East affect India\'s energy security?',
    'Show recent earthquakes and their impact in Asia',
    'Compare India and China on trade and economic indicators'
  ];

  const recentQuestions = [
    { title: 'Impact of Red Sea shipping ...', time: '2 hours ago', query: 'Evaluate the economic and shipping container freight impact of Red Sea transit disruptions.' },
    { title: 'US-Iran conflict and India', time: '5 hours ago', query: 'What could be the effects on India if US-Iran tensions escalate?' },
    { title: 'Recent earthquakes in Asia', time: '1 day ago', query: 'Show recent earthquakes and their impact in Asia' },
    { title: "India's energy import risks", time: '2 days ago', query: 'Analyze potential domestic sector spillovers if crude oil trade routes face selective maritime blockades.' }
  ];

  return (
    <aside className="w-72 xl:w-80 bg-white border-l border-slate-200/90 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none shrink-0 overflow-y-auto p-4 space-y-6">
      
      {/* Selected Data Sources */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">Selected Data Sources</h3>
          <button
            onClick={onOpenConnectors}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Manage
          </button>
        </div>

        <div className="space-y-2">
          {dataSources.map((source) => {
            const Icon = source.icon;
            return (
              <div
                key={source.id}
                className="flex items-center justify-between py-1 px-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs font-medium text-slate-700">{source.name}</span>
                </div>

                {/* Custom Toggle Switch matching screenshot */}
                <button
                  type="button"
                  onClick={() => toggleSource(source.id)}
                  className={`theme-switch ${
                    source.enabled ? 'theme-switch-checked' : 'theme-switch-unchecked'
                  }`}
                  aria-checked={source.enabled}
                  role="switch"
                >
                  <span
                    className={`theme-switch-thumb ${
                      source.enabled ? 'theme-switch-thumb-checked' : ''
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Example Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">Example Questions</h3>
          <span className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
            View All
          </span>
        </div>

        <div className="space-y-2">
          {exampleQuestions.map((q, idx) => (
            <div
              key={idx}
              onClick={() => onSelectQuestion(q)}
              className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 group-hover:text-slate-900 leading-snug">
                {q}
              </p>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Recent Questions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">Recent Questions</h3>
          <span className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer">
            View All
          </span>
        </div>

        <div className="space-y-2">
          {recentQuestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectQuestion(item.query)}
              className="flex items-center justify-between py-1.5 px-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 truncate max-w-[190px]">
                <MessageSquare className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                <span className="text-xs text-slate-600 group-hover:text-slate-900 truncate">
                  {item.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </div>
      </div>

    </aside>
  );
};
