import React, { useState, useEffect, useRef } from 'react'
import { ComplexWord, AnalysisResult, RuleViolation } from '../services/api'
import './TextEditor.css'

interface TextEditorProps {
  onUpdate: (text: string) => void
  analysisResult: AnalysisResult | null
  onWordSelect: (word: ComplexWord) => void
  onViolationSelect: (violation: RuleViolation) => void
  externalText?: string
}

const TextEditor: React.FC<TextEditorProps> = ({ onUpdate, analysisResult, onWordSelect, onViolationSelect, externalText }) => {
  const [content, setContent] = useState("Geachte heer/mevrouw, hierbij informeren wij u over de voortgang.")
  const editorRef = useRef<HTMLDivElement>(null)
  const isUserInput = useRef(false)

  // Helper to get caret position
  const getCaretPosition = (element: HTMLElement) => {
    let caretOffset = 0;
    const doc = element.ownerDocument || document;
    const win = doc.defaultView || window;
    const sel = win.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  // Helper to set caret position
  const setCaretPosition = (element: HTMLElement, offset: number) => {
    const createRange = (node: Node, chars: { count: number }, range?: Range): Range => {
      if (!range) {
        range = document.createRange()
        range.selectNode(node)
        range.setStart(node, 0)
      }

      if (chars.count === 0) {
        range.setEnd(node, chars.count)
      }

      if (node && chars.count > 0) {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.length < chars.count) {
            chars.count -= node.textContent.length
          } else {
            range.setEnd(node, chars.count)
            chars.count = 0
          }
        } else {
          for (let lp = 0; lp < node.childNodes.length; lp++) {
            range = createRange(node.childNodes[lp], chars, range)
            if (chars.count === 0) {
              break
            }
          }
        }
      }
      return range
    }

    if (offset >= 0) {
      const selection = window.getSelection()
      const range = createRange(element, { count: offset })
      if (range) {
        range.collapse(false)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }

  // Handle external text updates
  useEffect(() => {
    if (externalText !== undefined) {
      if (externalText !== content) {
        setContent(externalText)
        if (editorRef.current && !isUserInput.current) {
          editorRef.current.innerText = externalText
          // Re-apply highlights for external text
          updateHighlights(externalText)
        }
      }
      // Always reset user input flag after receiving an external update
      isUserInput.current = false
    }
  }, [externalText])

  // Update highlights when analysis result changes
  useEffect(() => {
    if (editorRef.current) {
      // Save caret
      const caret = getCaretPosition(editorRef.current)
      
      // Update HTML
      updateHighlights(content)
      
      // Restore caret (only if we have focus, otherwise it steals focus)
      if (document.activeElement === editorRef.current) {
        setCaretPosition(editorRef.current, caret)
      }
    }
  }, [analysisResult]) // Re-run when analysis comes back

  const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  const updateHighlights = (text: string) => {
    if (!editorRef.current) return;
    
    if (!analysisResult) {
       if (editorRef.current.innerText !== text) {
          editorRef.current.innerText = text;
       }
       return;
    }

    // Collect all ranges to highlight
    interface HighlightRange {
        start: number;
        end: number;
        type: 'complex' | 'violation';
        data: ComplexWord | RuleViolation;
        id: number; // Unique ID for mapping back
    }
    const ranges: HighlightRange[] = [];

    // 1. Violations (we have indices)
    analysisResult.violations.forEach((v, idx) => {
        ranges.push({ 
            start: v.start_index, 
            end: v.end_index, 
            type: 'violation', 
            data: v,
            id: idx
        });
    });

    // 2. Complex Words (find indices)
    analysisResult.complex_words.forEach((cw, idx) => {
        const regex = new RegExp(`\\b${cw.word}\\b`, 'gi');
        let match;
        while ((match = regex.exec(text)) !== null) {
            ranges.push({ 
                start: match.index, 
                end: match.index + match[0].length, 
                type: 'complex', 
                data: cw,
                id: idx 
            });
        }
    });

    // Sort ranges
    ranges.sort((a, b) => a.start - b.start);

    // Build HTML
    let html = "";
    let lastIndex = 0;

    ranges.forEach(range => {
        if (range.start < lastIndex) return; // Skip overlapping for now

        // Text before highlight
        html += escapeHtml(text.substring(lastIndex, range.start));

        // Highlight
        const className = range.type === 'complex' ? 'highlight-complex' : 'highlight-violation';
        const content = text.substring(range.start, range.end);
        
        // Store type and ID in data attributes
        html += `<span class="${className}" data-type="${range.type}" data-id="${range.id}">${escapeHtml(content)}</span>`;

        lastIndex = range.end;
    });

    html += escapeHtml(text.substring(lastIndex));
    
    // Replace newlines with <br>
    html = html.replace(/\n/g, '<br>');

    editorRef.current.innerHTML = html;
  }

  // const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
  //   isUserInput.current = true
  //   const text = e.currentTarget.innerText
  //   setContent(text)
  //   onUpdate(text)
  // }

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
  isUserInput.current = true
  const text = e.currentTarget.innerText
  setContent(text)
  onUpdate(text)
}
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!analysisResult) return;
    
    const target = e.target as HTMLElement;
    const type = target.getAttribute('data-type');
    const idStr = target.getAttribute('data-id');

    if (type && idStr) {
        const id = parseInt(idStr);
        if (type === 'complex') {
            const cw = analysisResult.complex_words[id];
            if (cw) onWordSelect(cw);
        } else if (type === 'violation') {
            const v = analysisResult.violations[id];
            if (v) onViolationSelect(v);
        }
    }
  }

  return (
    <div className="text-editor-container">
      <div className="editor-toolbar">
        <button className="toolbar-btn bold">B</button>
        <button className="toolbar-btn italic">I</button>
        <div className="toolbar-spacer"></div>
        <span className="status-text">
          {analysisResult ? 
            `${analysisResult.compliance_stats.b1_score.score.toFixed(0)}% B1 Score` : 
            "Klaar om te typen..."}
        </span>
      </div>
      
      <div className="editor-wrapper">
        <div 
          ref={editorRef}
          className="editor-content" 
          contentEditable
          onInput={handleInput}
          onClick={handleClick}
          suppressContentEditableWarning={true}
          spellCheck={false}
        />
      </div>
      
      <div className="editor-footer">
        <span>{content.split(/\s+/).filter(w => w.length > 0).length} woorden</span>
        {analysisResult && (
            <>
                <span className="footer-separator">|</span>
                <span>Gem. Zinslengte: {analysisResult.compliance_stats.avg_sentence_length} woorden</span>
                <span className="footer-separator">|</span>
                <span>Lange Zinnen: {analysisResult.compliance_stats.long_sentences_count}</span>
            </>
        )}
      </div>
    </div>
  )
}

export default TextEditor
