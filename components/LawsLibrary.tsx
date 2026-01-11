
import React, { useState, useMemo } from 'react';
import { INDIAN_LAWS } from '../constants';
import { Language, Law } from '../types';

interface LawsLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const LawsLibrary: React.FC<LawsLibraryProps> = ({ isOpen, onClose, language }) => {
  const [search, setSearch] = useState('');
  const [selectedLaw, setSelectedLaw] = useState<Law | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | 'All'>('All');

  const filteredLaws = useMemo(() => {
    return INDIAN_LAWS.filter(law => {
      const matchesSearch = law.title.toLowerCase().includes(search.toLowerCase()) || 
                           law.fullTitle.toLowerCase().includes(search.toLowerCase()) ||
                           law.summary.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || law.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const categories = ['All', 'Criminal', 'Procedural', 'Constitutional', 'Civil'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-900/40">
              <i className="fas fa-gavel"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif">Laws & Sections Library</h2>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Indian Statutory Framework Database</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 hover:bg-white/10 rounded-full transition-colors flex items-center justify-center">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Law List */}
          <div className="w-full md:w-80 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-200 space-y-3">
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input 
                  type="text" 
                  placeholder="Search Acts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-xs font-medium"
                />
              </div>
              <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border ${
                      selectedCategory === cat 
                        ? 'bg-slate-900 border-slate-900 text-white' 
                        : 'bg-white border-slate-200 text-slate-500 hover:border-amber-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <div className="space-y-1">
                {filteredLaws.map(law => (
                  <button
                    key={law.id}
                    onClick={() => setSelectedLaw(law)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border ${
                      selectedLaw?.id === law.id 
                        ? 'bg-white border-amber-200 shadow-md ring-1 ring-amber-100' 
                        : 'bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600">{law.category}</span>
                      <span className="text-[9px] font-bold text-slate-400">{law.year}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{law.title}</h4>
                    <p className="text-[10px] text-slate-500 truncate mt-1">{law.fullTitle}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Area - Law Details */}
          <div className="hidden md:flex flex-1 bg-white flex-col overflow-hidden">
            {selectedLaw ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                        {selectedLaw.category} Act
                      </span>
                      <span className="text-slate-400 text-sm font-medium">Enacted in {selectedLaw.year}</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif mb-4">{selectedLaw.fullTitle}</h1>
                    <p className="text-slate-600 leading-relaxed text-base italic border-l-4 border-slate-100 pl-4 py-1">
                      {selectedLaw.summary}
                    </p>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center">
                    <span className="w-8 h-[1px] bg-amber-500 mr-3"></span> Major Key Sections
                  </h3>

                  <div className="space-y-4">
                    {selectedLaw.keySections.map((section, idx) => (
                      <div key={idx} className="group p-6 rounded-2xl border border-slate-100 hover:border-amber-100 hover:bg-slate-50 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="bg-slate-900 text-white px-3 py-1 rounded-lg text-xs font-bold">Section {section.number}</span>
                            <h4 className="text-lg font-bold text-slate-900">{section.title}</h4>
                          </div>
                          <button className="text-[10px] font-bold text-amber-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                            Research Cases <i className="fas fa-chevron-right ml-1"></i>
                          </button>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {section.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2">Detailed Analysis Available</p>
                    <p className="text-xs text-amber-600 mb-4">Would you like to ask NyayaMithra to explain these sections in detail or check related precedents?</p>
                    <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg">
                      Start Consultation on {selectedLaw.title}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-6">
                  <i className="fas fa-gavel text-3xl opacity-20"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-400 font-serif mb-2">Select an Act to View Details</h3>
                <p className="max-w-xs text-sm">Browse the statutory framework of India. Select any law from the left panel to see its core provisions and sections.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawsLibrary;
