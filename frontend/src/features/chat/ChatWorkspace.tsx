import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  BarChart3,
  AlertTriangle,
  Users,
  Send,
  Loader2,
  Bot,
  User,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { executeAnalysis } from '../../services/api';
import { AnalysisResult } from '../../types';

export interface ChatIntelligenceOutput {
  risk: string;
  whyWillHappen: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  strategies: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text?: string;
  output?: ChatIntelligenceOutput;
  timestamp: Date;
}

interface ChatWorkspaceProps {
  selectedQuery?: string;
  onClearSelectedQuery?: () => void;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export const ChatWorkspace: React.FC<ChatWorkspaceProps> = ({
  selectedQuery,
  onClearSelectedQuery,
  messages,
  setMessages
}) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle query selected from LeftSidebar recent chats
  useEffect(() => {
    if (selectedQuery && selectedQuery.trim()) {
      handleSend(selectedQuery);
      if (onClearSelectedQuery) {
        onClearSelectedQuery();
      }
    }
  }, [selectedQuery]);

  // Format AI response to strictly output ONLY the 4 required fields
  const formatOutput = (res: AnalysisResult): ChatIntelligenceOutput => {
    const ans = res.answer;

    // 1. Risk
    let risk = '';
    if (ans.impact_analysis && ans.impact_analysis.length > 0) {
      const primary = ans.impact_analysis[0];
      risk = primary.direct_impact;
      if (ans.impact_analysis.length > 1 && ans.impact_analysis[1].direct_impact) {
        risk += ` Additionally, ${ans.impact_analysis[1].direct_impact.toLowerCase()}`;
      }
    } else if (ans.current_situation?.summary) {
      risk = ans.current_situation.summary;
    } else {
      risk = 'Systemic supply friction and elevated market volatility across regional trade networks.';
    }

    // 2. Why Will Happen
    let why = '';
    const facts = ans.current_situation?.verified_facts || [];
    const cleanFacts = facts.map((f) => f.replace(/^\[.*?\]\s*/, '')).filter(Boolean);

    if (ans.impact_analysis && ans.impact_analysis.length > 0 && ans.impact_analysis[0].indirect_impact) {
      why = ans.impact_analysis[0].indirect_impact;
      if (cleanFacts.length > 0) {
        why += ` Key drivers: ${cleanFacts.slice(0, 2).join('; ')}.`;
      }
    } else if (cleanFacts.length > 0) {
      why = cleanFacts.slice(0, 3).join('. ');
    } else {
      why = 'Structural macroeconomic import exposure and interconnected logistics corridors propagate downstream pressure.';
    }

    // 3. Risk Level: strictly one of [Low / Medium / High / Critical]
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = 'High';
    const uncertainties = (ans.impact_analysis || []).map((i) => (i.uncertainty || '').toUpperCase());
    const riskStatuses = (ans.strategy_recommendations || []).map((s) => (s.risk_review_status || '').toUpperCase());

    if (riskStatuses.includes('WITHHOLD') || riskStatuses.includes('REJECTED')) {
      riskLevel = 'Critical';
    } else if (uncertainties.includes('HIGH') || (ans.impact_analysis && ans.impact_analysis.length >= 2)) {
      riskLevel = 'High';
    } else if (uncertainties.includes('MEDIUM')) {
      riskLevel = 'Medium';
    } else {
      riskLevel = 'Low';
    }

    // 4. Strategies
    const strategies: string[] = [];
    if (ans.strategy_recommendations && ans.strategy_recommendations.length > 0) {
      ans.strategy_recommendations.forEach((strat) => {
        let cleanMech = strat.mechanism || strat.objective;
        cleanMech = cleanMech.replace(/\[(?:STRATEGY_PARAM:\s*)?(?:SCENARIO_ASSUMPTION:\s*)?([^\]]+)\]/gi, '$1');
        strategies.push(`${strat.title}: ${cleanMech}`);
      });
    } else {
      strategies.push('Strategic Sourcing Diversification: Execute alternative term-supply contracts to reduce single-corridor dependency.');
      strategies.push('Strategic Reserve Buffer Deployment: Release domestic buffer reserves to mitigate short-term pricing volatility.');
    }

