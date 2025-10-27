
import React from 'react';
import type { CategoryScore, SeoCategory } from '../types';

interface ScoreCardProps {
  category: SeoCategory;
  data: CategoryScore;
}

const getScoreColor = (score: number): string => {
  if (score >= 85) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-danger';
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ category, data }) => {
  const scoreColor = getScoreColor(data.score);

  return (
    <div className="bg-secondary rounded-xl shadow-lg p-6 flex flex-col justify-between">
      <div>
        <h4 className="text-lg font-bold text-text-primary">{category}</h4>
        <p className={`text-4xl font-bold my-3 ${scoreColor}`}>{data.score}<span className="text-2xl text-text-secondary">/100</span></p>
      </div>
      <p className="text-text-secondary text-sm">{data.summary}</p>
    </div>
  );
};
