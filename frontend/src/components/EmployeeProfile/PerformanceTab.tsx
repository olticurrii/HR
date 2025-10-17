import React, { useState } from 'react';
import { ObjectivesPanel } from './Performance/ObjectivesPanel';
import { ReviewsPanel } from './Performance/ReviewsPanel';
import { CompetenciesPanel } from './Performance/CompetenciesPanel';
import { PerformanceSummary } from './Performance/PerformanceSummary';

interface PerformanceTabProps {
  userId: number;
}

type PerformanceSubTab = 'Summary' | 'Objectives' | 'Reviews' | 'Competencies';

export const PerformanceTab: React.FC<PerformanceTabProps> = ({ userId }) => {
  const [activeSubTab, setActiveSubTab] = useState<PerformanceSubTab>('Summary');

  const subTabs: PerformanceSubTab[] = ['Summary', 'Objectives', 'Reviews', 'Competencies'];

  const renderContent = () => {
    switch (activeSubTab) {
      case 'Summary':
        return <PerformanceSummary userId={userId} />;
      case 'Objectives':
        return <ObjectivesPanel userId={userId} />;
      case 'Reviews':
        return <ReviewsPanel userId={userId} />;
      case 'Competencies':
        return <CompetenciesPanel userId={userId} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-1 border-b border-gray-200 px-6">
          {subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                activeSubTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600 -mb-px'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

