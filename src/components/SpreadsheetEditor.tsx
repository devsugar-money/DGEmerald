import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useSurveyStore } from '../store/surveyStore';
import { Plus, ChevronDown, ArrowUpDown, CheckCircle, Trash2, FileText } from '../components/IconProvider';
import Modal from './Modal';
import Notepad from './Notepad';
import { ExtendedQuestion } from '../types/question';
import ResourceSelector from './ResourceSelector'; // We'll reuse this inside a modal

// Lazy load RichTextEditor
const RichTextEditor = lazy(() => import('./RichTextEditor'));
const EditorLoading = () => (
  <div className="min-h-[150px] bg-gray-50 animate-pulse rounded"></div>
);

declare global {
  interface Window {
    _lastTerminateContent?: string;
  }
}

type QuestionType = ExtendedQuestion;

interface SpreadsheetEditorProps {
  surveyId: string;
}

/**
 * Utility: strip HTML tags and shorten for previews
 */
function getPlainTextPreview(html: string | null | undefined, maxLength = 40): string {
  if (!html) return '';
  const stripped = html.replace(/<[^>]+>/g, '');
  return stripped.length > maxLength ? stripped.substring(0, maxLength) + '...' : stripped;
}

const SpreadsheetEditor: React.FC<SpreadsheetEditorProps> = ({ surveyId }) => {
  const {
    questions,
    updateQuestion,
    updateQuestionOrder,
    deleteQuestion,
    hintTitles,
    hintContents,
    learnTitles,
    learnContents,
    actions,
    terminates,
    createQuestion,
    createAction,
    createTerminate,
  } = useSurveyStore((state) => ({
    questions: state.questions,
    updateQuestion: state.updateQuestion,
    updateQuestionOrder: state.updateQuestionOrder,
    deleteQuestion: state.deleteQuestion,
    hintTitles: state.hintTitles,
    hintContents: state.hintContents,
    learnTitles: state.learnTitles,
    learnContents: state.learnContents,
    actions: state.actions,
    terminates: state.terminates,
    createQuestion: state.createQuestion,
    createAction: state.createAction,
    createTerminate: state.createTerminate,
  }));

  const [rows, setRows] = useState<Array<any>>([]);
  const [insertIndex, setInsertIndex] = useState<number | null>(null);
  const [showInsertForm, setShowInsertForm] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Cell edit modals (for question text, action content, terminate content)
  const [showCellModal, setShowCellModal] = useState(false);
  const [currentCellContent, setCurrentCellContent] = useState('');
  const [currentCellField, setCurrentCellField] = useState('');
  const [currentRowId, setCurrentRowId] = useState('');
  const [currentModalContext, setCurrentModalContext] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Notepad
  const [showNotepad, setShowNotepad] = useState(false);

  // Resource Modal for hint/learn
  type ResourceModalType = 'hints_title' | 'hints_content' | 'learn_title' | 'learn_content';
  const [resourceModal, setResourceModal] = useState<{
    open: boolean;
    rowId: string;
    resourceType: ResourceModalType;
  } | null>(null);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);

  // Direct 'yes_leads_to' / 'no_leads_to' modal
  const [directEditCell, setDirectEditCell] = useState<{
    rowId: string;
    field: 'yes_leads_to' | 'no_leads_to';
  } | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────────
  const renderCellPreview = (html: string | null | undefined) => {
    const preview = getPlainTextPreview(html);
    return preview ? preview : <span className="text-gray-400">(None)</span>;
  };

  // Retrieve full content from the store for action
  const getActionContent = (row: any) => {
    if (!row.action_id) return '';
    const found = actions.find((a) => a.id === row.action_id);
    return found?.content || '';
  };

  // Retrieve full content from the store for terminate
  const getTerminateContent = (row: any) => {
    if (!row.terminate_id) return '';
    const found = terminates.find((t) => t.id === row.terminate_id);
    return found?.content || '';
  };

  const getQuestionIndexById = (id: string | null | undefined) => {
    if (!id) return '';
    const q = questions.find((qq) => qq.id === id);
    return q ? `${q.order_position + 1}` : '';
  };

  const getResourceTitlePreview = (type: 'hint' | 'learn', id: string | null) => {
    if (!id) return '';
    const arr = type === 'hint' ? hintTitles : learnTitles;
    const resource = arr.find((r) => r.id === id);
    if (!resource) return '';
    return getPlainTextPreview(resource.title || '');
  };

  const getResourceContentPreview = (type: 'hint' | 'learn', id: string | null) => {
    if (!id) return '';
    const arr = type === 'hint' ? hintContents : learnContents;
    const resource = arr.find((r) => r.id === id);
    if (!resource) return '';
    return getPlainTextPreview(resource.content || '');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Initial load
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (questions.length > 0) {
      const formattedRows = questions
        .sort((a, b) => a.order_position - b.order_position)
        .map((question) => ({
          id: question.id,
          text: question.text,
          order_position: question.order_position,
          yes_leads_to: question.yes_leads_to,
          no_leads_to: question.no_leads_to,
          hint_title_id: (question as QuestionType).hint_title_id || null,
          hint_content_id: (question as QuestionType).hint_content_id || null,
          learn_title_id: (question as QuestionType).learn_title_id || null,
          learn_content_id: (question as QuestionType).learn_content_id || null,
          action_id: question.action_id,
          action_trigger: question.action_trigger,
          terminate_id: question.terminate_id,
          terminate_trigger: question.terminate_trigger,
          hasupload: !!(question as QuestionType).hasupload,
        }));
      setRows(formattedRows);
    }
  }, [questions]);

  // Auto-save every 60 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      // Removed rowsWithChanges logic
    }, 60000);

    return () => clearInterval(autoSaveInterval);
  }, []);

  useEffect(() => {
    if (showSavedMessage) {
      const timer = setTimeout(() => setShowSavedMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedMessage]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Row insertion
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddRow = async () => {
    try {
      const newQ = await createQuestion(surveyId, '', rows.length);
      setRows([
        ...rows,
        {
          id: newQ.id,
          text: newQ.text,
          order_position: rows.length,
          yes_leads_to: null,
          no_leads_to: null,
          hint_title_id: null,
          hint_content_id: null,
          learn_title_id: null,
          learn_content_id: null,
          action_id: null,
          action_trigger: null,
          terminate_id: null,
          terminate_trigger: null,
          hasupload: false,
        },
      ]);
      window.scrollTo(0, document.body.scrollHeight);
    } catch (error) {
      console.error('Error adding new row:', error);
    }
  };

  const handleInsertQuestion = async (index: number) => {
    try {
      if (!newQuestionText.trim()) {
        alert('Please enter question text');
        return;
      }
      const isInsertingAtEnd = index === rows.length;
      const newQ = await createQuestion(surveyId, newQuestionText, isInsertingAtEnd ? rows.length : index);

      const updatedRows = [...rows];
      const newRowData = {
        id: newQ.id,
        text: newQ.text,
        order_position: index,
        yes_leads_to: null,
        no_leads_to: null,
        hint_title_id: null,
        hint_content_id: null,
        learn_title_id: null,
        learn_content_id: null,
        action_id: null,
        action_trigger: null,
        terminate_id: null,
        terminate_trigger: null,
        hasupload: false,
      };

      if (isInsertingAtEnd) {
        updatedRows.push({ ...newRowData, order_position: rows.length });
      } else {
        updatedRows.splice(index, 0, newRowData);
      }

      // Re-order positions
      const questionsWithOrder = updatedRows.map((q, i) => ({
        id: q.id,
        order_position: i,
      }));
      setRows(updatedRows);
      await updateQuestionOrder(questionsWithOrder);

      setNewQuestionText('');
      setShowInsertForm(false);
      setInsertIndex(null);

      if (isInsertingAtEnd) {
        window.scrollTo(0, document.body.scrollHeight);
      }
    } catch (error) {
      console.error('Error inserting question:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Cell changes
  // ─────────────────────────────────────────────────────────────────────────────
  const handleCellChange = (id: string, field: string, value: any) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
    // Immediately update the question in the store (Auto-save)
    updateQuestion(id, { [field]: value });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Delete row
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDeleteRow = async (id: string) => {
    try {
      await deleteQuestion(id);
      setRows((prev) => prev.filter((r) => r.id !== id));

      setShowDeleteConfirm(false);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting row:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Rich-text cell modal (question text, action_content, terminate_content)
  // ─────────────────────────────────────────────────────────────────────────────
  const openCellModal = (rowId: string, field: string, content: string, context: string) => {
    setCurrentRowId(rowId);
    setCurrentCellField(field);
    setCurrentCellContent(content);
    setCurrentModalContext(context);
    setShowCellModal(true);
  };

  const handleSaveAndCloseModal = async () => {
    try {
      const rowIdToSave = currentRowId;
      if (!rowIdToSave || !currentCellField) return;

      // Close the modal
      setShowCellModal(false);
      setCurrentRowId('');
      setCurrentCellField('');
      setCurrentCellContent('');
      setCurrentModalContext('');

      if (currentCellField === 'content') {
        // Determine if we're saving an action or terminate based on the modal context
        if (currentModalContext === 'action') {
          // Create new action in actions table
          const newAction = await createAction(currentCellContent);
          // Update question with new action ID
          await updateQuestion(rowIdToSave, {
            action_id: newAction.id,
            action_trigger: null
          });
        } else if (currentModalContext === 'terminate') {
          // Create new terminate in terminates table
          const newTerminate = await createTerminate(currentCellContent);
          // Update question with new terminate ID
          await updateQuestion(rowIdToSave, {
            terminate_id: newTerminate.id,
            terminate_trigger: null
          });
        }
      } else {
        // For other fields, update directly
        await updateQuestion(rowIdToSave, { [currentCellField]: currentCellContent });
      }
      
      setLastSaved(new Date());
      setShowSavedMessage(true);
    } catch (error) {
      console.error('Error saving cell content:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Yes/No leads to
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSaveRow = async (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (!row) return;

    try {
      // Prepare updates
      const updatesPayload: Record<string, any> = {
        text: row.text,
        yes_leads_to: row.yes_leads_to || null,
        no_leads_to: row.no_leads_to || null,
        hint_title_id: row.hint_title_id || null,
        hint_content_id: row.hint_content_id || null,
        learn_title_id: row.learn_title_id || null,
        learn_content_id: row.learn_content_id || null,
        action_id: row.action_id || null,
        action_trigger: row.action_trigger || null,
        terminate_id: row.terminate_id || null,
        terminate_trigger: row.terminate_trigger || null,
        hasupload: row.hasupload || false,
      };

      // If action_id or terminate_id is cleared, also clear triggers
      if (!updatesPayload.action_id) updatesPayload.action_trigger = null;
      if (!updatesPayload.terminate_id) updatesPayload.terminate_trigger = null;

      await updateQuestion(id, updatesPayload);

      setLastSaved(new Date());
      setShowSavedMessage(true);
    } catch (error) {
      console.error('Error saving question:', error);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Drag & drop
  // ─────────────────────────────────────────────────────────────────────────────
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    const items: any[] = Array.from(rows);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedQs = items.map((it, i) => ({ id: it.id, order_position: i }));
    setRows(
      items.map((it, i) => ({
        ...it,
        order_position: i,
      }))
    );
    try {
      await updateQuestionOrder(updatedQs);
    } catch (error) {
      console.error('Error updating question order:', error);
    }
  };

  const handleRowDragStart = (e: React.DragEvent<HTMLTableRowElement>, index: number) => {
    e.dataTransfer.setData('text/plain', rows[index].id);
    e.dataTransfer.effectAllowed = 'move';
    e.currentTarget.classList.add('opacity-50');
  };
  const handleRowDragOver = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleRowDrop = (e: React.DragEvent<HTMLTableRowElement>, targetIndex: number) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const sourceIndex = rows.findIndex((row) => row.id === id);
    if (sourceIndex !== targetIndex) {
      handleDragEnd({
        source: { index: sourceIndex },
        destination: { index: targetIndex },
      });
    }
  };
  const handleRowDragEnd = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Resource Modal for hint/learn columns
  // ─────────────────────────────────────────────────────────────────────────────
  const openResourceModal = (rowId: string, resourceType: ResourceModalType) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    let currentId: string | null = null;
    if (resourceType === 'hints_title') currentId = row.hint_title_id;
    if (resourceType === 'hints_content') currentId = row.hint_content_id;
    if (resourceType === 'learn_title') currentId = row.learn_title_id;
    if (resourceType === 'learn_content') currentId = row.learn_content_id;

    setSelectedResourceId(currentId || null);
    setResourceModal({ open: true, rowId, resourceType });
  };

  const closeResourceModal = () => {
    setResourceModal(null);
    setSelectedResourceId(null);
  };

  const handleConfirmResourceModal = async () => {
    if (!resourceModal) return;
    const { rowId, resourceType } = resourceModal;
    const row = rows.find((r) => r.id === rowId);
    if (!row) {
      closeResourceModal();
      return;
    }

    const updateFields: Record<string, string | null> = {};

    if (resourceType === 'hints_title') updateFields.hint_title_id = selectedResourceId || null;
    if (resourceType === 'hints_content') updateFields.hint_content_id = selectedResourceId || null;
    if (resourceType === 'learn_title') updateFields.learn_title_id = selectedResourceId || null;
    if (resourceType === 'learn_content') updateFields.learn_content_id = selectedResourceId || null;

    try {
      // Update local rows
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          return { ...r, ...updateFields };
        })
      );
      // Update DB
      await updateQuestion(rowId, updateFields);

      setLastSaved(new Date());
      setShowSavedMessage(true);
    } catch (err) {
      console.error('Error updating resource field:', err);
    }

    closeResourceModal();
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Main return
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="overflow-x-auto w-full">
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

      <div className="border border-gray-300 rounded-lg overflow-hidden w-full">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto w-full">
          <table className="w-full divide-y divide-gray-200 border-collapse">
            <thead className="bg-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-10">
                  #
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-24">
                  <div className="flex items-center">
                    QUESTION <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-16">
                  <div className="flex flex-col items-center">
                    YES <span className="text-[10px]">ANSWER</span>
                  </div>
                </th>
                <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-16">
                  <div className="flex flex-col items-center">
                    NO <span className="text-[10px]">ANSWER</span>
                  </div>
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-24">
                  <div className="flex items-center">
                    HINT TITLE <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-24">
                  <div className="flex items-center">
                    HINT CONTENT <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-24">
                  <div className="flex items-center">
                    LEARN TITLE <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-24">
                  <div className="flex items-center">
                    LEARN CONTENT <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-24">
                  <div className="flex items-center">
                    ACTION <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-1 text-left text-xs font-medium uppercase tracking-wider border border-blue-700 w-24">
                  <div className="flex items-center">
                    ANSWER TERMINATE <ChevronDown size={14} className="ml-1" />
                  </div>
                </th>
                <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-20">
                  ACTION TRIGGER
                </th>
                <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-20">
                  TERM. TRIGGER
                </th>
                <th className="px-2 py-1 text-center text-xs font-medium uppercase tracking-wider border border-blue-700 w-16">
                  UPLOAD?
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Insert button above first row if needed */}
              {!showInsertForm && insertIndex === 0 && (
                <tr className="bg-blue-50">
                  <td colSpan={14} className="px-2 py-1 border border-blue-100 text-center">
                    <button
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-indigo-200 inline-flex items-center"
                      onClick={() => {
                        setShowInsertForm(true);
                        setTimeout(() => {
                          document.getElementById(`insert-form-0`)?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                    >
                      <Plus size={14} className="mr-1" /> Insert new question here
                    </button>
                  </td>
                </tr>
              )}

              {rows.map((row, index) => (
                <React.Fragment key={row.id}>
                  {/* Insert row between existing rows */}
                  {!showInsertForm && insertIndex === index && (
                    <tr className="bg-blue-50">
                      <td colSpan={14} className="px-2 py-1 border border-blue-100 text-center">
                        <button
                          className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-indigo-200 inline-flex items-center"
                          onClick={() => {
                            setShowInsertForm(true);
                            setTimeout(() => {
                              document
                                .getElementById(`insert-form-${index}`)
                                ?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                        >
                          <Plus size={14} className="mr-1" /> Insert new question here
                        </button>
                      </td>
                    </tr>
                  )}

                  {/* Insert form row */}
                  {showInsertForm && insertIndex === index && (
                    <tr className="bg-blue-50" id={`insert-form-${index}`}>
                      <td colSpan={14} className="px-2 py-2 border border-gray-300">
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

                  {/* Main question row */}
                  <tr
                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} transition-colors text-xs`}
                    style={{ height: '30px' }} /* Force reduced row height */
                    draggable={true}
                    onDragStart={(e) => handleRowDragStart(e, index)}
                    onDragOver={handleRowDragOver}
                    onDrop={(e) => handleRowDrop(e, index)}
                    onDragEnd={handleRowDragEnd}
                    data-id={row.id}
                    data-index={index}
                  >
                    {/* ORDER # */}
                    <td className="px-2 py-0.5 text-center border border-gray-300 w-10 leading-tight">
                      <div className="flex items-center justify-center cursor-move">
                        <span className="font-mono text-xs text-gray-500 mr-1">{index + 1}</span>
                        <ArrowUpDown size={14} className="text-gray-500" />
                      </div>
                    </td>

                    {/* QUESTION TEXT (click to open modal) */}
                    <td className="px-2 py-0.5 whitespace-normal border border-gray-300 w-24 leading-tight">
                      <div className="flex">
                        <div
                          className="text-sm cursor-pointer hover:text-indigo-600 flex-grow overflow-hidden whitespace-nowrap text-ellipsis"
                          onClick={() => openCellModal(row.id, 'text', row.text, '')}
                        >
                          {renderCellPreview(row.text)}
                        </div>
                        <div className="flex flex-shrink-0">
                          {/* Insert button */}
                          <button
                            className="text-indigo-400 hover:text-indigo-600 p-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (insertIndex === index) setInsertIndex(null);
                              else {
                                setInsertIndex(index);
                                setShowInsertForm(false);
                              }
                            }}
                            title="Insert question here"
                          >
                            <Plus size={14} />
                          </button>
                          {/* Delete button */}
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
                    </td>

                    {/* YES LEADS TO */}
                    <td
                      className="px-2 py-0.5 text-center border border-gray-300 w-16 cursor-pointer leading-tight"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDirectEditCell({ rowId: row.id, field: 'yes_leads_to' });
                      }}
                    >
                      <div className="text-sm text-center hover:text-indigo-600 font-medium">
                        {getQuestionIndexById(row.yes_leads_to)}
                      </div>
                    </td>

                    {/* NO LEADS TO */}
                    <td
                      className="px-2 py-0.5 text-center border border-gray-300 w-16 cursor-pointer leading-tight"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDirectEditCell({ rowId: row.id, field: 'no_leads_to' });
                      }}
                    >
                      <div className="text-sm text-center hover:text-indigo-600 font-medium">
                        {getQuestionIndexById(row.no_leads_to)}
                      </div>
                    </td>

                    {/* HINT TITLE (open resource modal) */}
                    <td
                      className="px-2 py-0.5 border border-gray-300 w-24 cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis leading-tight"
                      onClick={() => openResourceModal(row.id, 'hints_title')}
                      title="Click to select a hint title"
                    >
                      {renderCellPreview(getResourceTitlePreview('hint', row.hint_title_id))}
                    </td>

                    {/* HINT CONTENT (open resource modal) */}
                    <td
                      className="px-2 py-0.5 border border-gray-300 w-24 cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis leading-tight"
                      onClick={() => openResourceModal(row.id, 'hints_content')}
                      title="Click to select a hint content"
                    >
                      {renderCellPreview(getResourceContentPreview('hint', row.hint_content_id))}
                    </td>

                    {/* LEARN TITLE (open resource modal) */}
                    <td
                      className="px-2 py-0.5 border border-gray-300 w-24 cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis leading-tight"
                      onClick={() => openResourceModal(row.id, 'learn_title')}
                      title="Click to select a learn title"
                    >
                      {renderCellPreview(getResourceTitlePreview('learn', row.learn_title_id))}
                    </td>

                    {/* LEARN CONTENT (open resource modal) */}
                    <td
                      className="px-2 py-0.5 border border-gray-300 w-24 cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis leading-tight"
                      onClick={() => openResourceModal(row.id, 'learn_content')}
                      title="Click to select a learn content"
                    >
                      {renderCellPreview(getResourceContentPreview('learn', row.learn_content_id))}
                    </td>

                    {/* ACTION (click to open modal) */}
                    <td className="px-2 py-0.5 border border-gray-300 w-24 leading-tight">
                      <button
                        className="text-sm text-indigo-600 hover:underline flex items-center gap-1 p-1 rounded hover:bg-indigo-50"
                        onClick={async () => {
                          try {
                            const content = getActionContent(row);
                            // If content exists, create a new action
                            if (content) {
                              const newAction = await createAction(content);
                              // Update the question with the new action ID
                              await updateQuestion(row.id, { 
                                action_id: newAction.id,
                                action_trigger: null // Reset trigger when updating action
                              });
                            }
                            // Open modal to edit the content
                            openCellModal(row.id, 'content', content || '', 'action');
                          } catch (error) {
                            console.error('Error handling action:', error);
                          }
                        }}
                        title="Edit Action Content"
                      >
                        <FileText size={14} />
                        {getActionContent(row) ? 'View/Edit' : 'Set'}
                      </button>
                    </td>

                    {/* ANSWER TERMINATE (click to open modal) */}
                    <td className="px-2 py-0.5 border border-gray-300 w-24 leading-tight">
                      <button
                        className="text-sm text-indigo-600 hover:underline flex items-center gap-1 p-1 rounded hover:bg-indigo-50"
                        onClick={async () => {
                          try {
                            const content = getTerminateContent(row);
                            // If content exists, create a new terminate
                            if (content) {
                              const newTerminate = await createTerminate(content);
                              // Update the question with the new terminate ID
                              await updateQuestion(row.id, { 
                                terminate_id: newTerminate.id,
                                terminate_trigger: null // Reset trigger when updating terminate
                              });
                            }
                            // Open modal to edit the content
                            openCellModal(row.id, 'content', content || '', 'terminate');
                          } catch (error) {
                            console.error('Error handling terminate:', error);
                          }
                        }}
                        title="Edit Terminate Content"
                      >
                        <FileText size={14} />
                        {getTerminateContent(row) ? 'View/Edit' : 'Set'}
                      </button>
                    </td>

                    {/* ACTION TRIGGER */}
                    <td className="px-2 py-0.5 border border-gray-300 w-20 leading-tight">
                      <select
                        value={row.action_trigger || ''}
                        onChange={(e) =>
                          handleCellChange(row.id, 'action_trigger', e.target.value || null)
                        }
                        onClick={(e) => e.stopPropagation()} // Prevent row click logic if any
                        className="w-full border-gray-300 rounded-md shadow-sm p-1 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                        title="Select when the Action content is shown"
                      >
                        <option value="">Always</option>
                        <option value="yes">On Yes</option>
                        <option value="no">On No</option>
                      </select>
                    </td>

                    {/* TERMINATE TRIGGER */}
                    <td className="px-2 py-0.5 border border-gray-300 w-20 leading-tight">
                      <select
                        value={row.terminate_trigger || ''}
                        onChange={(e) =>
                          handleCellChange(row.id, 'terminate_trigger', e.target.value || null)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-full border-gray-300 rounded-md shadow-sm p-1 text-xs focus:ring-indigo-500 focus:border-indigo-500"
                        title="Select when the Terminate content is shown"
                      >
                        <option value="">Never</option> {/* Default should be no trigger */}
                        <option value="yes">On Yes</option>
                        <option value="no">On No</option>
                      </select>
                    </td>

                    {/* HAS UPLOAD */}
                    <td className="px-2 py-0.5 border border-gray-300 w-16 leading-tight text-center">
                      <input
                        type="checkbox"
                        checked={row.hasupload || false}
                        onChange={(e) => handleCellChange(row.id, 'hasupload', e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        title="Does answering this question require a file upload?"
                      />
                    </td>
                  </tr>
                </React.Fragment>
              ))}

              {/* Insert at end */}
              {(rows.length === 0 || insertIndex === rows.length) && (
                <>
                  {!showInsertForm && (
                    <tr className="bg-blue-50">
                      <td colSpan={14} className="px-2 py-1 border border-blue-100 text-center">
                        <button
                          className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-medium hover:bg-indigo-200 inline-flex items-center"
                          onClick={() => {
                            setShowInsertForm(true);
                            setInsertIndex(rows.length);
                            setTimeout(() => {
                              document
                                .getElementById('insert-form-end')
                                ?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                        >
                          <Plus size={14} className="mr-1" /> Insert new question here
                        </button>
                      </td>
                    </tr>
                  )}
                  {showInsertForm && insertIndex === rows.length && (
                    <tr className="bg-blue-50" id="insert-form-end">
                      <td colSpan={14} className="px-2 py-2 border border-gray-300">
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

      {/* Insert at end button + Add Question button below table */}
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

      {/* Unsaved changes warning */}
      {/* Removed unsaved changes warning */}

      {lastSaved && (
        <div className="mt-2 text-xs text-gray-500 text-right">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}

      {/* RichTextEditor Modal */}
      {showCellModal && (
        <Modal
          isOpen={showCellModal}
          onClose={() => setShowCellModal(false)}
          title={`Edit ${currentCellField.replace(/_/g, ' ')}`}
        >
          <div className="mb-4 min-h-[200px]">
            <Suspense fallback={<EditorLoading />}>
              <RichTextEditor
                value={currentCellContent}
                onChange={setCurrentCellContent}
                placeholder={`Enter ${currentCellField.replace(/_/g, ' ')}...`}
                onKeyDown={(e) => {
                  // Ctrl/Cmd+S => Save
                  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                    e.preventDefault();
                    handleSaveAndCloseModal();
                  }
                  // Escape => Cancel
                  if (e.key === 'Escape') {
                    setShowCellModal(false);
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

      {/* Modal for Yes/No leads to quick edit */}
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
              value={rows.find((r) => r.id === directEditCell.rowId)?.[directEditCell.field] || ''}
              onChange={(e) => {
                handleCellChange(directEditCell.rowId, directEditCell.field, e.target.value || null);
              }}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            >
              <option value="">- None -</option>
              {questions
                .filter((q) => q.id !== directEditCell.rowId)
                .map((q) => (
                  <option key={q.id} value={q.id}>
                    Question {q.order_position + 1}
                  </option>
                ))}
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

      {/* Delete Confirmation */}
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

      {/* Notepad */}
      {showNotepad && <Notepad surveyId={surveyId} onClose={() => setShowNotepad(false)} />}

      {/* Resource Modal for hints/learn */}
      {resourceModal && (
        <Modal
          isOpen={resourceModal.open}
          onClose={closeResourceModal}
          title={`Select ${resourceModal.resourceType.replace('_', ' ')}`}
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Search or select an existing resource from the list below:
            </p>
            <ResourceSelector
              resourceType={resourceModal.resourceType}
              currentValue={selectedResourceId}
              onSelect={(resource) => {
                setSelectedResourceId(resource.id);
              }}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={closeResourceModal}
              className="bg-gray-500 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmResourceModal}
              className="bg-green-600 text-white px-3 py-2 rounded-md text-sm hover:bg-green-700"
            >
              Confirm
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SpreadsheetEditor;
