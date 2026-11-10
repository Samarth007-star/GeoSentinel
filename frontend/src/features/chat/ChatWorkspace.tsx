import React, { useState, useEffect, useRef } from 'react';
import {
  Globe,
  BarChart3,
  AlertTriangle,
  Users,
  Send,
  Loader2,
  Bot,
  User
} from 'lucide-react';
import { executeAnalysis } from '../../services/api';
import { AnalysisResult } from '../../types';

export interface ChatIntelligenceOutput {
  risk: string;
  whyWillHappen: string[];
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

// Convert complex, technical phrases into simple everyday English that anyone can understand
function toSimpleWords(text: string): string {
  if (!text) return '';

  let s = text
    .replace(/sudden upward pressure on landed crude import bill and foreign exchange reserves/gi, 'Oil import costs will jump quickly, which will drain national foreign savings')
    .replace(/landed crude import bill/gi, 'oil import costs')
    .replace(/foreign exchange reserves/gi, 'foreign currency savings')
    .replace(/rerouting of westbound commercial aviation corridors increasing transit time and fuel burn/gi, 'Westbound flights will take longer routes and burn more fuel, making travel more expensive')
    .replace(/rerouting of westbound commercial aviation corridors/gi, 'flights taking longer routes')
    .replace(/increasing transit time and fuel burn/gi, 'causing flight delays and higher fuel costs')
    .replace(/higher logistics freight rates filtering into vegetable and fertilizer supply chains/gi, 'Higher truck and shipping charges will push up the prices of daily vegetables and farm supplies')
    .replace(/logistics freight rates/gi, 'transport costs')
    .replace(/filtering into/gi, 'leading to price rises in')
    .replace(/supply friction/gi, 'supply delays and shortages')
    .replace(/elevated market volatility/gi, 'sharp price fluctuations in the market')
    .replace(/regional trade networks/gi, 'normal trading routes')
    .replace(/structural macroeconomic import exposure/gi, 'Heavy reliance on imported goods')
    .replace(/interconnected logistics corridors propagate downstream pressure/gi, 'trouble on shipping routes quickly leads to higher prices for everyday buyers')
    .replace(/systemic supply friction/gi, 'Trade slowdowns and cargo delays')
    .replace(/localized structural damage assessments and emergency utility shutoffs/gi, 'Emergency checks on buildings and safety shutoffs for electricity and gas')
    .replace(/temporary closure of transport corridors and diversion of civil defense logistics resources/gi, 'Temporary road and train closures while rescue teams help local citizens')
    .replace(/official world bank indicators confirm resilient real gdp growth \((.*?)\) anchored by domestic investment, while headline cpi inflation remains moderate at ~?(.*?)/gi, 'Economic data shows India\'s growth is steady at $1, with everyday price inflation staying low at about $2')
    .replace(/official world bank indicators confirm resilient real gdp growth/gi, 'Economic reports confirm steady national growth')
    .replace(/anchored by domestic investment/gi, 'supported by strong local business')
    .replace(/headline cpi inflation/gi, 'retail inflation (price rise)')
    .replace(/stable price indices reduce corporate borrowing yield volatility and sustain rural and urban purchasing power/gi, 'Stable prices keep loans affordable for businesses and protect everyday household budgets')
    .replace(/India imports approximately 85% to 88% of its domestic crude oil requirements, with roughly 55% to 60% of total crude imports historically routed through the Persian Gulf and Strait of Hormuz\./gi, 'India buys about 85% to 88% of its oil from overseas, with more than half passing through the Persian Gulf.')
    .replace(/India maintains 5\.33 million metric tonnes \(MMT\) of underground strategic crude oil storage at Padur \(2\.5 MMT\), Mangalore \(1\.5 MMT\), and Visakhapatnam \(1\.33 MMT\), providing approximately 9\.5 days of net crude import protection\./gi, 'India stores emergency oil underground at three sites, which can cover around 9 to 10 days of national needs.')
    .replace(/USGS recorded a magnitude ([\d\.]+) earthquake located at ([^\.]+)\./gi, 'A magnitude $1 earthquake occurred near $2.')
    .replace(/Key drivers:\s*/gi, '')
    .replace(/corridors/gi, 'routes')
    .replace(/arterials/gi, 'highways')
    .replace(/perishable goods/gi, 'fresh food and vegetables')
    .replace(/telemetry/gi, 'sensor alerts')
    .replace(/seismic tremor/gi, 'earthquake shaking')
    .replace(/precautionary/gi, 'safety')
    .replace(/commercial aviation/gi, 'passenger flight')
    .replace(/macroeconomic/gi, 'national economic')
    .replace(/volatility/gi, 'instability')
    .replace(/logistics/gi, 'transportation')
    .replace(/bilateral/gi, 'two-way')
    .replace(/diversification/gi, 'buying from multiple sources')
    .replace(/resilient/gi, 'strong')
    .replace(/statutory/gi, 'official')
    .replace(/surveillance/gi, 'monitoring')
    .replace(/merchandise trade/gi, 'trade in physical goods');

  // Strip brackets, parameters, or references
  s = s.replace(/\[.*?\]/g, '').trim();
  s = s.replace(/\s{2,}/g, ' ');
  return s;
}

// Format AI response dynamically using the fresh LLM & live data output
const formatOutput = (res: AnalysisResult): ChatIntelligenceOutput => {
  const ans = res.answer;

  // 1. If backend returned fresh live LLM chat output, use it directly!
  if (ans.chat_output) {
    const co = ans.chat_output;
    return {
      risk: toSimpleWords(co.risk || ''),
      whyWillHappen: (co.why_will_happen || []).map((w: string) => toSimpleWords(w)),
      riskLevel: co.risk_level || 'Medium',
      strategies: (co.strategies || []).map((s: string) => toSimpleWords(s))
    };
  }

  // 2. Dynamic fallback from impact analysis & verified facts
  const rawRisk = ans.impact_analysis?.[0]?.direct_impact || ans.current_situation?.summary || '';
  const rawWhy = ans.impact_analysis?.[0]?.indirect_impact || '';
  const facts = ans.current_situation?.verified_facts || [];

  const whyPoints: string[] = [];
  if (rawWhy) whyPoints.push(toSimpleWords(rawWhy));
  facts.slice(0, 2).forEach((f) => whyPoints.push(toSimpleWords(f)));

  const strategies: string[] = [];
  (ans.strategy_recommendations || []).slice(0, 3).forEach((s) => {
    strategies.push(toSimpleWords(`${s.title}: ${s.mechanism || s.objective}`));
  });

  return {
    risk: toSimpleWords(rawRisk) || 'Active economic and supply chain shifts require close monitoring.',
    whyWillHappen: whyPoints.length > 0 ? whyPoints : ['Global and regional market conditions are shifting rapidly.'],
    riskLevel: 'Medium',
    strategies: strategies.length > 0 ? strategies : ['Track official indicators and maintain flexible supplier terms.']
  };
};

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
          risk: 'We could not reach the analysis server right now. The network connection took longer than expected.',
          whyWillHappen: [
            'The connection between local services timed out.',
            'The system is temporarily busy processing other requests.'
          ],
          riskLevel: 'Medium',
          strategies: [
            'Try asking again: Click Send once more to retry your query.',
            'Check server status: Ensure the background services are active.'
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

  const getRiskLevelEmoji = (level?: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (level) {
      case 'Critical':
      case 'High':
        return '🔴';
      case 'Medium':
        return '🟡';
      case 'Low':
        return '🟢';
      default:
        return '🔴';
    }
  };

  const getRiskLevelTextColor = (level?: 'Low' | 'Medium' | 'High' | 'Critical') => {
    switch (level) {
      case 'Critical':
      case 'High':
        return 'text-rose-600';
      case 'Medium':
        return 'text-amber-600';
      case 'Low':
        return 'text-emerald-600';
      default:
        return 'text-slate-800';
    }
  };

  const suggestionCards = [
    {
      id: 'middle-east',
      title: "What are the latest verified developments involving Iran and the Strait of Hormuz, and what potential implications could they have for India's energy security?",
      short: 'Middle East conflict & oil supply for India',
      icon: Globe,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'iran-payment',
      title: "If India didn't pay the price for oil to Iran, then what will be the effect on India?",
      short: "If India didn't pay for oil to Iran",
      icon: BarChart3,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 'natural-disasters',
      title: 'What significant recent earthquakes or natural hazards are reported by the configured scientific data sources?',
      short: 'Recent earthquakes & natural disasters',
      icon: AlertTriangle,
      color: 'text-rose-600 bg-rose-50'
    },
    {
      id: 'india-economy',
      title: "What are the latest available indicators relevant to India's energy imports and economic exposure to Middle East instability?",
      short: "India's economy & Middle East tensions",
      icon: Users,
      color: 'text-indigo-600 bg-indigo-50'
    }
  ];

  return (
    <div className="flex-1 w-full flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
      
      {/* Scrollable Message History Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="w-full max-w-3xl mx-auto space-y-6">

          {/* Empty State Welcome when no messages exist */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center space-y-8 pt-8 sm:pt-14 pb-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <Globe className="w-8 h-8 stroke-[2]" />
              </div>

              <div className="space-y-2 max-w-lg">
                <h1 className="text-3xl sm:text-4xl font-display font-bold text-slate-900 tracking-tight">
                  How can I help you today?
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Ask any question about global events, trade routes, or economic risks.
                  Outputs are short, simple, and easy to understand.
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
                /* AI Message: Left Side - ChatGPT / Gemini Clean Style with 4 Exact Sections */
                <div className="flex justify-start items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-1 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-sm p-5 sm:p-6 max-w-2xl w-full shadow-sm space-y-5 text-slate-800">
                    
                    {/* 1. ⚠️ Risk: Simple 2-3 lines explanation */}
                    <div className="space-y-1.5">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>Risk:</span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed pl-0.5">
                        {msg.output?.risk}
                      </p>
                    </div>

                    {/* 2. ❓ Why Will Happen: Simple points in easy words */}
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>❓</span>
                        <span>Why Will Happen:</span>
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        {msg.output?.whyWillHappen?.map((item, idx) => (
                          <li key={idx} className="text-sm text-slate-700 flex items-start gap-2 leading-relaxed">
                            <span className="text-slate-400 font-bold shrink-0">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 3. 🔴 Risk Level: High / Medium / Low */}
                    <div className="flex items-center gap-2 pl-0.5 pt-0.5">
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{getRiskLevelEmoji(msg.output?.riskLevel)}</span>
                        <span>Risk Level:</span>
                      </span>
                      <span className={`text-sm font-bold ${getRiskLevelTextColor(msg.output?.riskLevel)}`}>
                        {msg.output?.riskLevel}
                      </span>
                    </div>

                    {/* 4. ✅ Strategies: Simple steps in easy words */}
                    <div className="space-y-2 pt-0.5">
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>✅</span>
                        <span>Strategies:</span>
                      </div>
                      <ul className="space-y-2 pl-0.5">
                        {msg.output?.strategies?.map((strat, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-3 leading-relaxed flex items-start gap-2.5"
                          >
                            <span className="text-emerald-600 font-bold shrink-0 mt-0.5">•</span>
                            <span>{strat}</span>
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
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl rounded-tl-sm px-5 py-4 max-w-sm flex items-center gap-3 text-slate-600 text-xs shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Analyzing... Fetching live data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom User Input Bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 p-3 sm:p-4 w-full shrink-0 shadow-lg">
        <div className="max-w-3xl mx-auto w-full space-y-2">
          <div className="flex items-end gap-2.5 bg-slate-50 border border-slate-200/90 rounded-3xl p-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask a question in plain English (Press Enter to send)..."
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
            GeoSentinel AI • Clear risks and simple mitigation steps
          </p>
        </div>
      </div>

    </div>
  );
};
