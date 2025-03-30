import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Bold, List, CheckSquare, Italic } from './IconProvider';
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
          .select('content, updated_at')
          .eq('survey_id', surveyId)
          .maybeSingle();
        
        if (error) {
          console.error('Error loading notes from database:', error);
          
          // If it's not just a 'not found' error, try an alternative approach
          if (error.code !== 'PGRST116') {
            // Try a different query approach
            const { data: altData, error: altError } = await supabase
              .from('survey_notes')
              .select('content, updated_at')
              .filter('survey_id', 'eq', surveyId)
              .limit(1)
              .single();
              
            if (!altError && altData) {
              setNotes(altData.content);
              setLastSaved(new Date(altData.updated_at));
              console.log('Notes loaded successfully with alternative approach:', altData);
              return;
            }
          }
        }
        
        if (data) {
          setNotes(data.content);
          setLastSaved(new Date(data.updated_at));
          console.log('Notes loaded successfully:', data);
        } else {
          console.log('No notes found for this survey in database');
        }
      } catch (error) {
        console.error('Error in loadNotes:', error);
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
  
  // Focus editor and place cursor at the end when opened
  useEffect(() => {
    if (editorRef.current) {
      // Focus the editor
      editorRef.current.focus();
      
      // Place cursor at the end of the content
      const range = document.createRange();
      const selection = window.getSelection();
      
      if (editorRef.current.childNodes.length > 0) {
        const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
        if (lastNode.nodeType === Node.TEXT_NODE) {
          range.setStart(lastNode, lastNode.textContent?.length || 0);
        } else {
          range.setStartAfter(lastNode);
        }
      } else {
        range.setStart(editorRef.current, 0);
      }
      
      range.collapse(true);
      
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, [notes]);
  
  const saveNotes = async () => {
    try {
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('You must be logged in to save notes');
      }
      
      // First check if a record exists for this survey
      const { data: existingNote, error: checkError } = await supabase
        .from('survey_notes')
        .select('id')
        .eq('survey_id', surveyId)
        .maybeSingle();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking for existing note:', checkError);
      }
      
      let saveError = null;
      
      if (existingNote) {
        // Update existing record
        const { error } = await supabase
          .from('survey_notes')
          .update({
            content: notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingNote.id);
        
        saveError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('survey_notes')
          .insert({
            survey_id: surveyId,
            content: notes,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        saveError = error;
      }
      
      if (saveError) {
        console.error('Error saving notes:', saveError);
        throw saveError;
      }
      
      setLastSaved(new Date());
      setShowSavedMessage(true);
    } catch (error) {
      console.error('Error in saveNotes function:', error);
      // Don't show alert to user, just log to console
      // alert(`Failed to save notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveNotes();
    }
    // Save on Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      // Allow shift+enter for new lines
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
  
  // Format text as bold
  const formatBold = () => {
    document.execCommand('bold', false);
    editorRef.current?.focus();
  };
  
  // Format text as italic
  const formatItalic = () => {
    document.execCommand('italic', false);
    editorRef.current?.focus();
  };
  
  // Insert a bullet list
  const insertBulletList = () => {
    document.execCommand('insertUnorderedList', false);
    editorRef.current?.focus();
  };
  
  // Insert a checkbox
  const insertCheckbox = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '5px';
      range.insertNode(checkbox);
      // Move cursor after checkbox
      range.setStartAfter(checkbox);
      range.setEndAfter(checkbox);
      selection.removeAllRanges();
      selection.addRange(range);
      editorRef.current?.focus();
    } else {
      // If no selection, insert at the end
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.style.marginRight = '5px';
      editorRef.current?.appendChild(checkbox);
      editorRef.current?.focus();
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden" 
           style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(0, 0, 0, 0.1)', width: 'calc(100% - 2rem)' }}>
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
          <div className="flex items-center space-x-2">
            <button
              onClick={saveNotes}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors flex items-center gap-1.5"
              title="Save (Ctrl+S)"
            >
              <Save size={16} />
              <span>Save</span>
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
        
        {/* Formatting toolbar - Apple Notes style */}
        <div className="flex items-center px-4 py-1.5 border-b border-gray-100" style={{ backgroundColor: '#F9F9F9' }}>
          <div className="flex space-x-1">
            <button 
              onClick={formatBold} 
              className="p-1.5 rounded hover:bg-gray-200 transition-colors" 
              title="Bold"
            >
              <Bold size={16} />
            </button>
            <button 
              onClick={formatItalic} 
              className="p-1.5 rounded hover:bg-gray-200 transition-colors" 
              title="Italic"
            >
              <Italic size={16} />
            </button>
            <span className="mx-1 text-gray-300">|</span>
            <button 
              onClick={insertBulletList} 
              className="p-1.5 rounded hover:bg-gray-200 transition-colors" 
              title="Bullet List"
            >
              <List size={16} />
            </button>
            <button 
              onClick={insertCheckbox} 
              className="p-1.5 rounded hover:bg-gray-200 transition-colors" 
              title="Checkbox"
            >
              <CheckSquare size={16} />
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
            dangerouslySetInnerHTML={{ __html: notes || '<div style="color: #aaa; pointer-events: none;">Type your notes here...</div>' }}
            onFocus={() => {
              // Clear placeholder text when focusing empty editor
              if (editorRef.current && editorRef.current.innerHTML.includes('Type your notes here...')) {
                editorRef.current.innerHTML = '';
              }
            }}
            onBlur={() => {
              // Restore placeholder text when blurring empty editor
              if (editorRef.current && !editorRef.current.textContent?.trim()) {
                editorRef.current.innerHTML = '<div style="color: #aaa; pointer-events: none;">Type your notes here...</div>';
                setNotes('');
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Notepad;
