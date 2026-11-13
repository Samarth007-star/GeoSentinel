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
  Crown
} from 'lucide-react';
import { executeAnalysis } from '../../services/api';
import { AnalysisResult, ChatDynamicSection, ChatStrategyItem } from '../../types';

export interface ChatIntelligenceOutput {
  intent?: string;
  sections: ChatDynamicSection[];
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

// Format AI response dynamically using the intent-aware LLM sections output
const formatOutput = (res: AnalysisResult): ChatIntelligenceOutput => {
  const ans = res.answer;

  // 1. Dynamic intent-aware sections returned by Smart LLM Engine
  if (ans.chat_output?.sections && ans.chat_output.sections.length > 0) {
    const cleanSections: ChatDynamicSection[] = ans.chat_output.sections.map((sec) => ({
      ...sec,
      content: sec.content ? toSimpleWords(sec.content) : undefined,
      strategy_name: sec.strategy_name ? toSimpleWords(sec.strategy_name) : undefined,
      items: sec.items ? sec.items.map((item) => toSimpleWords(item)) : undefined,
      strategies: sec.strategies
        ? sec.strategies.map((st: ChatStrategyItem) => ({
            name: toSimpleWords(st.name),
            what_to_do: st.what_to_do ? toSimpleWords(st.what_to_do) : undefined,
            why_will_work: st.why_will_work ? toSimpleWords(st.why_will_work) : undefined,
            good_effect: toSimpleWords(st.good_effect),
            bad_effect: toSimpleWords(st.bad_effect),
            when_to_do: st.when_to_do ? toSimpleWords(st.when_to_do) : undefined,
            cost_effort: st.cost_effort ? toSimpleWords(st.cost_effort) : undefined,
            success_chance: st.success_chance ? toSimpleWords(st.success_chance) : undefined
          }))
        : undefined
    }));
    return {
      intent: ans.chat_output.intent,
      sections: cleanSections
    };
  }

  // 2. Legacy flat chat_output compatibility
  if (ans.chat_output?.risk) {
    const co = ans.chat_output;
    return {
      intent: 'RISK',
      sections: [
        { emoji: '⚠️', title: 'Risk', type: 'text', content: toSimpleWords(co.risk || '') },
        {
          emoji: '❓',
          title: 'Why Will Happen',
          type: 'bullets',
          items: (co.why_will_happen || []).map((w: string) => toSimpleWords(w))
        },
        { emoji: '🔴', title: 'Risk Level', type: 'badge', level: co.risk_level || 'Medium' },
        {
          emoji: '✅',
          title: 'Strategies',
          type: 'strategies',
          strategies: (co.strategies || []).map((s: string) => ({
            name: toSimpleWords(s),
            good_effect: 'Reduces uncertainty and protects key assets.',
            bad_effect: 'Takes time and resources to execute properly.'
          }))
        }
      ]
    };
  }

  // 3. Dynamic fallback from pipeline impact analysis & verified facts
  const rawRisk = ans.impact_analysis?.[0]?.direct_impact || ans.current_situation?.summary || '';
  const rawWhy = ans.impact_analysis?.[0]?.indirect_impact || '';
  const facts = ans.current_situation?.verified_facts || [];

  const whyPoints: string[] = [];
  if (rawWhy) whyPoints.push(toSimpleWords(rawWhy));
  facts.slice(0, 2).forEach((f) => whyPoints.push(toSimpleWords(f)));

  const strategies: ChatStrategyItem[] = (ans.strategy_recommendations || []).slice(0, 3).map((s) => ({
    name: toSimpleWords(`${s.title}: ${s.mechanism || s.objective}`),
    good_effect: toSimpleWords(s.benefits?.[0] || 'Helps protect stability and operations.'),
    bad_effect: toSimpleWords(s.tradeoffs?.[0] || 'Needs upfront planning and cost.')
  }));

  return {
    intent: 'RISK',
    sections: [
      {
        emoji: '⚠️',
        title: 'Risk',
        type: 'text',
        content: toSimpleWords(rawRisk) || 'Active economic and supply chain shifts require close monitoring.'
      },
      {
        emoji: '❓',
        title: 'Why Will Happen',
        type: 'bullets',
        items: whyPoints.length > 0 ? whyPoints : ['Global and regional market conditions are shifting rapidly.']
      },
      { emoji: '🟡', title: 'Risk Level', type: 'badge', level: 'Medium' },
      {
        emoji: '✅',
        title: 'Strategies',
        type: 'strategies',
        strategies:
          strategies.length > 0
            ? strategies
            : [
                {
                  name: 'Track official updates and keep backup plans ready.',
                  good_effect: 'Lets you react quickly if prices or rules change.',
                  bad_effect: 'Takes regular monitoring effort.'
                }
              ]
      }
    ]
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
          intent: 'RISK',
          sections: [
            {
              emoji: '⚠️',
              title: 'Risk',
              type: 'text',
              content: 'We could not reach the analysis server right now. The network connection took longer than expected.'
            },
            {
              emoji: '❓',
              title: 'Why Will Happen',
              type: 'bullets',
              items: [
                'The connection between local services timed out.',
                'The system is temporarily busy processing other requests.'
              ]
            },
            { emoji: '🟡', title: 'Risk Level', type: 'badge', level: 'Medium' },
            {
              emoji: '✅',
              title: 'Strategies',
              type: 'strategies',
              strategies: [
                {
                  name: 'Try asking again: Click Send once more to retry your query.',
                  good_effect: 'Refreshes the connection and runs a clean analysis.',
                  bad_effect: 'Takes a few extra seconds.'
                }
              ]
            }
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
        return 'text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full';
      case 'Medium':
        return 'text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full';
      case 'Low':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full';
      default:
        return 'text-[#DC2626] bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full';
    }
  };

  const suggestionCards = [
    {
      id: 'middle-east',
      title: "What are the latest verified developments involving Iran and the Strait of Hormuz, and what potential implications could they have for India's energy security?",
      short: 'Middle East conflict & oil supply for India',
      icon: Globe,
      color: 'text-[#DC2626] bg-red-50 border border-red-200'
    },
    {
      id: 'iran-payment',
      title: "If India didn't pay the price for oil to Iran, then what will be the effect on India?",
      short: "If India didn't pay for oil to Iran",
      icon: BarChart3,
      color: 'text-[#09090B] bg-zinc-100 border border-zinc-200'
    },
    {
      id: 'natural-disasters',
      title: 'What significant recent earthquakes or natural hazards are reported by the configured scientific data sources?',
      short: 'Recent earthquakes & natural disasters',
      icon: AlertTriangle,
      color: 'text-[#DC2626] bg-red-50 border border-red-200'
    },
    {
      id: 'india-economy',
      title: "What are the latest available indicators relevant to India's energy imports and economic exposure to Middle East instability?",
      short: "India's economy & Middle East tensions",
      icon: Users,
      color: 'text-[#09090B] bg-zinc-100 border border-zinc-200'
    }
  ];

  return (
    <div className="flex-1 w-full flex flex-col h-[calc(100vh-4rem)] bg-[#FAFAFA] relative overflow-hidden">
      {/* Subtle Crimson Ambient Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 45% at 50% 0%, rgba(220, 38, 38, 0.08), transparent 70%)'
        }}
      />

      {/* Scrollable Message History Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        <div className="w-full max-w-3xl mx-auto space-y-5 sm:space-y-6">

          {/* Empty State Welcome - Black, Red & White Showcase */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center text-center space-y-6 sm:space-y-7 pt-4 sm:pt-12 pb-4 animate-fadeIn">
              <div className="relative">
                <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-3xl bg-gradient-to-br from-[#09090B] via-[#991B1B] to-[#DC2626] flex items-center justify-center text-white shadow-[0_12px_36px_rgba(220,38,38,0.28)]">
                  <Globe className="w-7 h-7 sm:w-8 sm:h-8 stroke-[1.9]" />
                </div>
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-red-200 text-[#09090B] text-[9px] font-extrabold uppercase tracking-widest shadow-sm whitespace-nowrap">
                  <Crown className="w-2.5 h-2.5 stroke-[2.5] text-[#DC2626]" />
                  Live AI
                </span>
              </div>

              <div className="space-y-2 max-w-lg px-2 pt-1">
                <h1 className="text-2xl sm:text-4xl font-display font-bold bg-gradient-to-r from-[#09090B] via-[#DC2626] to-[#991B1B] bg-clip-text text-transparent tracking-tight">
                  How can I help you today?
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Ask any question about global events, markets, or strategic risks.
                  Clear insights backed by live news and real-time intelligence.
                </p>
              </div>

              {/* Crisp White Suggestion Cards with Black/Red Borders */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-2 text-left">
                {suggestionCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={card.id}
                      onClick={() => handleSend(card.title)}
                      disabled={loading}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-zinc-200 hover:border-red-400 hover:shadow-[0_12px_30px_rgba(220,38,38,0.12)] transition-all text-left group flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-[#09090B] group-hover:text-[#DC2626] transition-colors block">
                          {card.short}
                        </span>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                          {card.title}
                        </p>
                      </div>
                      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${card.color} flex items-center justify-center shrink-0 mt-0.5`}>
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
                /* User Message: Right Side Black-Red Gradient */
                <div className="flex justify-end items-end gap-2 sm:gap-2.5">
                  <div className="bg-gradient-to-br from-[#09090B] via-[#B91C1C] to-[#DC2626] text-white rounded-3xl rounded-br-sm px-4 sm:px-5 py-3 sm:py-3.5 max-w-[85%] sm:max-w-2xl text-xs sm:text-sm leading-relaxed shadow-[0_8px_24px_rgba(220,38,38,0.22)]">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[#DC2626] shrink-0 mb-0.5 shadow-xs">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
                  </div>
                </div>
              ) : (
                /* AI Message: Left Side - Crisp White Card */
                <div className="flex justify-start items-start gap-2.5 sm:gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#09090B] via-[#B91C1C] to-[#DC2626] flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm p-4 sm:p-6 max-w-full sm:max-w-2xl w-full shadow-[0_10px_35px_rgba(9,9,11,0.06)] space-y-4 sm:space-y-5 text-zinc-800">
                    {msg.output?.sections?.map((sec, sIdx) => {
                      if (sec.type === 'badge') {
                        return (
                          <div key={sIdx} className="flex flex-wrap items-center gap-2 pl-0.5 pt-0.5">
                            <span className="text-xs sm:text-sm font-bold text-[#09090B] flex items-center gap-1.5">
                              <span>{sec.emoji || getRiskLevelEmoji(sec.level)}</span>
                              <span>{sec.title}:</span>
                            </span>
                            <span className={`text-xs font-bold ${getRiskLevelTextColor(sec.level)}`}>
                              {sec.level || 'Medium'}
                            </span>
                          </div>
                        );
                      }

                      if (sec.type === 'bullets' && sec.items && sec.items.length > 0) {
                        const isGood = sec.title.toLowerCase().includes('good');
                        const isBad = sec.title.toLowerCase().includes('bad');
                        const bulletColor = isGood
                          ? 'text-emerald-600'
                          : isBad
                            ? 'text-[#DC2626]'
                            : 'text-[#DC2626]';

                        return (
                          <div key={sIdx} className="space-y-2">
                            <div className="text-xs sm:text-sm font-bold text-[#09090B] flex items-center gap-1.5">
                              <span>{sec.emoji}</span>
                              <span>{sec.title}:</span>
                            </div>
                            <ul className="space-y-1.5 pl-1">
                              {sec.items.map((item, iIdx) => (
                                <li key={iIdx} className="text-xs sm:text-sm text-zinc-700 flex items-start gap-2 leading-relaxed">
                                  <span className={`${bulletColor} font-bold shrink-0`}>•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }

                      if (sec.type === 'strategies' && sec.strategies && sec.strategies.length > 0) {
                        return (
                          <div key={sIdx} className="space-y-3 pt-0.5">
                            <div className="text-xs sm:text-sm font-bold text-[#09090B] flex items-center gap-1.5">
                              <span>{sec.emoji}</span>
                              <span>{sec.title}:</span>
                            </div>
                            <div className="space-y-3 pl-0.5">
                              {sec.strategies.map((strat, stIdx) => (
                                <div
                                  key={stIdx}
                                  className="text-sm text-zinc-700 bg-[#FAFAFA] border border-zinc-200 hover:border-red-300 rounded-xl p-3.5 sm:p-4 space-y-2 transition-colors shadow-xs"
                                >
                                  <div className="font-bold text-[#DC2626] text-xs sm:text-sm flex items-center gap-1.5">
                                    <span>🎯</span>
                                    <span>{strat.name}</span>
                                  </div>

                                  {strat.what_to_do && (
                                    <div className="text-xs sm:text-sm text-zinc-800 leading-relaxed">
                                      <span className="font-bold text-[#09090B]">What To Do: </span>
                                      <span>{strat.what_to_do}</span>
                                    </div>
                                  )}

                                  {strat.why_will_work && (
                                    <div className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                                      <span className="font-bold text-zinc-800">Why This Will Work: </span>
                                      <span>{strat.why_will_work}</span>
                                    </div>
                                  )}

                                  <div className="text-xs sm:text-sm text-emerald-700 leading-relaxed">
                                    <span className="font-bold">Good Effect: </span>
                                    <span>{strat.good_effect}</span>
                                  </div>

                                  <div className="text-xs sm:text-sm text-[#DC2626] leading-relaxed">
                                    <span className="font-bold">Bad Effect / Risk: </span>
                                    <span>{strat.bad_effect}</span>
                                  </div>

                                  {(strat.when_to_do || strat.cost_effort || strat.success_chance) && (
                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1.5 text-[11px] sm:text-xs">
                                      {strat.when_to_do && (
                                        <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-[#DC2626] border border-red-200 font-medium">
                                          When: {strat.when_to_do}
                                        </span>
                                      )}
                                      {strat.cost_effort && (
                                        <span className="px-2.5 py-0.5 rounded-full bg-white text-zinc-700 border border-zinc-200 font-medium">
                                          Cost / Effort: {strat.cost_effort}
                                        </span>
                                      )}
                                      {strat.success_chance && (
                                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                          Success Chance: {strat.success_chance}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      if (sec.type === 'best_strategy') {
                        return (
                          <div
                            key={sIdx}
                            className="bg-gradient-to-br from-red-50 via-white to-zinc-50 border border-red-300 rounded-xl p-4 space-y-1.5 shadow-[0_6px_22px_rgba(220,38,38,0.08)]"
                          >
                            <div className="text-xs sm:text-sm font-bold text-[#DC2626] flex items-center gap-1.5">
                              <span>{sec.emoji || '🏆'}</span>
                              <span>{sec.title}:</span>
                            </div>
                            {sec.strategy_name && (
                              <div className="text-xs sm:text-sm font-bold text-[#09090B]">
                                {sec.strategy_name}
                              </div>
                            )}
                            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed">
                              {sec.content}
                            </p>
                          </div>
                        );
                      }

                      const isPlainConversationalText =
                        !sec.title || sec.title.toLowerCase() === 'message';

                      if (isPlainConversationalText) {
                        return (
                          <div key={sIdx} className="text-xs sm:text-sm text-zinc-700 leading-relaxed flex items-start gap-2">
                            {sec.emoji && <span className="shrink-0">{sec.emoji}</span>}
                            <span>{sec.content}</span>
                          </div>
                        );
                      }

                      return (
                        <div key={sIdx} className="space-y-1.5">
                          <div className="text-xs sm:text-sm font-bold text-[#09090B] flex items-center gap-1.5">
                            <span>{sec.emoji}</span>
                            <span>{sec.title}{/[!?:]$/.test(sec.title) ? '' : ':'}</span>
                          </div>
                          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed pl-0.5">
                            {sec.content}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* AI Thinking / Processing State */}
          {loading && (
            <div className="flex justify-start items-start gap-2.5 sm:gap-3 animate-fadeIn">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#09090B] via-[#B91C1C] to-[#DC2626] flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3.5 max-w-sm flex items-center gap-3 text-[#09090B] text-xs shadow-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-[#DC2626]" />
                <span>Analyzing... Fetching live data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Bottom User Input Bar - Black, Red & White */}
      <div className="relative z-10 sticky bottom-0 bg-white/95 backdrop-blur-xl border-t border-zinc-200 p-3 sm:p-4 w-full shrink-0 shadow-[0_-8px_30px_rgba(9,9,11,0.05)]">
        <div className="max-w-3xl mx-auto w-full space-y-1.5 sm:space-y-2">
          <div className="flex items-end gap-2 sm:gap-2.5 bg-white border border-zinc-300 rounded-3xl p-2 sm:p-2.5 focus-within:border-[#DC2626] focus-within:ring-4 focus-within:ring-red-500/10 transition-all shadow-[0_6px_25px_rgba(9,9,11,0.06)]">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask your Query"
              className="flex-1 bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 max-h-32 px-3 py-1.5 leading-relaxed"
            />

            <button
              type="button"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-[#09090B] via-[#B91C1C] to-[#DC2626] hover:from-[#18181B] hover:to-[#B91C1C] disabled:opacity-35 text-white flex items-center justify-center shrink-0 transition shadow-[0_4px_14px_rgba(220,38,38,0.3)] active:scale-95"
              title="Send Message"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5 stroke-[2.2]" />
              )}
            </button>
          </div>

          <p className="text-[10px] sm:text-[11px] text-zinc-400 text-center select-none tracking-wide">
            <span className="text-[#DC2626] font-semibold">GeoSentinel</span> • Live Global Intelligence &amp; Actionable Strategy
          </p>
        </div>
      </div>

    </div>
  );
};
