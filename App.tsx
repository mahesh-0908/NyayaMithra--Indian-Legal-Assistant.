
import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, ChatSession, Attachment, Language } from './types';
import { PRESET_TOPICS, UI_TRANSLATIONS } from './constants';
import { generateLegalResponse } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import LegalDictionary from './components/LegalDictionary';
import LawsLibrary from './components/LawsLibrary';
import CaseLawSearch from './components/CaseLawSearch';

const STORAGE_KEY = 'nyayamithra_professional_v3';
const DISCLAIMER_KEY = 'nyayamithra_disclaimer_accepted';
const LANG_KEY = 'nyayamithra_selected_lang';

const App: React.FC = () => {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isLawsOpen, setIsLawsOpen] = useState(false);
  const [isCaseSearchOpen, setIsCaseSearchOpen] = useState(false);
  const [dictionarySearch, setDictionarySearch] = useState('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const t = UI_TRANSLATIONS[language];

  useEffect(() => {
    const accepted = localStorage.getItem(DISCLAIMER_KEY);
    if (!accepted) setShowDisclaimer(true);

    const savedLang = localStorage.getItem(LANG_KEY) as Language;
    if (savedLang && UI_TRANSLATIONS[savedLang]) setLanguage(savedLang);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.onresult = (e: any) => setInput(prev => prev + ' ' + e.results[0][0].transcript);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const revived = parsed.map((c: any) => ({
          ...c, updatedAt: new Date(c.updatedAt),
          messages: c.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
        setChats(revived);
        if (revived.length > 0) setCurrentChatId(revived[0].id);
        else createNewChat();
      } catch (e) { createNewChat(); }
    } else createNewChat();
  }, []);

  useEffect(() => {
    if (chats.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, language);
  }, [language]);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [chats, currentChatId, isLoading]);

  const createNewChat = (customTitle?: string) => {
    const newId = Date.now().toString();
    const isCaseLaw = customTitle?.includes("Case Law") || false;
    const newChat: ChatSession = {
      id: newId,
      title: customTitle || t.newCase,
      messages: [{
        id: 'w-' + newId,
        role: Role.BOT,
        text: isCaseLaw ? t.welcomeCaseLaw : t.welcome,
        timestamp: new Date(),
        suggestions: isCaseLaw ? t.suggestionsCaseLaw : t.suggestions
      }],
      updatedAt: new Date()
    };
    setChats(prev => [newChat, ...prev]);
    setCurrentChatId(newId);
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input.trim();
    if (!textToSend && pendingAttachments.length === 0 || isLoading) return;

    const currentChat = chats.find(c => c.id === currentChatId);
    if (!currentChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: textToSend || "Analyzing attached evidence...",
      timestamp: new Date(),
      attachments: pendingAttachments.length > 0 ? [...pendingAttachments] : undefined
    };

    const isFirst = !currentChat.messages.some(m => m.role === Role.USER);
    const newTitle = isFirst ? (textToSend.substring(0, 25) || "Case Review") : currentChat.title;
    const newMessages = [...currentChat.messages.map(m => ({ ...m, suggestions: undefined })), userMessage];

    setChats(prev => prev.map(c => 
      c.id === currentChatId ? { ...c, messages: newMessages, title: newTitle, updatedAt: new Date() } : c
    ));
    
    const atts = [...pendingAttachments];
    setPendingAttachments([]);
    setInput('');
    setIsLoading(true);

    try {
      const history = newMessages.slice(-6).map(m => ({
        role: m.role === Role.USER ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      const { text, suggestions, sources } = await generateLegalResponse(textToSend, history, language, atts);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(), 
        role: Role.BOT, 
        text, 
        timestamp: new Date(), 
        suggestions,
        sources,
        query: textToSend 
      };
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...newMessages, botMessage], updatedAt: new Date() } : c));
    } catch (e: any) {
      const err: Message = { id: Date.now().toString(), role: Role.BOT, text: e.message, timestamp: new Date(), isError: true };
      setChats(prev => prev.map(c => c.id === currentChatId ? { ...c, messages: [...newMessages, err], updatedAt: new Date() } : c));
    } finally { setIsLoading(false); }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileList = Array.from(files) as File[];
    for (const f of fileList) {
      const r = new FileReader();
      r.onload = () => {
        setPendingAttachments(p => [...p, { data: (r.result as string).split(',')[1], mimeType: f.type, name: f.name }]);
      };
      r.readAsDataURL(f);
    }
  };

  const handleJargonClick = (term: string) => {
    setDictionarySearch(term);
    setIsDictionaryOpen(true);
  };

  const activeChat = chats.find(c => c.id === currentChatId) || chats[0];

  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-900">
      <LegalDictionary 
        isOpen={isDictionaryOpen} 
        onClose={() => setIsDictionaryOpen(false)} 
        language={language}
        initialSearch={dictionarySearch}
      />

      <LawsLibrary
        isOpen={isLawsOpen}
        onClose={() => setIsLawsOpen(false)}
        language={language}
      />

      <CaseLawSearch
        isOpen={isCaseSearchOpen}
        onClose={() => setIsCaseSearchOpen(false)}
        language={language}
      />

      {/* Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-xl shadow-2xl border border-amber-100 animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-6 mx-auto">
              <i className="fas fa-scroll text-xl md:text-2xl"></i>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center mb-4 font-serif">{t.disclaimerTitle}</h2>
            <div className="text-sm text-slate-600 space-y-3 md:space-y-4 mb-8 leading-relaxed">
              <p>{t.disclaimerText}</p>
              <p className="font-bold text-slate-800 text-center">Do you accept these terms of use?</p>
            </div>
            <button 
              onClick={() => { localStorage.setItem(DISCLAIMER_KEY, 'true'); setShowDisclaimer(false); }}
              className="w-full bg-slate-900 text-white py-3 md:py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
            >
              {t.accept}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 md:w-80 glass-sidebar text-white transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} no-print flex flex-col`}>
        <div className="p-4 md:p-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-8 md:mb-10 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="gold-gradient p-2 md:p-2.5 rounded-xl shadow-lg shadow-amber-900/20"><i className="fas fa-balance-scale text-lg md:text-xl text-white"></i></div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight font-serif">NyayaMithra</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <i className="fas fa-xmark"></i>
            </button>
          </div>

          {/* Language Selector */}
          <div className="flex bg-white/5 p-1 rounded-xl mb-6 shrink-0">
            {(['en', 'hi', 'te'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${language === lang ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
              >
                {lang === 'en' ? 'ENG' : lang === 'hi' ? 'हिंदी' : 'తెలుగు'}
              </button>
            ))}
          </div>

          <div className="space-y-2 mb-8 shrink-0">
            <button onClick={() => createNewChat()} className="w-full flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white py-3 md:py-3.5 rounded-2xl transition-all font-semibold text-sm">
              <i className="fas fa-file-signature text-xs md:text-sm text-amber-400"></i><span>{t.newCase}</span>
            </button>
            <button onClick={() => setIsCaseSearchOpen(true)} className="w-full flex items-center justify-center space-x-2 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-600/30 text-amber-50 py-3 md:py-3.5 rounded-2xl transition-all font-semibold text-sm">
              <i className="fas fa-magnifying-glass-location text-xs md:text-sm text-amber-400"></i><span>{t.searchCaseLaw}</span>
            </button>
            
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button 
                onClick={() => { setDictionarySearch(''); setIsDictionaryOpen(true); setIsSidebarOpen(false); }} 
                className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 py-2.5 rounded-2xl transition-all font-semibold text-[11px]"
              >
                <i className="fas fa-book-bookmark text-amber-400"></i><span>{t.dictionary}</span>
              </button>
              <button 
                onClick={() => { setIsLawsOpen(true); setIsSidebarOpen(false); }} 
                className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 py-2.5 rounded-2xl transition-all font-semibold text-[11px]"
              >
                <i className="fas fa-gavel text-amber-400"></i><span>{t.laws}</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-8 pr-1 mt-4">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{t.activeFiles}</p>
              <div className="space-y-1.5 md:space-y-2">
                {chats.map(c => (
                  <div key={c.id} onClick={() => { setCurrentChatId(c.id); setIsSidebarOpen(false); }} className={`group flex items-center justify-between p-3 md:p-3.5 rounded-2xl cursor-pointer transition-all ${currentChatId === c.id ? 'bg-amber-600/10 border border-amber-600/30 text-amber-50' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
                    <div className="flex items-center space-x-3 truncate">
                      <i className={`fas ${c.title.includes(t.searchCaseLaw) ? 'fa-magnifying-glass' : 'fa-folder-open'} text-[10px] md:text-xs ${currentChatId === c.id ? 'text-amber-400' : 'text-slate-600'}`}></i>
                      <span className="text-xs md:text-sm font-medium truncate">{c.title}</span>
                    </div>
                    {chats.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); setChats(prev => prev.filter(x => x.id !== c.id)); }} className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"><i className="fas fa-times text-[10px] md:text-xs"></i></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{t.frameworks}</p>
              {PRESET_TOPICS.map(t_topic => (
                <button key={t_topic.id} onClick={() => { handleSend(`Provide a detailed analysis on ${t_topic.title}`); setIsSidebarOpen(false); }} className="w-full flex items-center space-x-3 md:space-x-4 p-2.5 md:p-3 rounded-2xl hover:bg-white/5 group transition-colors text-left">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-amber-600 transition-colors shrink-0"><i className={`fas ${t_topic.icon} text-[10px] md:text-xs text-slate-400 group-hover:text-white`}></i></div>
                  <span className="text-[11px] md:text-xs font-medium text-slate-400 group-hover:text-slate-200">{t_topic.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative min-w-0">
        <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-10 no-print">
          <div className="flex items-center space-x-3 md:space-x-6 min-w-0">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"><i className="fas fa-bars"></i></button>
            <div className="min-w-0">
              <h2 className="text-base md:text-xl font-bold text-slate-900 font-serif truncate">{activeChat?.title}</h2>
              <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 truncate">
                Updated: {activeChat?.updatedAt.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
             <button onClick={() => window.print()} className="flex items-center space-x-2 px-3 md:px-4 py-1.5 md:py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all font-semibold text-[10px] md:text-xs">
                <i className="fas fa-file-export"></i><span className="hidden sm:inline">{t.export}</span>
             </button>
             <div className="h-6 md:h-8 w-[1px] bg-slate-100 mx-1 md:mx-2 hidden sm:block"></div>
             <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Research ID</span>
               <span className="text-[10px] text-slate-400 font-medium tracking-tighter">NY-{activeChat?.id.slice(-6)}</span>
             </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-slate-50/50 chat-container">
          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
            {activeChat?.messages.map(m => (
              <ChatBubble key={m.id} message={m} onSuggestionClick={handleSend} onJargonClick={handleJargonClick} />
            ))}
            {isLoading && (
              <div className="flex justify-start no-print">
                <div className="flex flex-row items-start space-x-3 md:space-x-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl gold-gradient text-white flex items-center justify-center animate-pulse"><i className="fas fa-balance-scale text-xs md:text-base"></i></div>
                  <div className="bg-white border border-slate-200 p-4 md:p-5 rounded-2xl md:rounded-3xl rounded-tl-none shadow-sm min-w-[200px] md:min-w-[300px]">
                    <div className="flex items-center space-x-2 md:space-x-3 mb-2 md:mb-3">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <p className="text-xs md:text-sm font-medium text-slate-400 italic">{t.loading}</p>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4 md:h-10" />
          </div>
        </div>

        {/* Professional Input Section */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100 no-print shadow-2xl relative z-20">
          <div className="max-w-4xl mx-auto">
            {pendingAttachments.length > 0 && (
              <div className="flex flex-row gap-3 mb-4 bg-slate-50 p-3 rounded-2xl border border-dashed border-slate-200 overflow-x-auto no-scrollbar">
                {pendingAttachments.map((att, i) => (
                  <div key={i} className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 border-white shadow-md shrink-0">
                    <img src={`data:${att.mimeType};base64,${att.data}`} alt="doc" className="w-full h-full object-cover" />
                    <div className="scan-line"></div>
                    <button onClick={() => setPendingAttachments(p => p.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 bg-slate-900/80 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center hover:bg-red-500 transition-colors"><i className="fas fa-times"></i></button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2 md:gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl md:rounded-2xl transition-all border border-slate-100 shrink-0"
                title="Review Legal Document"
              >
                <i className="fas fa-file-circle-plus text-lg md:text-xl"></i>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFile} accept="image/*" multiple className="hidden" />
              
              <div className="relative flex-1 min-w-0">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={activeChat?.title.includes(t.searchCaseLaw) ? t.placeholderCaseLaw : t.placeholder}
                  className="w-full pl-4 md:pl-6 pr-10 md:pr-14 py-3 md:py-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-900 font-medium text-sm md:text-base"
                />
                <button 
                  onClick={() => { setIsListening(!isListening); if (!isListening) recognitionRef.current?.start(); else recognitionRef.current?.stop(); }}
                  className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg md:rounded-xl transition-all ${isListening ? 'bg-amber-600 text-white animate-pulse shadow-lg shadow-amber-200' : 'text-slate-400 hover:text-amber-600'}`}
                >
                  <i className={`fas ${isListening ? 'fa-microphone text-xs' : 'fa-microphone-slash text-xs'} md:text-base`}></i>
                </button>
              </div>

              <button
                onClick={() => handleSend()}
                disabled={(!input.trim() && pendingAttachments.length === 0) || isLoading}
                className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl transition-all shrink-0 ${
                  (input.trim() || pendingAttachments.length > 0) && !isLoading 
                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95' 
                    : 'bg-slate-100 text-slate-300'
                }`}
              >
                <i className="fas fa-arrow-up text-base md:text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </main>

      {isSidebarOpen && <div className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
