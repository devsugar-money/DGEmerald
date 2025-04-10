import React, { useEffect, useState, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../store/surveyStore';
import { useAuthStore } from '../store/authStore';
import { Plus, Edit, Table } from '../components/IconProvider';
import Modal from '../components/Modal';

// Lazy load SpreadsheetEditor which is a heavy component
const SpreadsheetEditor = lazy(() => import('../components/SpreadsheetEditor'));

// Loading component
const SpreadsheetLoading = () => (
  <div className="p-8 flex justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

const SurveyEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { 
    currentSurvey, fetchSurveyDetails, updateSurvey, fetchResources,
  } = useSurveyStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  // State for modals and forms
  const [editSurveyName, setEditSurveyName] = useState('');
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
  
  // Set edit survey name when survey loads
  useEffect(() => {
    if (currentSurvey) {
      setEditSurveyName(currentSurvey.name);
    }
  }, [currentSurvey]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Load data
  useEffect(() => {
    if (!id) return;
    
    fetchSurveyDetails(id);
    fetchResources();
  }, [id, fetchSurveyDetails, fetchResources]);

  // Handle survey name update
  const handleUpdateSurveyName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editSurveyName.trim()) return;
    
    updateSurvey(id, editSurveyName);
    setIsEditNameModalOpen(false);
  };

  if (!currentSurvey) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 px-4 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-2xl font-bold">{currentSurvey.name}</h1>
          <button
            onClick={() => setIsEditNameModalOpen(true)}
            className="text-indigo-600 text-sm hover:underline"
          >
            Edit Survey Name
          </button>
        </div>
        <div className="flex items-center">
          <div className="flex items-center text-gray-700 font-medium">
            <Table size={20} className="mr-2 text-indigo-600" /> 
            Spreadsheet Editor
          </div>
        </div>
      </div>

      <div>
        <Suspense fallback={<SpreadsheetLoading />}>
          <SpreadsheetEditor surveyId={id || ''} />
        </Suspense>
      </div>

      {/* Edit Survey Name Modal */}
      <Modal
        isOpen={isEditNameModalOpen}
        onClose={() => setIsEditNameModalOpen(false)}
        title="Edit Survey Name"
      >
        <form onSubmit={handleUpdateSurveyName}>
          <div className="mb-4">
            <label htmlFor="surveyName" className="block text-sm font-medium text-gray-700 mb-1">
              Survey Name
            </label>
            <input
              type="text"
              id="surveyName"
              value={editSurveyName}
              onChange={(e) => setEditSurveyName(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsEditNameModalOpen(false)}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SurveyEditor;