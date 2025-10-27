
import React, { useState } from 'react';
import type { Recommendation } from '../types';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface RecommendationItemProps {
  recommendation: Recommendation;
}

const priorityStyles = {
  High: { bg: 'bg-danger/20', border: 'border-danger' },
  Medium: { bg: 'bg-warning/20', border: 'border-warning' },
  Low: { bg: 'bg-accent/20', border: 'border-accent' },
};

export const RecommendationItem: React.FC<RecommendationItemProps> = ({ recommendation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const styles = priorityStyles[recommendation.priority];

  return (
    <div className={`bg-secondary rounded-lg border-l-4 ${styles.border} overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex justify-between items-center"
      >
        <div className="flex items-center">
          <span className={`text-sm font-bold px-2 py-1 rounded-md ${styles.bg}`}>
            {recommendation.priority}
          </span>
          <h5 className="ml-4 font-semibold text-text-primary">{recommendation.title}</h5>
        </div>
        <ChevronDownIcon className={`w-6 h-6 text-text-secondary transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-2 text-text-secondary">
          <p>{recommendation.description}</p>
        </div>
      )}
    </div>
  );
};
