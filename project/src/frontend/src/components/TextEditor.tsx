import React, { useEffect } from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough, List, ListOrdered, Undo, Redo } from 'lucide-react'
import { ComplexWord } from './extensions/ComplexWord'
import { ComplexWord as ComplexWordType } from '../services/api'
import './TextEditor.css'

interface MenuBarProps {
  editor: Editor | null
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="editor-toolbar">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <Italic size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
        title="Strike"
      >
        <Strikethrough size={16} />
      </button>
      
      <div className="divider"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet List"
      >
        <List size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Ordered List"
      >
        <ListOrdered size={16} />
      </button>

      <div className="divider"></div>

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo"
      >
        <Undo size={16} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo"
      >
        <Redo size={16} />
      </button>
    </div>
  )
}

interface TextEditorProps {
  onUpdate?: (text: string) => void;
  complexWords?: ComplexWordType[];
  onWordSelect?: (word: ComplexWordType) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ onUpdate, complexWords = [], onWordSelect }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      ComplexWord,
    ],
    content: `
      <p>Probeer bijvoorbeeld te typen: Wij dienen de <span class="complex-word" data-word="onderhavige">onderhavige</span> <span class="complex-word" data-word="bescheiden">bescheiden</span> te beoordelen <span class="complex-word" data-word="teneinde">teneinde</span> een adequaat oordeel te kunnen vormen.</p>
    `,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getText())
      }
    },
    editorProps: {
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('complex-word')) {
          const word = target.getAttribute('data-word');
          if (word && onWordSelect) {
            // Find the full complex word object
            const found = complexWords.find(cw => cw.word === word);
            if (found) {
              onWordSelect(found);
              return true; // Handled
            }
          }
        }
        return false;
      }
    }
  })

  // Effect to highlight words when complexWords changes
  useEffect(() => {
    if (!editor || complexWords.length === 0) return;

    // This is a simplified approach. In a real app, we would scan the document
    // and apply marks where appropriate. For now, we rely on the initial content 
    // or the user typing. 
    // To make it robust, we would need to traverse the doc and set marks.
    
  }, [editor, complexWords])

  return (
    <div className="text-editor-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="editor-content" />
    </div>
  )
}

export default TextEditor
