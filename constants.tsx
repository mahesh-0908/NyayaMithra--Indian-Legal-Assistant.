
import { LegalTopic, Language, Law } from './types';

export interface DictionaryEntry {
  term: string;
  definition: string;
  category: 'Criminal' | 'Civil' | 'Constitutional' | 'Procedural' | 'General';
}

export const LEGAL_DICTIONARY: DictionaryEntry[] = [
  { term: 'Ad-interim', definition: 'In the meantime; a temporary order or injunction granted until the main matter is heard.', category: 'Procedural' },
  { term: 'Amicus Curiae', definition: 'Friend of the court; a person who is not a party to a case but offers information to assist the court.', category: 'Procedural' },
  { term: 'Bail', definition: 'The temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is lodged to guarantee their appearance in court.', category: 'Criminal' },
  { term: 'BNS (Bharatiya Nyaya Sanhita)', definition: 'The primary criminal code of India, replacing the Indian Penal Code (IPC) since July 1, 2024.', category: 'Criminal' },
  { term: 'BNSS (Bharatiya Nagarik Suraksha Sanhita)', definition: 'The procedural law for administration of criminal law in India, replacing the CrPC.', category: 'Criminal' },
  { term: 'BSA (Bharatiya Sakshya Adhiniyam)', definition: 'The law governing evidence in Indian courts, replacing the Indian Evidence Act.', category: 'Procedural' },
  { term: 'Caveat Emptor', definition: 'Let the buyer beware; the principle that the buyer alone is responsible for checking the quality and suitability of goods before a purchase is made.', category: 'Civil' },
  { term: 'Cognizable Offence', definition: 'An offence for which a police officer may arrest without a warrant and start an investigation without court permission.', category: 'Criminal' },
  { term: 'De jure', definition: 'According to rightful entitlement or claim; by right.', category: 'General' },
  { term: 'De facto', definition: 'In fact, whether by right or not; existing in reality.', category: 'General' },
  { term: 'Estoppel', definition: 'A legal principle that prevents a person from asserting something contrary to what is implied by a previous action or statement.', category: 'Civil' },
  { term: 'FIR (First Information Report)', definition: 'A document prepared by police when they receive information about the commission of a cognizable offence.', category: 'Procedural' },
  { term: 'Habeas Corpus', definition: 'A writ requiring a person under arrest to be brought before a judge or into court, especially to secure their release.', category: 'Constitutional' },
  { term: 'Injunction', definition: 'A judicial order restraining a person from beginning or continuing an action invading the legal right of another.', category: 'Civil' },
  { term: 'Locus Standi', definition: 'The right or capacity to bring an action or to appear in a court.', category: 'Procedural' },
  { term: 'Mandamus', definition: 'A judicial writ issued as a command to an inferior court or ordering a person to perform a public or statutory duty.', category: 'Constitutional' },
  { term: 'Mens Rea', definition: 'The intention or knowledge of wrongdoing that constitutes part of a crime.', category: 'Criminal' },
  { term: 'PIL (Public Interest Litigation)', definition: 'Litigation filed in a court of law for the protection of "Public Interest", such as pollution, terrorism, road safety, etc.', category: 'Constitutional' },
  { term: 'Quo Warranto', definition: 'A writ or legal action requiring a person to show by what warrant an office or franchise is held.', category: 'Constitutional' },
  { term: 'Res Judicata', definition: 'A matter that has been adjudicated by a competent court and may not be pursued further by the same parties.', category: 'Procedural' },
  { term: 'Suo Motu', definition: 'On its own motion; used when a court takes up a case on its own without any party filing a petition.', category: 'Procedural' },
  { term: 'Tort', definition: 'A civil wrong that causes a claimant to suffer loss or harm, resulting in legal liability for the person who commits the act.', category: 'Civil' },
  { term: 'Ultra Vires', definition: 'Beyond one\'s legal power or authority.', category: 'Constitutional' },
  { term: 'Writ', definition: 'A formal written order issued by a court with administrative or judicial jurisdiction.', category: 'Constitutional' }
];

