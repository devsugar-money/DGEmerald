import React, { useState, useEffect, useRef } from 'react';
import { X, Save } from './IconProvider';
import { supabase } from '../lib/supabase';

interface NotepadProps {
  surveyId: string;
  onClose: () => void;
}

const Notepad: React.FC<NotepadProps> = ({ surveyId, onClose }) => {
  const [notes, setNotes] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
  // Load notes when component mounts
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const { data, error } = await supabase
          .from('survey_notes')
          .select('content')
          .eq('survey_id', surveyId)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error loading notes:', error);
          return;
        }
        
        if (data) {
          setNotes(data.content);
        }
      } catch (error) {
        console.error('Error loading notes:', error);
      }
    };
    
    loadNotes();
  }, [surveyId]);
  
  // Auto-save every minute
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (notes.trim()) {
        saveNotes();
      }
    }, 60000); // 60 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [notes, surveyId]);
  
  // Display saved message for 3 seconds
  useEffect(() => {
    if (showSavedMessage) {
      const timer = setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedMessage]);
  
  // Focus editor when opened
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);
  
  const saveNotes = async () => {
    try {
      const { error } = await supabase
        .from('survey_notes')
        .upsert({
          survey_id: surveyId,
          content: notes,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'survey_id'
        });
      
      if (error) {
        throw error;
      }
      
      setLastSaved(new Date());
      setShowSavedMessage(true);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveNotes();
    }
    // Close on Escape
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  // Handle content editable changes
  const handleContentChange = () => {
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
    }
  };
  
  // Format date for Apple-like display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    }).format(date);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
         onKeyDown={handleKeyDown}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" 
           style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(0, 0, 0, 0.1)' }}>
        {/* Header - Apple Notes style */}
        <div className="flex items-center justify-between px-6 py-3" 
             style={{ backgroundColor: '#F5F5F5', borderBottom: '1px solid #E0E0E0' }}>
          <div className="flex items-center">
            <h2 className="text-base font-medium text-gray-800">Notes</h2>
            {lastSaved && (
              <span className="ml-3 text-xs text-gray-500">
                {showSavedMessage ? 
                  <span className="text-green-600 font-medium">Saved</span> : 
                  `Edited ${formatDate(lastSaved)}`}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={saveNotes}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Save (Ctrl+S)"
            >
              <Save size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        
        {/* Content area - Apple Notes style */}
        <div className="flex-1 overflow-auto" style={{ backgroundColor: '#FFFDF7' }}>
          <div
            ref={editorRef}
            contentEditable
            onInput={handleContentChange}
            className="min-h-full p-6 outline-none text-gray-800"
            style={{ 
              minHeight: '300px',
              fontSize: '15px',
              lineHeight: '1.6',
              fontFamily: '"-apple-system",-apple-system,BlinkMacSystemFont,"Segoe UI"',
              caretColor: '#000'
            }}
            dangerouslySetInnerHTML={{ __html: notes }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notepad;
