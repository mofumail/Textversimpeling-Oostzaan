import { Mark, mergeAttributes } from '@tiptap/core'

export interface ComplexWordOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    complexWord: {
      /**
       * Set a complex word mark
       */
      setComplexWord: (attributes?: { word: string }) => ReturnType
      /**
       * Toggle a complex word mark
       */
      toggleComplexWord: (attributes?: { word: string }) => ReturnType
      /**
       * Unset a complex word mark
       */
      unsetComplexWord: () => ReturnType
    }
  }
}

export const ComplexWord = Mark.create<ComplexWordOptions>({
  name: 'complexWord',

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'complex-word',
      },
    }
  },

  addAttributes() {
    return {
      word: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-word'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.word) {
            return {}
          }

          return {
            'data-word': attributes.word,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span.complex-word',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setComplexWord:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleComplexWord:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },
      unsetComplexWord:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})