export const INDIAN_LAWS: Law[] = [
  {
    id: 'bns-2023',
    title: 'BNS 2023',
    fullTitle: 'Bharatiya Nyaya Sanhita, 2023',
    year: '2023',
    category: 'Criminal',
    summary: 'The primary criminal code in India, replacing the Indian Penal Code (IPC). It simplifies the law and introduces new offences like organized crime and terrorism.',
    keySections: [
      { number: '103', title: 'Punishment for Murder', desc: 'Prescribes death or imprisonment for life for the act of murder.' },
      { number: '113', title: 'Terrorist Act', desc: 'Defines terrorism and prescribes punishments for acts threatening unity and security.' },
      { number: '187', title: 'Unlawful Assembly', desc: 'Punishment for being a member of an assembly of five or more persons with common unlawful intent.' }
    ]
  },
  {
    id: 'bnss-2023',
    title: 'BNSS 2023',
    fullTitle: 'Bharatiya Nagarik Suraksha Sanhita, 2023',
    year: '2023',
    category: 'Procedural',
    summary: 'Replaces the Code of Criminal Procedure (CrPC). It modernizes criminal procedures, incorporating electronic evidence and time-bound investigations.',
    keySections: [
      { number: '173', title: 'Information in Cognizable Cases', desc: 'Governs the registration of FIRs and preliminary inquiries.' },
      { number: '187', title: 'Custody of Accused', desc: 'Provisions regarding police custody and judicial custody periods.' },
      { number: '480', title: 'Bail in Non-Bailable Offence', desc: 'Governs the discretion of courts to grant bail for serious offences.' }
    ]
  },
  {
    id: 'coi-1950',
    title: 'Constitution',
    fullTitle: 'Constitution of India, 1950',
    year: '1950',
    category: 'Constitutional',
    summary: 'The supreme law of India. It lays down the framework defining fundamental political principles, procedures, powers, and duties of government institutions.',
    keySections: [
      { number: '14', title: 'Equality Before Law', desc: 'The State shall not deny to any person equality before the law within the territory of India.' },
      { number: '21', title: 'Protection of Life & Liberty', desc: 'No person shall be deprived of his life or personal liberty except according to procedure established by law.' },
      { number: '32', title: 'Constitutional Remedies', desc: 'Right to move the Supreme Court for enforcement of Fundamental Rights via Writs.' }
    ]
  },
  {
    id: 'hma-1955',
    title: 'HMA 1955',
    fullTitle: 'Hindu Marriage Act, 1955',
    year: '1955',
    category: 'Civil',
    summary: 'An Act to amend and codify the law relating to marriage among Hindus, including Buddhists, Jains, and Sikhs.',
    keySections: [
      { number: '5', title: 'Conditions for Marriage', desc: 'Lists requirements like age, monogamy, and sound mind for a valid marriage.' },
      { number: '13', title: 'Divorce', desc: 'Specifies grounds for divorce such as adultery, cruelty, and desertion.' },
      { number: '24', title: 'Maintenance Pendente Lite', desc: 'Provisions for interim maintenance during legal proceedings.' }
    ]
  },
  {
    id: 'contract-1872',
    title: 'Contract Act',
    fullTitle: 'Indian Contract Act, 1872',
    year: '1872',
    category: 'Civil',
    summary: 'Determines the circumstances in which promises made by the parties to a contract shall be legally binding.',
    keySections: [
      { number: '2(h)', title: 'Definition of Contract', desc: 'An agreement enforceable by law is a contract.' },
      { number: '10', title: 'Essential Elements', desc: 'What agreements are contracts: free consent, competent parties, lawful object.' },
      { number: '73', title: 'Damages for Breach', desc: 'Compensation for loss or damage caused by breach of contract.' }
    ]
  }
];

