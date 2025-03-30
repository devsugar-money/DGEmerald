import React, { useState, useEffect } from 'react';

interface SimpleTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onBlur?: () => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  minHeight?: number;
}

// A lightweight editor alternative for when full rich text is not needed
const SimpleTextEditor: React.FC<SimpleTextEditorProps> = ({
  value,
  onChange,
  placeholder = '',
  onBlur,
  onFocus,
  onKeyDown,
  minHeight = 150
}) => {
  const [editorValue, setEditorValue] = useState(value);
  
  useEffect(() => {
    setEditorValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setEditorValue(content);
    onChange(content);
  };

  return (
    <div 
      className="simple-text-editor"
      style={{ minHeight: `${minHeight}px` }}
    >
      <textarea
        value={editorValue}
        onChange={handleChange}
        placeholder={placeholder}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        style={{ 
          height: `${minHeight}px`,
          width: '100%',
          padding: '0.5rem',
          borderRadius: '0.375rem',
          border: '1px solid #d1d5db',
          resize: 'vertical'
        }}
        className="focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      />
    </div>
  );
};

export default SimpleTextEditor;