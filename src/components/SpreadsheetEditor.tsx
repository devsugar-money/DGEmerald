import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSurveyStore } from '../store/surveyStore';
import { Plus, AlertCircle, ChevronDown, ArrowUpDown, CheckCircle, Trash2, FileText } from '../components/IconProvider';
// Removed DroppableArea import as we're using custom drag and drop
import Modal from './Modal';
import Notepad from './Notepad';

// Lazy load RichTextEditor which brings in React-Quill
const RichTextEditor = lazy(() => import('./RichTextEditor'));

// Loading component for RichTextEditor
const EditorLoading = () => (
  <div className="min-h-[150px] bg-gray-50 animate-pulse rounded"></div>
);

interface SpreadsheetEditorProps {
  surveyId: string;
}

const SpreadsheetEditor: React.FC<SpreadsheetEditorProps> = ({ surveyId }) => {
  const { 
    questions, hints, learns, actions, terminates,
    createQuestion, updateQuestion, deleteQuestion, updateQuestionOrder,
    createHint, createLearn, createAction, createTerminate
  } = useSurveyStore();
  
  const [rows, setRows] = useState<Array<any>>([]);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState<Record<string, boolean>>({});
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  
  // State for direct cell editing via modal
  const [directEditCell, setDirectEditCell] = useState<{rowId: string, field: 'yes_leads_to' | 'no_leads_to'} | null>(null);
  
  // Cell edit mode modals
  const [showCellModal, setShowCellModal] = useState(false);
  const [currentCellContent, setCurrentCellContent] = useState('');
  const [currentCellField, setCurrentCellField] = useState('');
  const [currentRowId, setCurrentRowId] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Notepad state
  const [showNotepad, setShowNotepad] = useState(false);

  // Resource editing state
  const [resourceEdits, setResourceEdits] = useState<Record<string, {
    hint_title?: string;
    hint_content?: string;
    learn_title?: string;
    learn_content?: string;
    action_content?: string;
    action_trigger?: string | null;
    terminate_content?: string;
  }>>({});
  
  // Initialize rows from questions
  useEffect(() => {
    if (questions.length > 0) {
      const formattedRows = questions
        .sort((a, b) => a.order_position - b.order_position)
        .map(question => ({
          id: question.id,
          text: question.text,
          order_position: question.order_position,
          yes_leads_to: question.yes_leads_to,
          no_leads_to: question.no_leads_to,
          hint_id: question.hint_id,
          learn_id: question.learn_id,
          action_id: question.action_id,
          action_trigger: question.action_trigger,
          terminate_id: question.terminate_id
        }));
      setRows(formattedRows);
    }
  }, [questions]);

  // Auto-save every minute
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      const rowsWithChanges = Object.keys(hasChanges).filter(id => hasChanges[id]);
      if (rowsWithChanges.length > 0) {
        // Save the first row with changes
        const rowToSave = rowsWithChanges[0];
        handleSaveRow(rowToSave).then(() => {
          setLastSaved(new Date());
          setShowSavedMessage(true);
          setTimeout(() => setShowSavedMessage(false), 3000);
        });
      }
    }, 60000); // 60 seconds

    return () => clearInterval(autoSaveInterval);
  }, [hasChanges, rows, resourceEdits]);

  // Display saved message for 3 seconds
  useEffect(() => {
    if (showSavedMessage) {
      const timer = setTimeout(() => {
        setShowSavedMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedMessage]);
  
  const handleAddRow = async () => {
    try {
      const newQuestion = await createQuestion(surveyId, "", rows.length);
      setRows([...rows, {
        id: newQuestion.id,
        text: newQuestion.text,
        order_position: rows.length,
        yes_leads_to: null,
        no_leads_to: null,
        hint_id: null,
        learn_id: null,
        action_id: null,
        action_trigger: null,
        terminate_id: null
      }]);
      
      // Scroll to the bottom of the page
      window.scrollTo(0, document.body.scrollHeight);
    } catch (error) {
      console.error("Error adding new row:", error);
    }
  };

  const handleInsertQuestion = async (index: number) => {
    try {
      if (!newQuestionText.trim()) {
        alert("Please enter question text");
        return;
      }
      
      // If inserting at the end, adjust the index
      const isInsertingAtEnd = index === rows.length;
      
      // Create new question with appropriate order position
      const newQuestion = await createQuestion(
        surveyId,
        newQuestionText,
        isInsertingAtEnd ? rows.length : index
      );
      
      // Adjust order of all questions
      const updatedRows = [...rows];
      
      // Insert new question at the specified index
      if (isInsertingAtEnd) {
        // If inserting at end, add to the end of the array
        updatedRows.push({
          id: newQuestion.id,
          text: newQuestion.text,
          order_position: rows.length,
          yes_leads_to: null,
          no_leads_to: null,
          hint_id: null,
          learn_id: null,
          action_id: null,
          action_trigger: null,
          terminate_id: null
        });
      } else {
        // Otherwise insert at the specified index
        updatedRows.splice(index, 0, {
          id: newQuestion.id,
          text: newQuestion.text,
          order_position: index,
          yes_leads_to: null,
          no_leads_to: null,
          hint_id: null,
          learn_id: null,
          action_id: null,
          action_trigger: null,
          terminate_id: null
        });
      }
      
      // Update order positions
      const questionsWithUpdatedOrder = updatedRows.map((question, idx) => ({
        id: question.id,
        order_position: idx
      }));
      
      // Set the updated rows first
      setRows(updatedRows);
      
      // Update the order in the database
      await updateQuestionOrder(questionsWithUpdatedOrder);
      
      // Reset insert form state
      setNewQuestionText('');
      setShowInsertForm(false);
      setInsertIndex(null);
      
      // If inserting at end, scroll to the bottom
      if (isInsertingAtEnd) {
        window.scrollTo(0, document.body.scrollHeight);
      }
    } catch (error) {
      console.error("Error inserting question:", error);
    }
  };
  
  const handleCellChange = (id: string, field: string, value: any) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
    setHasChanges({...hasChanges, [id]: true});
  };

  // Handle delete question
  const handleDeleteRow = async (id: string) => {
    try {
      // Call the deleteQuestion function from the store
      await deleteQuestion(id);
      
      // Update the rows state by removing the deleted row
      setRows(rows.filter(row => row.id !== id));
      
      // Clean up any editing state for this row
      const newIsEditing = { ...isEditing };
      delete newIsEditing[id];
      setIsEditing(newIsEditing);
      
      const newHasChanges = { ...hasChanges };
      delete newHasChanges[id];
      setHasChanges(newHasChanges);
      
      const newResourceEdits = { ...resourceEdits };
      delete newResourceEdits[id];
      setResourceEdits(newResourceEdits);

      setShowDeleteConfirm(false);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting row:", error);
    }
  };

  // Open the cell editing modal
  const openCellModal = (rowId: string, field: string, content: string) => {
    // If not in edit mode, initialize resource edits for this row
    if (!isEditing[rowId]) {
      const row = rows.find(r => r.id === rowId);
      if (row) {
        initializeResourceEditsForRow(row);
        setIsEditing({...isEditing, [rowId]: true});
      }
    }
    
    setCurrentRowId(rowId);
    setCurrentCellField(field);
    setCurrentCellContent(content);
    setShowCellModal(true);
  };

  // Function to save cell content and close modal
  const handleSaveAndCloseModal = () => {
    // Update the content in state
    if (currentCellField === 'text') {
      handleCellChange(currentRowId, 'text', currentCellContent);
    } else {
      handleResourceChange(currentRowId, currentCellField, currentCellContent);
    }
    
    // Close the modal
    setShowCellModal(false);
    
    // Then immediately save to database
    handleSaveRow(currentRowId);
  };

  // Initialize resource edits when a row enters edit mode
  const initializeResourceEditsForRow = (row: any) => {
    const edits = {
      hint_title: getResourceTitle('hint', row.hint_id),
      hint_content: getResourceContent('hint', row.hint_id),
      learn_title: getResourceTitle('learn', row.learn_id),
      learn_content: getResourceContent('learn', row.learn_id),
      action_content: getResourceTitle('action', row.action_id),
      action_trigger: row.action_trigger,
      terminate_content: getResourceTitle('terminate', row.terminate_id)
    };
    
    setResourceEdits({
      ...resourceEdits,
      [row.id]: edits
    });
  };
  
  // Handle resource field changes
  const handleResourceChange = (rowId: string, field: string, value: string | null) => {
    // Update the resourceEdits state
    setResourceEdits({
      ...resourceEdits,
      [rowId]: {
        ...resourceEdits[rowId],
        [field]: value
      }
    });
    setHasChanges({...hasChanges, [rowId]: true});
  };
  
  const handleSaveRow = async (id: string) => {
    const row = rows.find(r => r.id === id);
    if (!row) return;
    
    try {
      // First, handle resources
      let updatedRow = { ...row };
      
      if (resourceEdits[id]) {
        // Handle hint
        if (resourceEdits[id].hint_title && resourceEdits[id].hint_content) {
          if (row.hint_id) {
            // Update existing hint logic would go here
            // For now, create a new one as a workaround
            const hint = await createHint(
              resourceEdits[id].hint_title || "", 
              resourceEdits[id].hint_content || ""
            );
            updatedRow.hint_id = hint.id;
          } else {
            // Create new hint
            const hint = await createHint(
              resourceEdits[id].hint_title || "", 
              resourceEdits[id].hint_content || ""
            );
            updatedRow.hint_id = hint.id;
          }
        }
        
        // Handle learn
        if (resourceEdits[id].learn_title && resourceEdits[id].learn_content) {
          if (row.learn_id) {
            // Update existing learn logic would go here
            // For now, create a new one as a workaround
            const learn = await createLearn(
              resourceEdits[id].learn_title || "", 
              resourceEdits[id].learn_content || ""
            );
            updatedRow.learn_id = learn.id;
          } else {
            // Create new learn
            const learn = await createLearn(
              resourceEdits[id].learn_title || "", 
              resourceEdits[id].learn_content || ""
            );
            updatedRow.learn_id = learn.id;
          }
        }
        
        // Handle action
        if (resourceEdits[id].action_content) {
          if (row.action_id) {
            // Update existing action logic would go here
            // For now, create a new one as a workaround
            const action = await createAction(resourceEdits[id].action_content || "");
            updatedRow.action_id = action.id;
          } else {
            // Create new action
            const action = await createAction(resourceEdits[id].action_content || "");
            updatedRow.action_id = action.id;
          }
          
          // Set action_trigger
          updatedRow.action_trigger = resourceEdits[id].action_trigger;
        }
        
        // Handle terminate
        if (resourceEdits[id].terminate_content) {
          if (row.terminate_id) {
            // Update existing terminate logic would go here
            // For now, create a new one as a workaround
            const terminate = await createTerminate(resourceEdits[id].terminate_content || "");
            updatedRow.terminate_id = terminate.id;
          } else {
            // Create new terminate
            const terminate = await createTerminate(resourceEdits[id].terminate_content || "");
            updatedRow.terminate_id = terminate.id;
          }
        }
      }
      
      // Now update the question with all changes
      await updateQuestion(id, {
        text: updatedRow.text,
        yes_leads_to: updatedRow.yes_leads_to || null,
        no_leads_to: updatedRow.no_leads_to || null,
        hint_id: updatedRow.hint_id || null,
        learn_id: updatedRow.learn_id || null,
        action_id: updatedRow.action_id || null,
        action_trigger: updatedRow.action_trigger || null,
        terminate_id: updatedRow.terminate_id || null
      });
      
      // Update rows to reflect new resource IDs
      setRows(rows.map(r => r.id === id ? updatedRow : r));
      
      // Clear the hasChanges flag and exit edit mode when save is pressed
      setHasChanges({...hasChanges, [id]: false});
      setIsEditing({...isEditing, [id]: false});
      
      // Update last saved time
      setLastSaved(new Date());
      setShowSavedMessage(true);
      setTimeout(() => setShowSavedMessage(false), 3000);
    } catch (error) {
      console.error("Error saving row:", error);
    }
  };
  
  // We'll use a simpler approach with a modal for editing yes/no cells

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(rows);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update order positions
    const updatedQuestions = items.map((item, index) => ({
      id: item.id,
      order_position: index
    }));
    
    setRows(items.map((item, index) => ({
      ...item,
      order_position: index
    })));
    
    try {
      await updateQuestionOrder(updatedQuestions);
    } catch (error) {
      console.error("Error updating question order:", error);
    }
  };

  // Custom drag and drop handlers for table rows
  const handleRowDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.dataTransfer.setData('text/plain', rows[index].id);
    e.dataTransfer.effectAllowed = 'move';
    const row = e.currentTarget;
    row.classList.add('opacity-50');
  };

  const handleRowDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleRowDrop = (e: React.DragEvent<HTMLTableRowElement>, targetIndex: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const sourceIndex = rows.findIndex(row => row.id === id);
    
    if (sourceIndex !== targetIndex) {
      handleDragEnd({
        source: { index: sourceIndex },
        destination: { index: targetIndex }
      });
    }
  };

  const handleRowDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };
  
  // Helper function to get question index by id
  const getQuestionIndexById = (id: string | null | undefined) => {
    if (!id) return "";
    const question = questions.find(q => q.id === id);
    return question ? `${question.order_position + 1}` : "";
  };
  
  // Helper function to get resource title by id
  const getResourceTitle = (type: 'hint' | 'learn' | 'action' | 'terminate', id: string | null) => {
    if (!id) return "";
    
    let resource = null;
    switch(type) {
      case 'hint':
        resource = hints.find(h => h.id === id);
        return resource ? resource.title : "";
      case 'learn':
        resource = learns.find(l => l.id === id);
        return resource ? resource.title : "";
      case 'action':
        resource = actions.find(a => a.id === id);
        return resource ? resource.content.substring(0, 30) + (resource.content.length > 30 ? "..." : "") : "";
      case 'terminate':
        resource = terminates.find(t => t.id === id);
        return resource ? resource.content.substring(0, 30) + (resource.content.length > 30 ? "..." : "") : "";
    }
  };
  
  // Helper function to get resource content by id
  const getResourceContent = (type: 'hint' | 'learn', id: string | null) => {
    if (!id) return "";
    
    let resource = null;
    switch(type) {
      case 'hint':
        resource = hints.find(h => h.id === id);
        return resource ? resource.content : "";
      case 'learn':
        resource = learns.find(l => l.id === id);
        return resource ? resource.content : "";
    }
  };

  // Note: We no longer need the stripHtml function since we're using the rich text editor exclusively

  // Function to render the content of a cell with a preview of formatted text
  const renderCellContent = (content: string) => {
    if (!content) return <div className="min-h-[40px]"></div>;
    
    return (
      <div 
        className="text-sm min-h-[40px] max-h-[120px] overflow-hidden relative"
        dangerouslySetInnerHTML={{ __html: content }}
      >
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Decision Tree Spreadsheet</h2>
          <button
            onClick={() => setShowNotepad(true)}
            className="text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-md flex items-center text-sm gap-1.5"
            title="Open Notepad"
          >
            <FileText size={16} />
            <span>Notepad</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          {showSavedMessage && (
            <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
              <CheckCircle size={14} className="mr-1" /> 
              Changes saved
            </div>
          )}
          <button
            onClick={handleAddRow}
            className="bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 transition-colors flex items-center text-sm"
          >
            <Plus size={16} className="mr-1" /> Add Question
          </button>
        </div>
      </div>
      
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 border-collapse">
            <thead className="bg-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-10">
                  #
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-72">
                  <div className="flex items-center">
                    QUESTION <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-16">
                  <div className="flex flex-col items-center">
                    YES <span className="text-[10px]">ANSWER</span>
                  </div>
                </th>
                <th className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-16">
                  <div className="flex flex-col items-center">
                    NO <span className="text-[10px]">ANSWER</span>
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-28">
                  <div className="flex items-center">
                    HINT TITLE <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-60">
                  <div className="flex items-center">
                    HINT <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-28">
                  <div className="flex items-center">
                    LEARN TITLE <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-60">
                  <div className="flex items-center">
                    LEARN <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-60">
                  <div className="flex items-center">
                    ACTION <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-60">
                  <div className="flex items-center">
                    ANSWER TERMINATE <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
              </tr>
            </thead>
              
            <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, index) => (
                  <React.Fragment key={row.id}>
                    {/* Insert button row */}
                    {!showInsertForm && insertIndex === index && (
                      <tr className="bg-blue-50">
                        <td colSpan={10} className="px-2 py-1 border border-blue-100 text-center">
                          <button
                            className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-indigo-200 inline-flex items-center"
                            onClick={() => {
                              setShowInsertForm(true);
                              // Ensure scrolling to the position of the insert row
                              setTimeout(() => {
                                const element = document.getElementById(`insert-form-${index}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }, 100);
                            }}
                          >
                            <Plus size={14} className="mr-1" /> Insert new question here
                          </button>
                        </td>
                      </tr>
                    )}
                    
                    {/* Insert form */}
                    {showInsertForm && insertIndex === index && (
                      <tr className="bg-blue-50" id={`insert-form-${index}`}>
                        <td colSpan={10} className="px-2 py-2 border border-gray-300">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleInsertQuestion(index);
                                }
                              }}
                              placeholder="Enter new question text"
                              className="border border-gray-300 p-2 rounded-md flex-grow text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleInsertQuestion(index)}
                              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                            >
                              Insert
                            </button>
                            <button
                              onClick={() => {
                                setShowInsertForm(false);
                                setNewQuestionText('');
                              }}
                              className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Question row */}
                    <tr 
                      key={row.id}
                      className={`${isEditing[row.id] ? "bg-blue-50" : index % 2 === 0 ? "bg-gray-50" : "bg-white"} transition-colors duration-200`}
                      draggable={true}
                      onDragStart={(e) => handleRowDragStart(e, index)}
                      onDragOver={handleRowDragOver}
                      onDrop={(e) => handleRowDrop(e, index)}
                      onDragEnd={handleRowDragEnd}
                      onClick={() => {
                        // Toggle edit mode for the row
                        setIsEditing({...isEditing, [row.id]: !isEditing[row.id]});
                      }}
                      data-id={row.id}
                      data-index={index}
                    >
                        {/* Row number cell */}
                        <td className="px-2 py-1 text-center border border-gray-300">
                          <div className="flex items-center justify-center cursor-move">
                            <span className="font-mono text-xs text-gray-500 mr-1">{index + 1}</span>
                            <ArrowUpDown size={14} className="text-gray-500" />
                          </div>
                        </td>

                        {/* Question text cell */}
                        <td className="px-2 py-1 whitespace-normal border border-gray-300">
                          {isEditing[row.id] ? (
                            <div className="p-1">
                              <div 
                                className="w-full text-left bg-white p-2 border border-blue-300 rounded hover:bg-blue-50 cursor-pointer"
                                onClick={() => openCellModal(row.id, 'text', row.text)}
                              >
                                {renderCellContent(row.text) || <span className="text-gray-400">Click to edit...</span>}
                              </div>
                            </div>
                          ) : (
                            <div className="flex">
                              <div 
                                className="text-sm cursor-pointer hover:text-indigo-600 flex-grow"
                                onClick={() => openCellModal(row.id, 'text', row.text)}
                              >
                                {renderCellContent(row.text)}
                              </div>
                              <div className="flex flex-shrink-0">
                                <button 
                                  className="text-indigo-400 hover:text-indigo-600 p-1"
                                  onClick={() => {
                                    if (insertIndex === index) {
                                      setInsertIndex(null);
                                    } else {
                                      setInsertIndex(index);
                                      setShowInsertForm(false);
                                    }
                                  }}
                                  title="Insert question here"
                                >
                                  <Plus size={14} />
                                </button>
                                <button
                                  className="text-red-400 hover:text-red-600 p-1"
                                  onClick={() => {
                                    setDeleteConfirmId(row.id);
                                    setShowDeleteConfirm(true);
                                  }}
                                  title="Delete question"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Yes leads to cell */}
                        <td 
                          className="px-2 py-1 text-center border border-gray-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isEditing[row.id]) {
                              setDirectEditCell({rowId: row.id, field: 'yes_leads_to'});
                            }
                          }}
                        >
                          {isEditing[row.id] ? (
                            <select
                              value={row.yes_leads_to || ''}
                              onChange={(e) => handleCellChange(row.id, 'yes_leads_to', e.target.value || undefined)}
                              className="w-full border rounded-md p-1 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">-</option>
                              {questions
                                .filter(q => q.id !== row.id)
                                .map(q => (
                                  <option key={q.id} value={q.id}>
                                    {q.order_position + 1}
                                  </option>
                                ))
                              }
                            </select>
                          ) : (
                            <div className="text-sm text-center cursor-pointer hover:text-indigo-600 font-medium">
                              {getQuestionIndexById(row.yes_leads_to)}
                            </div>
                          )}
                        </td>

                        {/* No leads to cell */}
                        <td 
                          className="px-2 py-1 text-center border border-gray-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isEditing[row.id]) {
                              setDirectEditCell({rowId: row.id, field: 'no_leads_to'});
                            }
                          }}
                        >
                          {isEditing[row.id] ? (
                            <select
                              value={row.no_leads_to || ''}
                              onChange={(e) => handleCellChange(row.id, 'no_leads_to', e.target.value || undefined)}
                              className="w-full border rounded-md p-1 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <option value="">-</option>
                              {questions
                                .filter(q => q.id !== row.id)
                                .map(q => (
                                  <option key={q.id} value={q.id}>
                                    {q.order_position + 1}
                                  </option>
                                ))
                              }
                            </select>
                          ) : (
                            <div className="text-sm text-center cursor-pointer hover:text-indigo-600 font-medium">
                              {getQuestionIndexById(row.no_leads_to)}
                            </div>
                          )}
                        </td>

                        {/* Hint title cell */}
                        <td className="px-2 py-1 border border-gray-300">
                          <div 
                            className="text-sm cursor-pointer hover:text-indigo-600 min-h-[40px]"
                            onClick={() => openCellModal(row.id, 'hint_title', getResourceTitle('hint', row.hint_id))}
                          >
                            {renderCellContent(getResourceTitle('hint', row.hint_id))}
                          </div>
                        </td>

                        {/* Hint content cell */}
                        <td className="px-2 py-1 border border-gray-300">
                          {isEditing[row.id] ? (
                            <div className="p-1">
                              <div 
                                className="w-full text-left bg-white p-2 border border-blue-300 rounded hover:bg-blue-50 cursor-pointer"
                                onClick={() => openCellModal(row.id, 'hint_content', resourceEdits[row.id]?.hint_content || '')}
                              >
                                {renderCellContent(resourceEdits[row.id]?.hint_content || '') || <span className="text-gray-400">Click to edit...</span>}
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="text-sm cursor-pointer hover:text-indigo-600 min-h-[40px]"
                              onClick={() => openCellModal(row.id, 'hint_content', getResourceContent('hint', row.hint_id))}
                            >
                              {renderCellContent(getResourceContent('hint', row.hint_id))}
                            </div>
                          )}
                        </td>

                        {/* Learn title cell */}
                        <td className="px-2 py-1 border border-gray-300">
                          <div 
                            className="text-sm cursor-pointer hover:text-indigo-600 min-h-[40px]"
                            onClick={() => openCellModal(row.id, 'learn_title', getResourceTitle('learn', row.learn_id))}
                          >
                            {renderCellContent(getResourceTitle('learn', row.learn_id))}
                          </div>
                        </td>

                        {/* Learn content cell */}
                        <td className="px-2 py-1 border border-gray-300">
                          {isEditing[row.id] ? (
                            <div className="p-1">
                              <div 
                                className="w-full text-left bg-white p-2 border border-blue-300 rounded hover:bg-blue-50 cursor-pointer"
                                onClick={() => openCellModal(row.id, 'learn_content', resourceEdits[row.id]?.learn_content || '')}
                              >
                                {renderCellContent(resourceEdits[row.id]?.learn_content || '') || <span className="text-gray-400">Click to edit...</span>}
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="text-sm cursor-pointer hover:text-indigo-600 min-h-[40px]"
                              onClick={() => openCellModal(row.id, 'learn_content', getResourceContent('learn', row.learn_id))}
                            >
                              {renderCellContent(getResourceContent('learn', row.learn_id))}
                            </div>
                          )}
                        </td>

                        {/* Action cell */}
                        <td className="px-2 py-1 border border-gray-300">
                          {isEditing[row.id] ? (
                            <div className="p-1">
                              <div 
                                className="w-full text-left bg-white p-2 border border-blue-300 rounded hover:bg-blue-50 mb-2 cursor-pointer"
                                onClick={() => openCellModal(row.id, 'action_content', resourceEdits[row.id]?.action_content || '')}
                              >
                                {renderCellContent(resourceEdits[row.id]?.action_content || '') || <span className="text-gray-400">Click to edit...</span>}
                              </div>
                              <div className="mt-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Trigger action on:
                                </label>
                                <select
                                  value={resourceEdits[row.id]?.action_trigger || ''}
                                  onChange={(e) => handleResourceChange(row.id, 'action_trigger', e.target.value || null)}
                                  className="w-full border rounded-md p-1 text-sm"
                                >
                                  <option value="">No trigger (always include in action plan)</option>
                                  <option value="yes">"Yes" answer</option>
                                  <option value="no">"No" answer</option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="text-sm cursor-pointer hover:text-indigo-600 min-h-[40px]"
                              onClick={() => openCellModal(row.id, 'action_content', getResourceTitle('action', row.action_id))}
                            >
                              {renderCellContent(getResourceTitle('action', row.action_id))}
                              {row.action_id && row.action_trigger && (
                                <div className="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                                  Trigger on: {row.action_trigger === 'yes' ? 'Yes' : 'No'}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Terminate cell */}
                        <td className="px-2 py-1 border border-gray-300">
                          {isEditing[row.id] ? (
                            <div className="p-1">
                              <div 
                                className="w-full text-left bg-white p-2 border border-blue-300 rounded hover:bg-blue-50 cursor-pointer"
                                onClick={() => openCellModal(row.id, 'terminate_content', resourceEdits[row.id]?.terminate_content || '')}
                              >
                                {renderCellContent(resourceEdits[row.id]?.terminate_content || '') || <span className="text-gray-400">Click to edit...</span>}
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="text-sm cursor-pointer hover:text-indigo-600 min-h-[40px]"
                              onClick={() => openCellModal(row.id, 'terminate_content', getResourceTitle('terminate', row.terminate_id))}
                            >
                              {renderCellContent(getResourceTitle('terminate', row.terminate_id))}
                            </div>
                          )}
                        </td>

                        {/* Save button cell - only visible when editing */}
                        {isEditing[row.id] && (
                          <td className="px-2 py-1 border border-gray-300 bg-blue-50">
                            <button
                              onClick={() => handleSaveRow(row.id)}
                              className="bg-green-600 text-white px-2 py-1 rounded-md text-xs hover:bg-green-700 w-full"
                            >
                              Save
                            </button>
                          </td>
                        )}
                      </tr>
                  </React.Fragment>
                ))}
                
                {/* Add insert at end button after all rows */}
                {(rows.length === 0 || insertIndex === rows.length) && (
                  <>
                    {!showInsertForm && (
                      <tr className="bg-blue-50">
                        <td colSpan={10} className="px-2 py-1 border border-blue-100 text-center">
                          <button
                            className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-indigo-200 inline-flex items-center"
                            onClick={() => {
                              setShowInsertForm(true);
                              // Focus on the input field after rendering
                              setTimeout(() => {
                                const element = document.getElementById('insert-form-end');
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }
                              }, 100);
                            }}
                          >
                            <Plus size={14} className="mr-1" /> Insert new question here
                          </button>
                        </td>
                      </tr>
                    )}
                    
                    {showInsertForm && (
                      <tr className="bg-blue-50" id="insert-form-end">
                        <td colSpan={10} className="px-2 py-2 border border-gray-300">
                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={newQuestionText}
                              onChange={(e) => setNewQuestionText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleInsertQuestion(rows.length);
                                }
                              }}
                              placeholder="Enter new question text"
                              className="border border-gray-300 p-2 rounded-md flex-grow text-sm"
                              autoFocus
                            />
                            <button
                              onClick={() => handleInsertQuestion(rows.length)}
                              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
                            >
                              Insert
                            </button>
                            <button
                              onClick={() => {
                                setShowInsertForm(false);
                                setNewQuestionText('');
                              }}
                              className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => {
            setInsertIndex(rows.length);
            setShowInsertForm(false);
          }}
          className="text-indigo-600 hover:text-indigo-800 flex items-center text-sm"
        >
          <Plus size={16} className="mr-1" /> Insert at end
        </button>
        <button
          onClick={handleAddRow}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center"
        >
          <Plus size={18} className="mr-1" /> Add Question
        </button>
      </div>
      
      {hasChanges && Object.values(hasChanges).some(Boolean) && (
        <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-200 flex items-center">
          <AlertCircle size={18} className="text-amber-500 mr-2" />
          <span className="text-amber-700 text-sm">
            You have unsaved changes. Press Enter to save or wait for auto-save (every minute).
          </span>
        </div>
      )}
      
      {lastSaved && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* Rich Text Editor Modal */}
      {showCellModal && (
        <Modal
          isOpen={showCellModal}
          onClose={() => setShowCellModal(false)}
          title="Edit Content"
        >
          <div className="mb-4">
            <Suspense fallback={<EditorLoading />}>
              <RichTextEditor
                value={currentCellContent}
                onChange={setCurrentCellContent}
                minHeight={300}
                placeholder="Enter content..."
                onKeyDown={(e) => {
                  // Handle Enter key (without shift)
                  if (e.key === 'Enter' && !e.shiftKey) {
                    // The ReactQuillEditor component has already updated the value
                    // and prevented default behavior, so we just need to save
                    handleSaveAndCloseModal();
                  }
                }}
              />
            </Suspense>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowCellModal(false)}
              className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAndCloseModal}
              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Yes/No Leads To Modal */}
      {directEditCell && (
        <Modal
          isOpen={Boolean(directEditCell)}
          onClose={() => setDirectEditCell(null)}
          title={`Edit ${directEditCell.field === 'yes_leads_to' ? 'Yes' : 'No'} Leads To`}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select question to link to:
            </label>
            <select
              value={rows.find(r => r.id === directEditCell.rowId)?.[directEditCell.field] || ''}
              onChange={(e) => {
                handleCellChange(directEditCell.rowId, directEditCell.field, e.target.value || undefined);
              }}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            >
              <option value="">- None -</option>
              {questions
                .filter(q => q.id !== directEditCell.rowId)
                .map(q => (
                  <option key={q.id} value={q.id}>
                    Question {q.order_position + 1}
                  </option>
                ))
              }
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setDirectEditCell(null)}
              className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (directEditCell) {
                  handleSaveRow(directEditCell.rowId);
                  setDirectEditCell(null);
                }
              }}
              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteConfirmId(null);
        }}
        title="Confirm Deletion"
      >
        <div className="mb-4">
          <p className="text-sm text-gray-500">
            Are you sure you want to delete this question? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteConfirmId(null);
            }}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => deleteConfirmId && handleDeleteRow(deleteConfirmId)}
            className="bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </Modal>
      
      {/* Notepad Component */}
      {showNotepad && (
        <Notepad 
          surveyId={surveyId}
          onClose={() => setShowNotepad(false)}
        />
      )}
    </div>
  );
};

export default SpreadsheetEditor;