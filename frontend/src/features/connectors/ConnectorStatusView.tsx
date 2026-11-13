import React, { useEffect, useState } from 'react';
import { ExternalLink, ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Clock, Key } from 'lucide-react';
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE_DATA_VERIFIED':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> {status}
          </span>
        );
      case 'CREDENTIAL_MISSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Key className="w-3.5 h-3.5" /> CREDENTIAL_MISSING
          </span>
        );
      case 'RATE_LIMITED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-[#DC2626] border border-red-200">
            <Clock className="w-3.5 h-3.5" /> RATE_LIMITED
          </span>
        );
      case 'BLOCKED':
      case 'FAILED':
      case 'ERROR':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            <AlertTriangle className="w-3.5 h-3.5" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#09090B]">
            Source &amp; Connector Registry
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Compliance Policy: Zero Paid Data Resources. Every active connector uses verified multilateral public access.
          </p>
        </div>
        <button
          onClick={loadConnectors}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#09090B] to-[#DC2626] hover:from-[#18181B] hover:to-[#B91C1C] text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-[0_4px_14px_rgba(220,38,38,0.22)]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Health</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {connectors.map((conn) => (
          <div
            key={conn.id}
            className="bg-white rounded-3xl p-4 sm:p-5 border border-zinc-200 hover:border-red-300 shadow-[0_6px_24px_rgba(9,9,11,0.04)] space-y-3 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-mono font-bold text-[#DC2626]">{conn.id}</span>
              {getStatusBadge(conn.status)}
            </div>

            <div>
              <h3 className="text-base font-bold text-[#09090B]">{conn.provider}</h3>
              <p className="text-xs text-zinc-500">{conn.category}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px] text-zinc-600 bg-[#FAFAFA] p-3 rounded-2xl border border-zinc-200">
              <div>
                <span className="text-zinc-400 block font-medium">Authentication:</span>
                <span className="font-mono text-zinc-800 truncate block">{conn.authentication || 'None (Public API)'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">Data Origin:</span>
                <span className="font-mono text-emerald-700 font-bold block">{conn.dataOrigin || 'LIVE'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">Last Check:</span>
                <span className="font-mono text-zinc-700 block">{conn.lastCheck ? new Date(conn.lastCheck).toLocaleTimeString() : 'Recent'}</span>
              </div>
              <div>
                <span className="text-zinc-400 block font-medium">Records Retrieved:</span>
                <span className="font-mono text-[#DC2626] font-bold block">{conn.recordsRetrieved ?? 'Active'}</span>
              </div>
            </div>

            {conn.error && (
              <div className="text-[11px] p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                <span className="font-bold">Notice:</span> {conn.error}
              </div>
            )}

            <div className="pt-2 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-zinc-500">
                License: <span className="text-[#09090B] font-semibold">{conn.license}</span>
              </span>
              <a
                href={conn.termsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[#DC2626] hover:text-[#991B1B] font-semibold transition"
              >
                Official Terms <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-zinc-200 text-xs text-zinc-600 space-y-2 shadow-xs">
        <h4 className="font-bold text-[#09090B] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#DC2626]" /> Non-Negotiable Licensing &amp; Ethics Governance
        </h4>
        <p>
          Connectors are audited under Section 3.1 and Section 8 of the Master Build Specification. 
          Third-party data requiring paid API keys, premium tiers, or commercial licensing agreements are strictly barred from production pipelines.
        </p>
      </div>
    </div>
  );
};
