import React, { useEffect, useState } from 'react';
import { ExternalLink, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { fetchConnectors } from '../../services/api';
import { ConnectorInfo } from '../../types';

export const ConnectorStatusView: React.FC = () => {
  const [connectors, setConnectors] = useState<ConnectorInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConnectors();
  }, []);

  const loadConnectors = async () => {
    setLoading(true);
    const data = await fetchConnectors();
    setConnectors(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sentinel-700/60 pb-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Source & Connector Registry</h2>
          <p className="text-xs text-slate-400">
            Compliance Policy: Zero Paid Data Resources. Every active connector uses verified free access terms.
          </p>
        </div>
        <button
          onClick={loadConnectors}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-lg bg-sentinel-800 text-slate-300 hover:text-white border border-sentinel-700 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((conn) => (
          <div key={conn.id} className="glass-panel rounded-xl p-5 border-sentinel-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold text-blue-400">{conn.id}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> {conn.status}
              </span>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white">{conn.provider}</h3>
              <p className="text-xs text-slate-400">{conn.category}</p>
            </div>

            <div className="pt-2 border-t border-sentinel-700/50 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                License: <span className="text-slate-200 font-medium">{conn.license}</span>
              </span>
              <a
                href={conn.termsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
              >
                Official Terms <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-sentinel-850/60 rounded-xl p-5 border border-sentinel-700/40 text-xs text-slate-400 space-y-2">
        <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Non-Negotiable Licensing & Ethics Governance
        </h4>
        <p>
          Connectors are audited under Section 3.1 and Section 8 of the Master Build Specification. 
          Third-party data requiring paid API keys, premium tiers, or commercial licensing agreements are strictly barred from production pipelines.
        </p>
      </div>
    </div>
  );
};
