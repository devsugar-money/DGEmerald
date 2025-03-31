import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';
import { supabase } from '../lib/supabase';
import { HelpCircle, BookOpen, RotateCcw, Trees } from '../components/IconProvider';
import Modal from '../components/Modal';

const TakeSurvey = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { 
    activeSurvey, currentQuestion, progress, responses, questions,
    startSurvey, answerQuestion, resetSurvey, navigateToQuestion,
    actionPlan, terminateMessage, loading, error
  } = useSessionStore();
  const navigate = useNavigate();
  
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const [hintContent, setHintContent] = useState<{ title: string; content: string } | null>(null);
  const [learnContent, setLearnContent] = useState<{ title: string; content: string } | null>(null);
  
  // Find the current question with its full data in the questions array
  const currentQuestionWithData = currentQuestion ? 
    questions.find(q => q.id === currentQuestion.id) : null;
  
  useEffect(() => {
    if (!id) return;
    if (!user) {
      navigate('/login', { state: { redirectTo: `/survey/${id}` } });
      return;
    }
    
    startSurvey(id);
  }, [id, user, startSurvey, navigate]);
  
  useEffect(() => {
    // If we have actionPlan, navigate to action-plan page
    if (actionPlan.length > 0 || terminateMessage) {
      navigate('/action-plan', {
        state: {
          actionPlan,
          terminateMessage,
          surveyName: activeSurvey?.name || 'Survey'
        }
      });
    }
  }, [actionPlan, terminateMessage, navigate, activeSurvey]);
  
  const handleAnswer = (answer: boolean) => {
    if (!currentQuestion) return;
    answerQuestion(currentQuestion.id, answer);
  };
  
  const handleShowHint = async () => {
    if (!currentQuestion || !currentQuestion.hint_id) return;
    
    try {
      const { data, error } = await supabase
        .from('hints')
        .select('*')
        .eq('id', currentQuestion.hint_id)
        .single();
      
      if (error) throw error;
      
      setHintContent(data);
      setIsHintModalOpen(true);
    } catch (error) {
      console.error('Error fetching hint:', error);
    }
  };
  
  const handleShowLearn = async () => {
    if (!currentQuestion || !currentQuestion.learn_id) return;
    
    try {
      const { data, error } = await supabase
        .from('learns')
        .select('*')
        .eq('id', currentQuestion.learn_id)
        .single();
      
      if (error) throw error;
      
      setLearnContent(data);
      setIsLearnModalOpen(true);
    } catch (error) {
      console.error('Error fetching learn content:', error);
    }
  };
  
  if (loading && !currentQuestion) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }
  
  if (!currentQuestion || !activeSurvey) {
    return null;
  }

  // Find hint title from the currently loaded question data
  const getHintTitle = () => {
    if (!currentQuestionWithData || !currentQuestionWithData.hint_id) return '';
    
    // Look for hint in the currentQuestionWithData.hint property
    // This property might be populated depending on how the data is fetched
    if (currentQuestionWithData.hint && typeof currentQuestionWithData.hint === 'object') {
      return (currentQuestionWithData.hint as any).title || '';
    }
    
    // If no hint found in the current question data, check if we already loaded it
    if (hintContent?.title) {
      return hintContent.title;
    }
    
    // Default to empty string instead of placeholder text
    return '';
  };
  
  // Find learn title from the currently loaded question data
  const getLearnTitle = () => {
    if (!currentQuestionWithData || !currentQuestionWithData.learn_id) return '';
    
    if (currentQuestionWithData.learn && typeof currentQuestionWithData.learn === 'object') {
      return (currentQuestionWithData.learn as any).title || '';
    }
    
    if (learnContent?.title) {
      return learnContent.title;
    }
    
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 relative">
      {/* Header with Logo */}
      <div className="flex items-center mb-6">
        <div className="mr-2">
          <Trees className="h-10 w-10 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-primary-800">DecideGuide</h1>
      </div>
      
      {/* Survey Title */}
      <div className="text-center mb-6">
        <p className="text-xl text-gray-600 italic">
          {activeSurvey.name}
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-6 max-w-2xl mx-auto">
        <div className="h-2 bg-gray-300 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-600 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Main Content with Learn Button */}
      <div className="relative max-w-2xl mx-auto">
        {/* Question Box (Less Wide) */}
        <div className="bg-white rounded-card shadow-card p-6 md:p-8 mb-6 min-h-[calc(100%*1.93)] flex flex-col">
          <h2 className="text-xl md:text-2xl font-medium text-primary-700 mb-6 md:mb-8">
            {currentQuestion.text}
          </h2>
          
          {/* Answer buttons with fully rounded corners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            <button
              onClick={() => handleAnswer(true)}
              className="bg-primary-600 text-white text-lg md:text-xl py-3 px-4 rounded-full hover:bg-primary-700 transition-colors"
            >
              Yes
            </button>
            
            <button
              onClick={() => handleAnswer(false)}
              className="bg-gray-600 text-white text-lg md:text-xl py-3 px-4 rounded-full hover:bg-gray-700 transition-colors"
            >
              No
            </button>
          </div>
        </div>
        
        {/* Learn Button (Positioned to the right) */}
        {currentQuestion.learn_id && (
          <div className="absolute top-0 right-0 translate-x-[calc(100%+24px)] hidden md:block">
            <button
              onClick={handleShowLearn}
              className="bg-white border border-gray-300 text-tertiary-700 rounded-full py-3 px-4 hover:bg-gray-50 transition-colors flex items-center shadow-sm whitespace-nowrap"
            >
              <BookOpen className="h-5 w-5 mr-2 text-tertiary-600 flex-shrink-0" />
              <span>{getLearnTitle()}</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Hint Button (Bottom) */}
      {currentQuestion.hint_id && (
        <div className="flex justify-center mb-6 max-w-2xl mx-auto">
          <button
            onClick={handleShowHint}
            className="bg-white border border-gray-300 text-primary-700 rounded-full py-3 px-6 hover:bg-gray-50 transition-colors flex items-center shadow-sm"
          >
            <HelpCircle className="h-5 w-5 mr-2 text-primary-600" />
            <span>{getHintTitle()}</span>
          </button>
        </div>
      )}
      
      {/* Mobile Learn Button (shown only on small screens) */}
      {currentQuestion.learn_id && (
        <div className="md:hidden mb-6 max-w-2xl mx-auto">
          <button
            onClick={handleShowLearn}
            className="w-full bg-white border border-gray-300 text-tertiary-700 rounded-full py-3 px-4 hover:bg-gray-50 transition-colors flex items-center justify-center shadow-sm"
          >
            <BookOpen className="h-5 w-5 mr-2 text-tertiary-600" />
            <span>{getLearnTitle()}</span>
          </button>
        </div>
      )}
      
      {/* Start Over Button */}
      <div className="flex justify-end mb-6 max-w-2xl mx-auto">
        <button
          onClick={() => resetSurvey()}
          className="text-gray-500 hover:text-gray-700 flex items-center"
        >
          <RotateCcw className="h-5 w-5 mr-1" /> Start Over
        </button>
      </div>
      
      {/* Bottom Bar with Previous Questions */}
      {responses.length > 0 && (
        <div className="flex flex-col pt-4 border-t border-gray-200 max-w-2xl mx-auto">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Your Progress</h3>
          <div className="flex flex-wrap gap-2">
            {responses.map((response) => {
              const question = questions.find(q => q.id === response.question_id);
              if (!question) return null;
              
              return (
                <div 
                  key={response.id} 
                  className={`text-sm px-3 py-1 rounded-full cursor-pointer flex items-center text-xs md:text-sm
                    ${response.answer ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-red-50 text-red-700 border border-red-200'}`}
                  onClick={() => navigateToQuestion(response.question_id)}
                >
                  <span className="truncate max-w-[150px] md:max-w-[200px]">{question.text}</span>
                  <span className="ml-1 text-xs font-medium px-1.5 py-0.5 rounded-full bg-white flex-shrink-0">
                    {response.answer ? 'Yes' : 'No'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Hint Modal */}
      <Modal
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        title={hintContent?.title || 'Hint'}
      >
        <div className="prose max-w-none">
          {hintContent ? (
            <div dangerouslySetInnerHTML={{ __html: hintContent.content }} />
          ) : (
            <p>Loading hint content...</p>
          )}
        </div>
      </Modal>
      
      {/* Learn Modal */}
      <Modal
        isOpen={isLearnModalOpen}
        onClose={() => setIsLearnModalOpen(false)}
        title={learnContent?.title || 'Learn More'}
      >
        <div className="prose max-w-none">
          {learnContent ? (
            <div dangerouslySetInnerHTML={{ __html: learnContent.content }} />
          ) : (
            <p>Loading learn content...</p>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default TakeSurvey;