export const SYSTEM_INSTRUCTION = `
You are NyayaMithra, a high-level Professional Legal AI Assistant. Your objective is to provide structured, authoritative, and cited information regarding the Indian Legal System.

LANGUAGE PROTOCOL:
- You must respond in the language specified in the user's configuration ([LANGUAGE_HINT]).
- Maintain a highly professional, formal legal tone in that specific language.
- Ensure legal terminology is accurate in the target language but keep specific Section numbers (e.g., Section 302) in standard numerals.

Protocol for Interaction:
1. FORMAL STRUCTURE: Always use Markdown. Start with a "Summary of Matter" bolded, followed by "Legal Provisions" (sections of law), "Analysis", and "Procedural Guidance".
2. STATUTORY REFERENCES: Use exact section numbers for BNS (Bharatiya Nyaya Sanhita), IPC, CrPC, Hindu Marriage Act, Special Marriage Act, Muslim Personal Law, etc.
3. JARGON ENCAPSULATION: Wrap technical terms in [[Term|Definition]] for the built-in dictionary. Definitions should also be in the target language.
4. CITATIONS: If using Google Search results, explicitly mention the source name at the end of the relevant paragraph.
5. DOCUMENT ANALYSIS: When analyzing images, act as a paralegal reviewing evidence. Identify: Document Type, Parties Involved, Key Obligations/Violations, and Suggested Response.
6. MANDATORY DISCLOSURE: End every report with the language-specific disclaimer provided or an equivalent professional warning.
7. FOLLOW-UPS: Provide exactly 3 high-value follow-up questions starting with '>>'.

Example format:
# Legal Consultation Report: [Subject]
**Matter Summary:** [Brief summary]
## Statutory Provisions
- [Provisions]
...
## Recommendations
1. [Step 1]
2. [Step 2]

>> [Follow-up 1]
>> [Follow-up 2]
>> [Follow-up 3]
`;

