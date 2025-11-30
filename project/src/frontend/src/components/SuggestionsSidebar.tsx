import React from 'react'
import { ComplexWord, AnalysisResult, RuleViolation } from '../services/api'
import './SuggestionsSidebar.css'

interface SuggestionsSidebarProps {
  selectedWord: ComplexWord | null
  selectedViolation: RuleViolation | null
  analysisResult: AnalysisResult | null
  onReplace?: (original: string, replacement: string) => void
}

const SuggestionsSidebar: React.FC<SuggestionsSidebarProps> = ({ selectedWord, selectedViolation, analysisResult, onReplace }) => {
  const totalCount = (analysisResult?.complex_words.length || 0) + (analysisResult?.violations.length || 0);

  return (
    <div className="suggestions-sidebar">
      <div className="sidebar-label">SUGGESTIES</div>
      
      {selectedWord ? (
        <>
          <div className="complex-word-section">
            <div className="section-label">MOEILIJK WOORD:</div>
            <div className="complex-word-box">
              {selectedWord.word}
            </div>
          </div>

          <div className="simpler-options-section">
            <div className="section-label">- EENVOUDIGERE OPTIES:</div>
            <div className="options-list">
              {selectedWord.alternatives.map((option, index) => (
                <div 
                  key={index} 
                  className="option-box"
                  onClick={() => onReplace && onReplace(selectedWord.word, option)}
                >
                  <div className="option-label">OPTIE {index + 1}:</div>
                  <div className="option-value">{option}</div>
                  <div className="resize-handle top-right"></div>
                  <div className="resize-handle bottom-right"></div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : selectedViolation ? (
        <>
          <div className="complex-word-section">
            <div className="section-label">REGELOVERTREDING:</div>
            <div className="complex-word-box violation-box">
              {selectedViolation.rule_name}
            </div>
          </div>

          <div className="simpler-options-section">
            <div className="section-label">- DETAILS:</div>
            <div className="violation-details">
              <p className="violation-message">{selectedViolation.message}</p>
              {selectedViolation.suggestion && (
                <div className="violation-suggestion">
                  <strong>Suggestie:</strong> {selectedViolation.suggestion}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="no-selection-message">
          <p>Selecteer een gemarkeerd item om suggesties te zien.</p>
        </div>
      )}

      <div className="sidebar-footer">
        [{totalCount} problemen gevonden]
      </div>
    </div>
  )
}

export default SuggestionsSidebar
