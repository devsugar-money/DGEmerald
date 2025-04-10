import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSurveyStore } from '../store/surveyStore';


const Questionnaire: React.FC = () => {
  const { user } = useAuthStore();
  const { surveys, fetchSurveys, loading } = useSurveyStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchSurveys();
  }, [user, fetchSurveys, navigate]);

  const handleSurveyClick = (surveyId: string) => {
    navigate(`/survey/${surveyId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        What do you want to know?
      </h1>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {surveys.length > 0 ? (
            surveys.map((survey) => (
              <div 
                key={survey.id}
                onClick={() => handleSurveyClick(survey.id)}
                className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {survey.name}
                  </h2>
                  <div className="mt-4 text-right">
                    <button className="text-indigo-600 font-medium hover:text-indigo-800">
                      Start →
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No questionnaires available at the moment.</p>
            </div>
          )}
        </div>
      )}


      <footer className="mt-24 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p className="max-w-3xl mx-auto">
          Disclaimer: Each person's financial obligations, goals, needs, and circumstances are unique. 
          This tool is designed to provide general guidance based on your inputs, not personalized financial advice.
        </p>
      </footer>
    </div>
  );
};

export default Questionnaire;