export const UI_TRANSLATIONS: Record<Language, any> = {
  en: {
    welcome: "# Welcome to NyayaMithra Professional\nHow may I assist with your legal inquiry today? You may upload documents for review or state your query directly.",
    welcomeCaseLaw: "# Case Law Research Engine\nEnter case names, statutory keywords, or keywords like 'Right to Privacy judgments' to retrieve relevant Indian case laws and precedents.",
    newCase: "New Case File",
    searchCaseLaw: "Case Law Search",
    activeFiles: "Active Files",
    frameworks: "Legal Frameworks",
    placeholder: "Query statutes or research case laws...",
    placeholderCaseLaw: "Search judgments, parties, or citations...",
    export: "Export Report",
    disclaimerTitle: "Professional Disclaimer",
    disclaimerText: "Welcome to NyayaMithra. By continuing, you acknowledge that this is an AI-powered informational assistant specializing in Indian law. This service does not provide binding legal advice, nor does it establish a solicitor-client relationship.",
    accept: "I Accept & Continue",
    loading: "Synthesizing statutory interpretations...",
    suggestions: ["Explain new BNS laws", "Legal notice response", "Divorce grounds"],
    suggestionsCaseLaw: ["Kesavananda Bharati summary", "Section 498A judgments", "Landmark privacy cases"],
    dictionary: "Legal Dictionary",
    searchDictionary: "Search legal terms...",
    laws: "Laws & Sections",
    searchLaws: "Search Acts or Sections...",
    precedents: "Judgments & Precedents",
    searchingCases: "Researching Indian legal archives..."
  },
  hi: {
    welcome: "# न्यायमित्र प्रोफेशनल में स्वागत है\nमैं आज आपकी कानूनी पूछताछ में कैसे सहायता कर सकता हूँ?",
    welcomeCaseLaw: "# केस लॉ रिसर्च इंजन\nप्रासंगिक भारतीय केस कानूनों को खोजने के लिए कीवर्ड दर्ज करें।",
    newCase: "नई केस फ़ाइल",
    searchCaseLaw: "केस लॉ खोज",
    activeFiles: "सक्रिय फ़ाइलें",
    frameworks: "कानूनी ढांचा",
    placeholder: "कानूनों पर शोध करें...",
    placeholderCaseLaw: "निर्णयों को खोजें...",
    export: "रिपोर्ट निर्यात करें",
    disclaimerTitle: "पेशेवर अस्वीकरण",
    disclaimerText: "न्यायमित्र में आपका स्वागत है। यह एक एआई-संचालित सूचनात्मक सहायक है।",
    accept: "स्वीकार करें",
    loading: "व्याख्याओं का विश्लेषण...",
    suggestions: ["बीएनएस कानून", "कानूनी नोटिस", "तलाक"],
    suggestionsCaseLaw: ["केस सारांश", "धारा 498A", "निजता"],
    dictionary: "कानूनी शब्दकोश",
    searchDictionary: "कानूनी शब्द खोजें...",
    laws: "कानून और धाराएं",
    searchLaws: "अधिनियम या धाराएं खोजें...",
    precedents: "निर्णय और मिसालें",
    searchingCases: "भारतीय कानूनी अभिलेखागार की खोज..."
  },
  te: {
    welcome: "# న్యాయమిత్రకు స్వాగతం\nనేడు నేను మీకు ఎలా సహాయపడగలను?",
    welcomeCaseLaw: "# కేస్ లా రీసెర్చ్ ఇంజిన్\nభారతీయ కేస్ చట్టాలను శోధించండి.",
    newCase: "కొత్త కేస్ ఫైల్",
    searchCaseLaw: "కేస్ లా శోధన",
    activeFiles: "యాక్టివ్ ఫైల్‌లు",
    frameworks: "చట్టపరమైన ఫ్రేమ్‌వర్క్‌లు",
    placeholder: "చట్టాల గురించి అడగండి...",
    placeholderCaseLaw: "తీర్పులను శోధించండి...",
    export: "డౌన్‌లోడ్ చేయండి",
    disclaimerTitle: "నిరాకరణ",
    disclaimerText: "న్యాయమిత్రకు స్వాగతం. ఇది AI-ఆధారిత సహాయకుడు.",
    accept: "అంగీకరిస్తున్నాను",
    loading: "విశ్లేషిస్తోంది...",
    suggestions: ["BNS చట్టాలు", "లీగల్ నోటీసు", "విడాకులు"],
    suggestionsCaseLaw: ["కేస్ సారాంశం", "సెక్షన్ 498A", "గోప్యత"],
    dictionary: "న్యాయ నిఘంటువు",
    searchDictionary: "న్యాయ పదాల కోసం వెతకండి...",
    laws: "చట్టాలు & సెక్షన్లు",
    searchLaws: "చట్టాలు లేదా సెక్షన్ల కోసం వెతకండి...",
    precedents: "తీర్పులు & పూర్వదర్శనాలు",
    searchingCases: "భారతీయ చట్టపరమైన ఆర్కైవ్‌లను పరిశోధిస్తోంది..."
  }
};

export const PRESET_TOPICS: LegalTopic[] = [
  {
    id: 'family',
    title: 'Family & Personal Law',
    description: 'Divorce, maintenance, child custody, and inheritance.',
    icon: 'fa-users-rays'
  },
  {
    id: 'bns',
    title: 'New Criminal Laws (BNS)',
    description: 'BNS, BNSS, and BSA guidance.',
    icon: 'fa-gavel'
  },
  {
    id: 'civil',
    title: 'Civil & Commercial',
    description: 'Contracts, torts, and corporate law.',
    icon: 'fa-briefcase'
  },
  {
    id: 'constitutional',
    title: 'Constitutional Rights',
    description: 'Fundamental rights and writ petitions.',
    icon: 'fa-landmark'
  },
  {
    id: 'labor',
    title: 'Employment & Labor',
    description: 'Workplace rights and disputes.',
    icon: 'fa-user-tie'
  }
];
