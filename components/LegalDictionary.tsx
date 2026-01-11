
import React, { useState, useMemo } from 'react';
import { LEGAL_DICTIONARY, DictionaryEntry } from '../constants';
import { Language } from '../types';

interface LegalDictionaryProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  initialSearch?: string;
}

const LegalDictionary: React.FC<LegalDictionaryProps> = ({ isOpen, onClose, language, initialSearch = '' }) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');

  const filteredEntries = useMemo(() => {
    return LEGAL_DICTIONARY.filter(entry => {
      const matchesSearch = entry.term.toLowerCase().includes(search.toLowerCase()) || 
                           entry.definition.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || entry.category === selectedCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.term.localeCompare(b.term));
  }, [search, selectedCategory]);

  const categories = ['All', 'Criminal', 'Civil', 'Constitutional', 'Procedural', 'General'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gold-gradient text-white">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <i className="fas fa-book-bookmark"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Legal Dictionary</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80">Reference Tool for Indian Law</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
          <div className="relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text" 
              placeholder="Search legal terms or definitions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-amber-600 border-amber-600 text-white shadow-md' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-amber-200 hover:text-amber-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
          {filteredEntries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredEntries.map((entry, idx) => (
                <div key={idx} className="group p-5 rounded-2xl border border-slate-100 hover:border-amber-100 hover:bg-amber-50/30 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-slate-900 font-serif group-hover:text-amber-700">{entry.term}</h3>
                    <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-500 rounded-md">
                      {entry.category}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{entry.definition}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <i className="fas fa-magnifying-glass text-4xl mb-4 opacity-20"></i>
              <p className="font-medium">No legal terms matched your search.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredEntries.length} of {LEGAL_DICTIONARY.length} terms in NyayaMithra Library
          </p>
        </div>
      </div>
    </div>
  );
};

export default LegalDictionary;
