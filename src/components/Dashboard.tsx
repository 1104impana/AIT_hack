
import React from 'react';
import type { SEOReport } from '../types';
import { ScoreCard } from './ScoreCard';
import { RecommendationItem } from './RecommendationItem';
import { SeoCategory } from '../types';

interface DashboardProps {
  report: SEOReport;
}

export const Dashboard: React.FC<DashboardProps> = ({ report }) => {
  return (
    <div className="space-y-8">
      {/* Overall Score Section */}
      <div className="bg-secondary rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              strokeDasharray={339.292}
              strokeDashoffset={339.292 * (1 - report.overallScore / 100)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
            <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">{report.overallScore}</span>
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-text-primary">Overall SEO Score</h2>
          <p className="text-text-secondary mt-1">{report.overallSummary}</p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard category={SeoCategory.CONTENT} data={report.categoryScores[SeoCategory.CONTENT]} />
        <ScoreCard category={SeoCategory.TECHNICAL} data={report.categoryScores[SeoCategory.TECHNICAL]} />
        <ScoreCard category={SeoCategory.KEYWORDS} data={report.categoryScores[SeoCategory.KEYWORDS]} />
        <ScoreCard category={SeoCategory.META_TAGS} data={report.categoryScores[SeoCategory.META_TAGS]} />
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Actionable Recommendations</h3>
        <div className="space-y-4">
          {report.recommendations.map((rec, index) => (
            <RecommendationItem key={index} recommendation={rec} />
          ))}
        </div>
      </div>
    </div>
  );
};
