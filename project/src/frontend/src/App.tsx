import { useState, useCallback } from 'react'
import TextEditor from './components/TextEditor'
import SuggestionsSidebar from './components/SuggestionsSidebar'
import { analyzeText, ComplexWord } from './services/api'
import './App.css'

function App() {
  const [suggestions, setSuggestions] = useState<ComplexWord[]>([])
  const [selectedWord, setSelectedWord] = useState<ComplexWord | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleEditorUpdate = useCallback(async (text: string) => {
    setIsAnalyzing(true)
    try {
      const result = await analyzeText(text)
      setSuggestions(result.complexWords)
      
      // Auto-select the first found word for demonstration if none selected
      // In a real app, this might be driven by cursor position
      if (result.complexWords.length > 0 && !selectedWord) {
        // Don't auto-select for now, let user click
        // setSelectedWord(result.complexWords[0])
      } else if (result.complexWords.length === 0) {
        setSelectedWord(null)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [selectedWord])

  const handleWordSelect = (word: ComplexWord) => {
    setSelectedWord(word);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-box">
          <span className="logo-text">Aa</span>
        </div>
        <div className="header-content">
          <h1>Text Simplifier</h1>
          <p>[ wireframe prototype v0.1 ]</p>
        </div>
        <div className="header-controls">
          <div className="template-selector">
            <label>TEMPLATES</label>
            <select>
              <option>Legal Document</option>
              <option>Academic Paper</option>
            </select>
          </div>
        </div>
      </header>
      
      <main className="app-main-grid">
        <div className="editor-column">
          <TextEditor 
            onUpdate={handleEditorUpdate} 
            complexWords={suggestions}
            onWordSelect={handleWordSelect}
          />
        </div>
        <div className="sidebar-column">
          <SuggestionsSidebar 
            selectedWord={selectedWord} 
            totalCount={suggestions.length}
          />
        </div>
      </main>
    </div>
  )
}

export default App