    return {
      risk,
      whyWillHappen: why,
      riskLevel,
      strategies
    };
  };

  const handleSend = async (customQuery?: string) => {
    const q = customQuery || input;
    if (!q.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await executeAnalysis(q.trim(), ['IND', 'IRN', 'USA'], '30d');
      const formatted = formatOutput(res);

      const assistantMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        output: formatted,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: `ai_err_${Date.now()}`,
        sender: 'assistant',
        output: {
          risk: 'Temporary communication timeout while contacting reasoning service.',
          whyWillHappen: 'Local network or connector query latency exceeded the responsive threshold.',
          riskLevel: 'Medium',
          strategies: [
            'Retry Inquiry: Submit the query again to re-engage active connectors.',
            'Offline Mode: Local deterministic reasoning engine remains accessible.'
          ]
        },
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getRiskLevelBadge = (level: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Medium':
        return 'bg-sky-50 text-sky-700 border-sky-300';
      case 'Low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-300';
    }
  };

  const suggestionCards = [
    {
      id: 'middle-east',
      title: "What are the latest verified developments involving Iran and the Strait of Hormuz, and what potential implications could they have for India's energy security?",
      short: 'Latest developments in Middle East & Hormuz?',
      icon: Globe,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'iran-payment',
      title: "If India didn't pay the price for oil to Iran, then what will be the effect on India?",
      short: "If India didn't pay for oil to Iran?",
      icon: BarChart3,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'natural-disasters',
      title: 'What significant recent earthquakes or natural hazards are reported by the configured scientific data sources?',
      short: 'Recent natural hazards & seismic events?',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50'
    },
    {
      id: 'india-economy',
      title: "What are the latest available indicators relevant to India's energy imports and economic exposure to Middle East instability?",
      short: "Impact on India's energy & economic exposure?",
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  return (
    <div className="flex-1 w-full flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
      
      {/* Scrollable Message History Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="w-full max-w-4xl mx-auto space-y-6">

          {/* Empty State Welcome when no messages exist */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center space-y-8 pt-8 sm:pt-14 pb-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Globe className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="space-y-2.5 max-w-lg">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
                  How can I help you today?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Ask any question regarding global events, trade chokepoints, or geopolitical risks.
                  Outputs are strictly structured with direct risk analysis and mitigation strategies.
                </p>
              </div>

              {/* Suggestion cards for quick launch */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
                {suggestionCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleSend(card.title)}
                      disabled={loading}
                      className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all text-left group flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors block">
                          {card.short}
                        </span>
                        <p className="text-[11px] text-slate-400 line-clamp-2">
                          {card.title}
                        </p>
                      </div>
                      <div className={`w-8 h-8 rounded-xl ${card.color} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className="w-4 h-4 text-current" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Render All Chat Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className="w-full animate-fadeIn">
              {msg.sender === 'user' ? (
                /* User Message: Right Side */
                <div className="flex justify-end items-end gap-2.5">
                  <div className="bg-blue-600 text-white rounded-3xl rounded-br-sm px-5 py-3.5 max-w-2xl text-sm leading-relaxed shadow-sm">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0 mb-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                /* AI Message: Left Side - STRICTLY 4 REQUIRED FIELDS */
                <div className="flex justify-start items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-3xl rounded-tl-sm p-5 sm:p-6 max-w-3xl w-full shadow-sm space-y-4 text-slate-800">
                    
                    {/* 1. Risk */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-600 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Risk:</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900 leading-relaxed pl-1">
                        {msg.output?.risk}
                      </p>
                    </div>

                    {/* 2. Why Will Happen */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                        <span>Why Will Happen:</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed pl-1">
                        {msg.output?.whyWillHappen}
                      </p>
                    </div>

                    {/* 3. Risk Level: [Low / Medium / High / Critical] */}
                    <div className="flex items-center gap-2 pl-1 pt-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        Risk Level:
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold border ${
                          msg.output ? getRiskLevelBadge(msg.output.riskLevel) : ''
                        }`}
                      >
                        {msg.output?.riskLevel}
                      </span>
                    </div>

                    {/* 4. Strategies */}
                    <div className="pt-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Strategies:</span>
                      </div>
                      <ul className="space-y-2 pl-1">
                        {msg.output?.strategies.map((strat, sIdx) => (
                          <li
                            key={sIdx}
                            className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-3 leading-relaxed"
                          >
                            <span className="font-semibold text-slate-900">• </span>
                            {strat}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking / Processing State */}
          {loading && (
            <div className="flex justify-start items-start gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-3xl rounded-tl-sm px-5 py-4 max-w-sm flex items-center gap-3 text-slate-600 text-xs shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Evaluating risk indicators & causal pathways...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom User Input Bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3 sm:p-4 w-full shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto w-full space-y-2">
          <div className="flex items-end gap-2.5 bg-slate-50 border border-slate-200/90 rounded-3xl p-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Enter your question here (Press Enter to send)..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-slate-800 placeholder-slate-400 max-h-32 px-3 py-1.5 leading-relaxed"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center shrink-0 transition shadow-sm active:scale-95"
              title="Send Message"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center select-none">
            GeoSentinel AI Intelligence • Responses strictly formatted to Risk, Cause, Level & Strategies
          </p>
        </div>
      </div>

    </div>
  );
};
