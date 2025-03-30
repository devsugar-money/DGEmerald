import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../store/surveyStore';
import { useAuthStore } from '../store/authStore';

const SurveyBuilder = () => {
  const [surveyName, setSurveyName] = useState('');
  const [firstQuestion, setFirstQuestion] = useState('');
  const { createSurvey, createQuestion } = useSurveyStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!surveyName.trim() || !firstQuestion.trim()) return;
    
    try {
      // Create survey
      const survey = await createSurvey(surveyName);
      
      // Create first question
      await createQuestion(survey.id, firstQuestion, 0);
      
      // Navigate to the survey editor
      navigate(`/survey-editor/${survey.id}`);
    } catch (error) {
      console.error('Error creating survey:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Survey</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="surveyName" className="block text-sm font-medium text-gray-700 mb-1">
              Survey Name
            </label>
            <input
              type="text"
              id="surveyName"
              value={surveyName}
              onChange={(e) => setSurveyName(e.target.value)}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter a descriptive name for your survey"
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="firstQuestion" className="block text-sm font-medium text-gray-700 mb-1">
              First Question
            </label>
            <textarea
              id="firstQuestion"
              value={firstQuestion}
              onChange={(e) => setFirstQuestion(e.target.value)}
              rows={3}
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter the first question of your survey"
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Survey
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyBuilder;