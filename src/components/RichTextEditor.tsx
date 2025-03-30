import React, { lazy, Suspense, forwardRef, useRef, useImperativeHandle } from 'react';

// Lazy load ReactQuill only when needed
const ReactQuillEditor = lazy(() => import('./ReactQuillEditor'));

// Simple loading component
const EditorLoading = () => (
  <div className="min-h-[150px] bg-gray-50 animate-pulse rounded border border-gray-300"></div>
);

// Simple editor as a fallback for when we don't need full rich text capabilities
import SimpleTextEditor from './SimpleTextEditor';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  minHeight?: number;
  simple?: boolean; // Add option to use simple editor
}

export interface RichTextEditorRef {
  focus: () => void;
  blur: () => void;
  getEditor: () => any;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value,
  onChange,
  placeholder = '',
  onBlur,
  onFocus,
  onKeyDown,
  minHeight = 150,
  simple = false
}, ref) => {
  const editorRef = useRef<any>(null);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (editorRef.current?.focus) {
        editorRef.current.focus();
      }
    },
    blur: () => {
      if (editorRef.current?.blur) {
        editorRef.current.blur();
      }
    },
    getEditor: () => {
      if (editorRef.current?.getEditor) {
        return editorRef.current.getEditor();
      }
      return null;
    }
  }));
  
  // Use the simple editor if requested
  if (simple) {
    return (
      <SimpleTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        minHeight={minHeight}
      />
    );
  }

  // Otherwise use the full ReactQuill editor
  return (
    <Suspense fallback={<EditorLoading />}>
      <ReactQuillEditor
        ref={editorRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        minHeight={minHeight}
      />
    </Suspense>
  );
});

export default RichTextEditor;