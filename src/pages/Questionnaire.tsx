import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSurveyStore } from '../store/surveyStore';
import { PiggyBank, TrendingUp, Home, CreditCard, Shield, Wallet, ScanEye, BadgeDollarSign } from 'lucide-react';

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

  const getIconForSurvey = (name: string) => {
    const normalizedName = name.toLowerCase();
    const icons: Record<string, JSX.Element> = {
      'retirement': <PiggyBank className="w-12 h-12 text-green-500" strokeWidth={1.5} />,
      'invest': <TrendingUp className="w-12 h-12 text-blue-500" strokeWidth={1.5} />,
      'mortgage': <Home className="w-12 h-12 text-blue-400" strokeWidth={1.5} />,
      'debt': <CreditCard className="w-12 h-12 text-blue-400" strokeWidth={1.5} />,
      'insurance': <Shield className="w-12 h-12 text-blue-500" strokeWidth={1.5} />,
      'savings': <Wallet className="w-12 h-12 text-red-300" strokeWidth={1.5} />,
      'survey': <ScanEye className="w-12 h-12 text-red-300" strokeWidth={1.5} />,
      'payment': <BadgeDollarSign className="w-12 h-12 text-red-300" strokeWidth={1.5} />,

    };
    
    // Find the first matching icon key in the survey name
    const matchingKey = Object.keys(icons).find(key => normalizedName.includes(key));
    return matchingKey ? icons[matchingKey] : <PiggyBank className="w-12 h-12 text-gray-400" strokeWidth={1.5} />;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center ">
      <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
        What do you want to know?
      </h1>
      <p className="text-center text-gray-600 mb-8">Click to use DecideGuide demo</p>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {surveys.length > 0 ? (
            surveys.map((survey) => (
              <div 
                key={survey.id}
                onClick={() => handleSurveyClick(survey.id)}
                className="border border-gray-400 max-w-[270px] p-6 cursor-pointer shadow-lg transition-shadow bg-white flex flex-col items-center text-center"
              >
                <div className="mb-8 flex justify-center items-center w-[5.6rem] h-[5.6rem] rounded-full bg-gray-200">
                  {getIconForSurvey(survey.name)}
                </div>
                <h2 className="text-gray-800 text-lg">
                  {survey.name}
                </h2>
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
