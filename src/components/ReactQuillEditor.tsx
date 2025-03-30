import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface ReactQuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  minHeight?: number;
}

export interface ReactQuillEditorRef {
  focus: () => void;
  blur: () => void;
  getEditor: () => any;
}

// This component is intended to be lazy-loaded
const ReactQuillEditor = forwardRef<ReactQuillEditorRef, ReactQuillEditorProps>((
  {
    value,
    onChange,
    placeholder = '',
    onBlur,
    onFocus,
    onKeyDown,
    minHeight = 150
  }, 
  ref
) => {
  const [editorValue, setEditorValue] = useState(value);
  const quillRef = useRef<ReactQuill>(null);
  
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  // Expose imperative methods to parent components
  useImperativeHandle(ref, () => ({
    focus: () => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        if (editor) editor.focus();
      }
    },
    blur: () => {
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        if (editor) editor.blur();
      }
    },
    getEditor: () => {
      if (quillRef.current) {
        return quillRef.current.getEditor();
      }
      return null;
    }
  }));

  const handleChange = (content: string) => {
    setEditorValue(content);
    onChange(content);
  };

  // Use a modern MutationObserver instead of DOMNodeInserted
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      // Access the DOM element that contains the editor
      const editorElement = editor?.root;
      
      if (editorElement) {
        // Create a MutationObserver to watch for DOM changes
        const observer = new MutationObserver(() => {
          // We're just observing changes, not processing them specifically
          // This replaces the deprecated DOMNodeInserted event listeners
        });
        
        // Start observing the editor element
        observer.observe(editorElement, {
          childList: true,
          subtree: true
        });
        
        // Clean up observer on component unmount
        return () => {
          observer.disconnect();
        };
      }
    }
  }, []);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If Enter is pressed without Shift (which would create a new line)
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      // Make sure we update the parent with the latest value before handling Enter
      onChange(editorValue);
      
      // Now prevent default and let parent handle it
      e.preventDefault(); // Prevent default behavior
      e.stopPropagation(); // Stop event from bubbling up
      
      if (onKeyDown) {
        onKeyDown(e);
      }
    } else if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div 
      className="rich-text-editor"
      style={{ minHeight: `${minHeight}px` }}
      onKeyDown={handleKeyDown}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        onBlur={onBlur}
        onFocus={onFocus}
        style={{ 
          height: `${minHeight - 42}px`, // Adjust for toolbar height
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}
      />
    </div>
  );
});

export default ReactQuillEditor;