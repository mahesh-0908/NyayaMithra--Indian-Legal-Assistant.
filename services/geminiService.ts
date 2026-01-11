
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Attachment, GroundingSource, Language, CaseLawResult } from "../types";

// Always initialize GoogleGenAI with process.env.API_KEY directly as a named parameter.
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateLegalResponse = async (
  prompt: string, 
  history: { role: string; parts: any[] }[], 
  language: Language = 'en',
  attachments: Attachment[] = []
) => {
  const ai = getAIClient();
  
  const languageNames: Record<Language, string> = {
    en: "English",
    hi: "Hindi",
    te: "Telugu"
  };

  const dynamicSystemInstruction = SYSTEM_INSTRUCTION.replace('[LANGUAGE_HINT]', languageNames[language]);

  try {
    const userParts: any[] = [{ text: prompt }];
    
    // Add attachments if present
    attachments.forEach(att => {
      userParts.push({
        inlineData: {
          data: att.data,
          mimeType: att.mimeType
        }
      });
    });

    // Use gemini-3-pro-preview for complex legal reasoning tasks.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        ...history,
        { role: 'user', parts: userParts }
      ],
      config: {
        systemInstruction: dynamicSystemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.6,
      },
    });

    if (response.candidates?.[0]?.finishReason === 'SAFETY') {
      throw new Error("SAFETY_BLOCK");
    }

    const rawText = response.text || "I'm sorry, I couldn't process that legal query.";
    
    // Extract Grounding Sources (Citations)
    const sources: GroundingSource[] = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          // Avoid duplicates
          if (!sources.find(s => s.uri === chunk.web.uri)) {
            sources.push({
              title: chunk.web.title,
              uri: chunk.web.uri
            });
          }
        }
      });
    }
    
    // Parse suggestions (lines starting with >>)
    const lines = rawText.split('\n');
    const suggestions: string[] = [];
    const mainTextLines: string[] = [];

    lines.forEach(line => {
      if (line.trim().startsWith('>>')) {
        const question = line.replace('>>', '').trim();
        if (question) suggestions.push(question);
      } else {
        mainTextLines.push(line);
      }
    });

    const text = mainTextLines.join('\n').trim();

    return { text, suggestions: suggestions.slice(0, 3), sources };
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    if (error.message === "SAFETY_BLOCK") {
      throw new Error("This query involves sensitive content that triggers safety protocols. For high-stakes criminal or personal safety matters, please contact local law enforcement or a licensed advocate.");
    }
    
    if (!navigator.onLine) {
      throw new Error("You appear to be offline. Please check your internet connection.");
    }

    throw new Error(error.message || "I encountered an unexpected issue while researching this matter.");
  }
};

export const searchCaseLaws = async (query: string, language: Language = 'en'): Promise<CaseLawResult[]> => {
  const ai = getAIClient();
  
  const prompt = `Research and find 3-5 relevant Indian case law judgments for the following query: "${query}". 
  Provide the output strictly as a JSON array of objects with the following keys:
  "title": Name of the case (e.g., Kesavananda Bharati v. State of Kerala)
  "citation": Formal legal citation if available
  "court": The name of the court (Supreme Court of India, etc.)
  "year": Year of judgment
  "summary": A concise 2-3 sentence legal summary of the ratio decidendi
  "link": A verified URL to the full judgment (e.g. from Indian Kanoon or Supreme Court website)
  
  Language: ${language === 'en' ? 'English' : language === 'hi' ? 'Hindi' : 'Telugu'}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              citation: { type: Type.STRING },
              court: { type: Type.STRING },
              year: { type: Type.STRING },
              summary: { type: Type.STRING },
              link: { type: Type.STRING },
            },
            required: ['title', 'summary', 'link'],
          },
        },
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Case Law Search Error:", error);
    return [];
  }
};
