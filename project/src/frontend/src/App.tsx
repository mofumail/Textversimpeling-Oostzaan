import { useState, useCallback, useEffect } from 'react'
import TextEditor from './components/TextEditor'
import SuggestionsSidebar from './components/SuggestionsSidebar'
import { analyzeText, rewriteText, getTemplates, ComplexWord, AnalysisResult, Template, RuleViolation } from './services/api'
import './App.css'

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [selectedWord, setSelectedWord] = useState<ComplexWord | null>(null)
  const [selectedViolation, setSelectedViolation] = useState<RuleViolation | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [editorContent, setEditorContent] = useState<string>("")

  useEffect(() => {
    // Load templates on mount
    getTemplates().then(data => {
      setTemplates(data.templates)
    }).catch(console.error)
  }, [])

  const handleEditorUpdate = useCallback(async (text: string) => {
    setEditorContent(text)
    try {
      const result = await analyzeText(text)
      setAnalysisResult(result)
      
      // Clear selections if they are no longer valid
      if (selectedWord) {
        const stillExists = result.complex_words.some(w => w.word === selectedWord.word)
        if (!stillExists) setSelectedWord(null)
      }
      // For violations, it's harder to track identity since they don't have IDs.
      // We'll just clear violation selection on update to be safe/simple.
      setSelectedViolation(null)

    } catch (error) {
      console.error("Analysis failed:", error)
    }
  }, [selectedWord])

  const handleWordSelect = (word: ComplexWord) => {
    setSelectedWord(word);
    setSelectedViolation(null); // Exclusive selection
  }

  const handleViolationSelect = (violation: RuleViolation) => {
    setSelectedViolation(violation);
    setSelectedWord(null); // Exclusive selection
  }

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = parseInt(e.target.value)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setEditorContent(template.content)
      handleEditorUpdate(template.content)
    }
  }

  const handleRewrite = async () => {
    if (!editorContent) return;
    try {
      const result = await rewriteText(editorContent)
      setEditorContent(result.simplified_text)
      // Trigger analysis on new text
      handleEditorUpdate(result.simplified_text)
    } catch (error) {
      console.error("Rewrite failed:", error)
    }
  }

  const handleReplace = (original: string, replacement: string) => {
    // Case insensitive replacement
    const regex = new RegExp(`\\b${original}\\b`, 'gi');
    const newContent = editorContent.replace(regex, replacement);
    
    setEditorContent(newContent);
    // Trigger analysis immediately
    handleEditorUpdate(newContent);
    // Clear selection
    setSelectedWord(null);
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-box">
          <span className="logo-text">Aa</span>
        </div>
        <div className="header-content">
          <h1>Tekstvereenvoudiger</h1>
          <p>[ wireframe prototype v0.1 ]</p>
        </div>
        <div className="header-controls">
          <div className="template-selector">
            <label>SJABLONEN</label>
            <select onChange={handleTemplateChange} defaultValue="">
              <option value="" disabled>Selecteer een sjabloon...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <button className="rewrite-btn" onClick={handleRewrite}>
            Vereenvoudig Alles
          </button>
        </div>
      </header>
      
      <main className="app-main-grid">
        <div className="editor-column">
          <TextEditor 
            onUpdate={handleEditorUpdate} 
            analysisResult={analysisResult}
            onWordSelect={handleWordSelect}
            onViolationSelect={handleViolationSelect}
            externalText={editorContent}
          />
        </div>
        <div className="sidebar-column">
          <SuggestionsSidebar 
            selectedWord={selectedWord} 
            selectedViolation={selectedViolation}
            analysisResult={analysisResult}
            onReplace={handleReplace}
          />
        </div>
      </main>
    </div>
  )
}

export default App
