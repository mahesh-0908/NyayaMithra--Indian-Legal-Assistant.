
import React, { useState, useMemo } from 'react';
import { searchCaseLaws } from '../services/geminiService';
import { CaseLawResult, Language } from '../types';
import { UI_TRANSLATIONS } from '../constants';

interface CaseLawSearchProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const CaseLawSearch: React.FC<CaseLawSearchProps> = ({ isOpen, onClose, language }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CaseLawResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const t = UI_TRANSLATIONS[language];

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const data = await searchCaseLaws(query, language);
      setResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const keywords = useMemo(() => {
    if (!query) return [];
    const stopWords = new Set(['the', 'and', 'for', 'was', 'with', 'law', 'case', 'india', 'indian', 'statute', 'section', 'act', 'judgments', 'judgement', 'summary', 'of', 'in', 'to', 'a']);
    return query
      .toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }, [query]);

  const highlight = (text: string) => {
    if (keywords.length === 0 || !text) return text;
    let highlighted = text;
    const sortedKeywords = [...keywords].sort((a, b) => b.length - a.length);
    sortedKeywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      highlighted = highlighted.replace(regex, `<mark class="bg-amber-100 text-amber-900 px-0.5 rounded-sm font-semibold">$1</mark>`);
    });
    return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-400">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-200">
              <i className="fas fa-landmark-flag text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold font-serif text-slate-900">{t.precedents}</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Dedicated Case Law Research Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 hover:bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all flex items-center justify-center">
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        {/* Search Input Area */}
        <div className="p-8 bg-slate-50/50 border-b border-slate-100">
          <div className="max-w-3xl mx-auto flex gap-4">
            <div className="relative flex-1">
              <i className="fas fa-magnifying-glass absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder={t.placeholderCaseLaw}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-3xl focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all text-base font-medium shadow-sm"
              />
            </div>
            <button 
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className={`px-8 rounded-3xl font-bold text-sm transition-all shadow-lg ${
                isSearching || !query.trim() 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
              }`}
            >
              {isSearching ? <i className="fas fa-spinner fa-spin mr-2"></i> : null}
              Search
            </button>
          </div>
          
          <div className="flex justify-center gap-3 mt-4">
            {['Landmark Judgments', 'Section 302 cases', 'Property disputes', 'Habeas Corpus precedents'].map(tag => (
              <button 
                key={tag}
                onClick={() => { setQuery(tag); handleSearch(); }}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 hover:underline px-2"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 animate-pulse">
              <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-slate-900 animate-spin mb-6"></div>
              <p className="font-bold text-lg text-slate-900">{t.searchingCases}</p>
              <p className="text-sm mt-2">Accessing digital law libraries and archives...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="max-w-4xl mx-auto space-y-8">
              {results.map((res, idx) => (
                <div key={idx} className="group p-8 rounded-[2rem] border border-slate-100 hover:border-amber-200 hover:bg-amber-50/10 transition-all shadow-sm hover:shadow-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest">{res.court}</span>
                        <span className="text-slate-400 text-xs font-bold">{res.year}</span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 font-serif leading-tight">
                        {highlight(res.title)}
                      </h3>
                      {res.citation && (
                        <p className="text-xs font-bold text-amber-600 mt-1 uppercase tracking-tighter">
                          {highlight(res.citation)}
                        </p>
                      )}
                    </div>
                    <a 
                      href={res.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center shrink-0"
                    >
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  </div>
                  
                  <div className="relative pl-6 border-l-2 border-slate-100">
                    <p className="text-sm text-slate-600 leading-relaxed italic">
                      {highlight(res.summary)}
                    </p>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 transition-colors">
                        Copy Citation
                      </button>
                    </div>
                    <a 
                      href={res.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-slate-900 flex items-center group-hover:underline"
                    >
                      Read Full Analysis <i className="fas fa-arrow-right ml-2 text-[10px]"></i>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-slate-300 text-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-8">
                <i className="fas fa-book-open-reader text-4xl opacity-20"></i>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 font-serif mb-3">Case Law Search Engine</h3>
              <p className="max-w-md text-sm text-slate-500 leading-relaxed">
                Find relevant Supreme Court and High Court judgments by searching for keywords, statutes, or specific case names.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseLawSearch;
