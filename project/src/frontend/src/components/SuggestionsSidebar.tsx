import React from 'react';
import './SuggestionsSidebar.css';
import { ComplexWord } from '../services/api';

interface SuggestionsSidebarProps {
  selectedWord: ComplexWord | null;
  totalCount?: number;
}

const SuggestionsSidebar: React.FC<SuggestionsSidebarProps> = ({ selectedWord, totalCount = 0 }) => {
  return (
    <div className="suggestions-sidebar">
      <div className="sidebar-label">SUGGESTIONS</div>
      
      {selectedWord ? (
        <>
          <div className="complex-word-section">
            <div className="section-label">COMPLEX WORD:</div>
            <div className="complex-word-box">
              {selectedWord.word}
            </div>
          </div>

          <div className="simpler-options-section">
            <div className="section-label">- SIMPLER OPTIONS:</div>
            <div className="options-list">
              {selectedWord.alternatives.map((option, index) => (
                <div key={index} className="option-box">
                  <div className="option-label">OPTION {index + 1}:</div>
                  <div className="option-value">{option}</div>
                  <div className="resize-handle top-right"></div>
                  <div className="resize-handle bottom-right"></div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="no-selection-message">
          <p>Select a word to see suggestions.</p>
        </div>
      )}

      <div className="sidebar-footer">
        [{totalCount} complex words found]
      </div>
    </div>
  );
};

export default SuggestionsSidebar;
