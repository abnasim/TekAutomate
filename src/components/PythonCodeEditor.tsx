import React, { useEffect, useRef } from 'react';
import { EditorView, minimalSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';

interface PythonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const PythonCodeEditor: React.FC<PythonCodeEditorProps> = ({
  value,
  onChange,
  placeholder,
  className = ''
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // Create editor state with Python language support
    const state = EditorState.create({
      doc: value,
      extensions: [
        minimalSetup,
        python(),
        oneDark, // Dark theme
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newValue = update.state.doc.toString();
            onChange(newValue);
          }
        }),
        EditorView.theme({
          '&': {
            fontSize: '14px',
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, "source-code-pro", monospace',
          },
          '.cm-content': {
            padding: '12px',
            minHeight: '400px',
          },
          '.cm-focused': {
            outline: '2px solid #3b82f6',
            outlineOffset: '-2px',
          },
        }),
      ],
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update editor content when value prop changes (but not from user typing)
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      const transaction = viewRef.current.state.update({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value,
        },
      });
      viewRef.current.dispatch(transaction);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={className}>
      <div ref={editorRef} className="border border-gray-300 rounded-lg overflow-hidden" />
      {placeholder && !value && (
        <div className="absolute inset-0 pointer-events-none text-gray-400 text-sm p-4 font-mono">
          {placeholder}
        </div>
      )}
    </div>
  );
};
