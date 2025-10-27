
export enum SeoCategory {
  CONTENT = 'Content',
  TECHNICAL = 'Technical',
  KEYWORDS = 'Keywords',
  META_TAGS = 'Meta Tags',
}

export interface CrawledData {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  h1s: string[];
  contentSample: string;
  imageCount: number;
  altTextMissing: number;
  internalLinks: number;
  externalLinks: number;
}

export interface Recommendation {
  priority: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
}

export interface CategoryScore {
  score: number;
  summary: string;
}

export interface SEOReport {
  overallScore: number;
  overallSummary: string;
  categoryScores: Record<SeoCategory, CategoryScore>;
  recommendations: Recommendation[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}
