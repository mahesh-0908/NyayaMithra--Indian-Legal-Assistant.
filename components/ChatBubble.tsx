
import React, { useState, useMemo } from 'react';
import { Message, Role } from '../types';
import { marked } from 'marked';

interface ChatBubbleProps {
  message: Message;
  onSuggestionClick?: (suggestion: string) => void;
  onJargonClick?: (term: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onSuggestionClick, onJargonClick }) => {
  const isBot = message.role === Role.BOT;
  const isError = message.isError;

  // Extract keywords from user query for highlighting
  const keywords = useMemo(() => {
    if (!message.query) return [];
    // Stop words to ignore
    const stopWords = new Set(['the', 'and', 'for', 'was', 'with', 'law', 'case', 'india', 'indian', 'statute', 'section', 'act', 'judgments', 'judgement', 'summary']);
    return message.query
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }, [message.query]);

  const highlightText = (text: string) => {
    if (keywords.length === 0) return text;
    
    let highlighted = text;
    // We sort keywords by length descending to ensure longer phrases are matched first
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    
    // Using a set to track already replaced segments to avoid nested highlights
    sortedKeywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      // Using a temporary placeholder to avoid double highlighting
      highlighted = highlighted.replace(regex, `<mark class="bg-amber-100 text-amber-900 px-0.5 rounded-sm">$1</mark>`);
    });
    
    return highlighted;
  };

  const renderText = (text: string) => {
    let processed = text;
    const jargonTerms: string[] = [];
    
    // Preserve Jargon formatting - store the term name
    processed = processed.replace(/\[\[(.*?)\|(.*?)\]\]/g, (_, term, def) => {
      jargonTerms.push(term);
      return `__JARGON_START__${jargonTerms.length - 1}__JARGON_END__`;
    });

    const html = marked.parse(processed) as string;
    
    // Apply Highlight and Re-insert Jargon
    let finalHtml = highlightText(html);
    
    finalHtml = finalHtml.replace(/__JARGON_START__(\d+)__JARGON_END__/g, (_, idx) => {
      const term = jargonTerms[parseInt(idx)];
      return `<span class="jargon-term" data-term="${term}">${term}</span>`;
    });

    return (
      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: finalHtml }}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.classList.contains('jargon-term')) {
            const term = target.getAttribute('data-term');
            if (term) onJargonClick?.(term);
          }
        }}
      />
    );
  };

  const renderSourceTitle = (title: string) => {
    if (keywords.length === 0) return title;
    
    let highlighted = title;
    keywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      highlighted = highlighted.replace(regex, `<mark class="bg-amber-50 text-amber-800 font-extrabold">$1</mark>`);
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex flex-col max-w-[90%] md:max-w-[85%] lg:max-w-[80%] ${isBot ? 'items-start' : 'items-end'}`}>
        
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {message.attachments.map((att, i) => (
              <div key={i} className="bg-white p-2 rounded-2xl shadow-md border border-slate-100 flex items-center space-x-3">
                <img src={`data:${att.mimeType};base64,${att.data}`} alt="att" className="h-12 w-12 rounded-lg object-cover" />
                <div className="pr-2">
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tighter truncate max-w-[100px]">{att.name}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Evidence Scan</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} items-start`}>
          <div className={`flex-shrink-0 h-8 w-8 md:h-10 md:w-10 rounded-xl flex items-center justify-center shadow-lg no-print ${
            isBot 
              ? isError ? 'bg-red-500 text-white mr-2 md:mr-4' : 'gold-gradient text-white mr-2 md:mr-4' 
              : 'bg-slate-200 text-slate-600 ml-2 md:ml-4'
          }`}>
            <i className={`fas ${isBot ? (isError ? 'fa-triangle-exclamation text-xs' : 'fa-balance-scale text-xs md:text-base') : 'fa-user text-xs'}`}></i>
          </div>
          
          <div className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
            <div className={`message-bubble px-4 py-3 md:px-6 md:py-5 rounded-3xl shadow-sm border transition-all ${
              isBot 
                ? isError 
                  ? 'bg-red-50 text-red-900 border-red-200 rounded-tl-none' 
                  : 'bg-white text-slate-800 border-slate-200 rounded-tl-none' 
                : 'bg-slate-900 text-white border-slate-800 rounded-tr-none'
            }`}>
              {renderText(message.text)}
            </div>
          </div>
        </div>

        {/* Case Laws & Grounding Sources */}
        {isBot && message.sources && message.sources.length > 0 && (
          <div className="mt-4 ml-10 md:ml-14 w-full">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center">
              <i className="fas fa-landmark-flag mr-2 text-amber-600"></i>
              Verified Citations & Judgments
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white border border-slate-100 hover:border-amber-200 p-3 rounded-xl flex items-start space-x-3 transition-all hover:shadow-md group no-print"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-amber-50">
                    <i className="fas fa-file-invoice text-amber-600 text-xs"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate leading-tight mb-1">
                      {renderSourceTitle(source.title)}
                    </p>
                    <p className="text-[9px] text-amber-600 font-bold uppercase tracking-tighter flex items-center">
                      View Full Judgment <i className="fas fa-arrow-up-right-from-square ml-1 text-[7px]"></i>
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {isBot && !isError && message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-5 ml-10 md:ml-14 no-print">
            {message.suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick?.(s)}
                className="text-[10px] font-bold uppercase tracking-widest bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-700 px-4 py-2.5 rounded-xl border border-slate-200 transition-all shadow-sm flex items-center"
              >
                <i className="fas fa-magnifying-glass mr-2 text-[9px] opacity-40"></i>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
