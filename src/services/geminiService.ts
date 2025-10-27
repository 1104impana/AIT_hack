import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { CrawledData, SEOReport } from '../types';

const seoAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, description: "A single integer score from 0 to 100 for the overall SEO performance." },
    overallSummary: { type: Type.STRING, description: "A brief, one-sentence summary of the overall SEO health." },
    categoryScores: {
      type: Type.OBJECT,
      properties: {
        Content: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING }
          }
        },
        Technical: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING }
          }
        },
        Keywords: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING }
          }
        },
        "Meta Tags": {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            summary: { type: Type.STRING }
          }
        },
      }
    },
    recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    }
  },
  required: ['overallScore', 'overallSummary', 'categoryScores', 'recommendations']
};


export const analyzeSeo = async (crawledData: CrawledData, apiKey: string): Promise<SEOReport> => {
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-pro";
  const prompt = `Analyze the following SEO data from a web crawl and provide a detailed report.
  
  Crawled Data:
  ${JSON.stringify(crawledData, null, 2)}
  
  Based on this data, evaluate the page's SEO performance across four key categories: Content, Technical, Keywords, and Meta Tags. Provide a score from 0-100 for each category and an overall score. Also, generate 3-5 actionable recommendations with priority levels.
  
  Return the analysis ONLY in the provided JSON schema format.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: seoAnalysisSchema,
        temperature: 0.2,
      },
    });
    
    const jsonString = response.text?.trim();
    if (!jsonString) {
        throw new Error("Received an empty response from the AI.");
    }
    return JSON.parse(jsonString) as SEOReport;
  } catch (error) {
    console.error("Error during Gemini API call for SEO analysis:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("Invalid API Key. Please check your key and try again.");
    }
    throw new Error("Failed to get SEO analysis from AI.");
  }
};

export const createSeoChat = (apiKey: string, context: SEOReport | null): Chat => {
  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const contextPrompt = context ? `
    Here is the current SEO report for context:
    ${JSON.stringify(context, null, 2)}
  ` : `
    There is no SEO report available yet.
  `;

  const systemInstruction = `You are a helpful and concise AI SEO assistant. 
  Your goal is to answer user questions about their SEO report. 
  Use the provided SEO report context to give specific answers. 
  If there is no report context, politely ask the user to analyze a URL first.
  Keep your answers brief and to the point.${contextPrompt}`;

  const chat = ai.chats.create({
    model: model,
    config: { systemInstruction },
  });

  return chat;
};
