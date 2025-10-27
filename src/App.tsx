
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { Chatbot } from './components/Chatbot';
import { analyzeSeo } from './services/geminiService';
import { useCrawler } from './hooks/useCrawler';
import type { SEOReport } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [report, setReport] = useState<SEOReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { crawl, isCrawling } = useCrawler();
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const isLoading = isCrawling || isAnalyzing;

  const handleAnalyze = useCallback(async () => {
    if (!url) {
      setError('Please enter a valid URL.');
      return;
    }
    setError(null);
    setReport(null);
    setIsAnalyzing(false);

    try {
      const crawledData = await crawl(url);
      setIsAnalyzing(true);
      const apiKey = import.meta.env.VITE_API_KEY;
 // Replace with your actual API key
      const seoReport = await analyzeSeo(crawledData, apiKey);
      setReport(seoReport);
    } catch (e) {
      console.error(e);
      setError('Failed to analyze the URL. Please check the console for details.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [url, crawl]);

  return (
    <div className="min-h-screen bg-primary font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-secondary rounded-xl shadow-2xl p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-text-primary mb-2">
            Autonomous SEO & AEO Agent
          </h1>
          <p className="text-center text-text-secondary mb-8">
            Enter a URL to get a real-time AI-powered SEO analysis and actionable recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-grow bg-primary border-2 border-secondary focus:border-accent focus:ring-0 text-text-primary rounded-lg px-4 py-3 transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="bg-accent hover:bg-highlight disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center"
            >
              {isLoading ? <LoadingSpinner /> : 'Analyze'}
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="text-center text-text-secondary mt-8">
            <p>{isCrawling ? 'Crawling website...' : 'Analyzing data with AI...'}</p>
          </div>
        )}

        {error && (
          <div className="bg-danger/20 border border-danger text-danger px-4 py-3 rounded-lg relative max-w-4xl mx-auto mt-8 animate-fade-in" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {report && (
          <div className="mt-8 animate-fade-in">
            <Dashboard report={report} />
          </div>
        )}
      </main>
      <Chatbot reportContext={report} apiKey={import.meta.env.VITE_API_KEY} />

    </div>
  );
};

export default App;
