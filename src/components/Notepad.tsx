import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText } from './IconProvider';
import { supabase } from '../lib/supabase';

interface NotepadProps {
  surveyId: string;
  onClose: () => void;
}

const Notepad: React.FC<NotepadProps> = ({ surveyId, onClose }) => {
  const [notes, setNotes] = useState<string>('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
  
  // Focus textarea when opened
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
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
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <FileText size={18} className="text-indigo-600 mr-2" />
            <h2 className="text-lg font-semibold">Notepad</h2>
          </div>
          <div className="flex items-center space-x-2">
            {showSavedMessage && (
              <span className="text-green-600 text-sm flex items-center">
                Saved
              </span>
            )}
            {lastSaved && (
              <span className="text-xs text-gray-500">
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={saveNotes}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Save (Ctrl+S)"
            >
              <Save size={18} className="text-indigo-600" />
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-grow p-4 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            placeholder="Type your notes here..."
          />
        </div>
      </div>
    </div>
  );
};

export default Notepad;
