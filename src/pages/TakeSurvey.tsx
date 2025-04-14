import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSessionStore } from '../store/sessionStore';
import { supabase } from '../lib/supabase';
import { BookOpen, RotateCcw, Trees } from '../components/IconProvider';
import Modal from '../components/Modal';
import FileUpload from '../components/FileUpload';

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
    if (!currentQuestion?.hint_id) return;
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
    if (!currentQuestion?.learn_id) return;
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

  const stripHtmlTags = (text: string) => {
    return text.replace(/<[^>]*>/g, '');
  };
  
  const getHintTitle = () => {
    if (!currentQuestionWithData?.hint_id) return '';
    if (currentQuestionWithData.hint && typeof currentQuestionWithData.hint === 'object') {
      return stripHtmlTags((currentQuestionWithData.hint as any).title || '');
    }
    return stripHtmlTags(hintContent?.title || '');
  };
  
  const getLearnTitle = () => {
    if (!currentQuestionWithData?.learn_id) return '';
    if (currentQuestionWithData.learn && typeof currentQuestionWithData.learn === 'object') {
      return stripHtmlTags((currentQuestionWithData.learn as any).title || '');
    }
    return stripHtmlTags(learnContent?.title || '');
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

  return (
    <div className="max-w-4xl mx-auto px-4 relative">
      {/* Header */}
      {/* <div className="flex items-center mb-4">
        <Trees className="h-8 w-8 text-primary-600 mr-2" />
        <h1 className="text-xl font-semibold text-primary-800">DecideGuide</h1>
      </div> */}



      {/* Question Box */}
      <div className="relative max-w-xl mx-auto text-center"> 
  <div className="bg-white rounded-lg shadow-lg p-12 mb-6 flex flex-col items-center">
    {/* Survey Name */}
    <div className="text-center mb-14">
      <p className="text-xl text-gray-200" style={{ color: '#6088BF' }}>{activeSurvey.name}</p>
    </div>
    <h2
      className="text-3xl font-regular text-gray-500 mb-8"
      style={{ color: '#536EB7' }}
      dangerouslySetInnerHTML={{ __html: currentQuestion.text || '' }}
    />


    {/* Answer Buttons */}
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => handleAnswer(true)}
        className="text-white py-2 px-14 rounded-full hover:bg-blue-800"
        style={{ backgroundColor: '#536EB7' }}  // Darker blue
        >
        Yes
      </button>
      <button
        onClick={() => handleAnswer(false)}
        className="text-white py-2 px-14 rounded-full hover:bg-blue-800"
        style={{ backgroundColor: '#536EB7' }}  // Darker blue
        >
        No
      </button>
    </div>
  </div>
</div>

      

      {/* File Upload on Terminate */}
      {(() => {
        console.log('Terminate Values:', {
          terminateMessage,
          terminateId: currentQuestionWithData?.terminate_id,
          currentQuestionWithData
        });
        return null;
      })()}
      {terminateMessage && currentQuestionWithData?.terminate_id && (
        <div className="my-4 max-w-2xl mx-auto px-4 md:px-0">
          <FileUpload
            sessionId={activeSurvey.id}
            terminateId={currentQuestionWithData.terminate_id}
            />
        </div>
      )}
      {/* Learn Button */}
      {currentQuestion.learn_id && (
        <div className="flex justify-center mb-6 items-center">
          <BookOpen className="h-6 w-6 mr-1 text-[#2F2E2E]" />
          <button
            onClick={handleShowLearn}
            className="border border-gray-300 text-sm text-[#2F2E2E] rounded-full py-1.5 px-6 hover:bg-gray-100 flex items-center whitespace-nowrap"
          >
            <span>{getLearnTitle()}</span>
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-4 max-w-2xl mx-auto">
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-600 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      {/* Hint Button */}
{currentQuestion.hint_id && (
  <div className="absolute right-[-110px] top-1/3 transform -translate-y-1/2 flex items-center gap-2">
    <span className="text-4xl shrink-0">💡</span>
    <button
      onClick={handleShowHint}
      className="flex items-center text-sm text-orange-500 hover:text-orange-600 border border-gray-300 rounded-full py-2 px-4 max-w-[200px]"
    >
      <span className="truncate">{getHintTitle()}</span>
    </button>
  </div>
)}

      {/* Start Over */}
      <div className="flex justify-end mb-4 max-w-2xl mx-auto">
        <button
          onClick={() => resetSurvey()}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
        >
          <RotateCcw className="h-4 w-4 mr-1" /> Start Over
        </button>
      </div>

      {/* Previous Responses */}
      {responses.length > 0 && (
        <div className="flex flex-col pt-3 border-t border-gray-200 max-w-2xl mx-auto">
          <h3 className="text-xs font-medium text-gray-500 mb-2">Your Progress</h3>
          <div className="flex flex-wrap gap-2">
            {responses.map((response) => {
              const question = questions.find(q => q.id === response.question_id);
              if (!question) return null;

              return (
                <div
                  key={response.id}
                  className={`text-xs px-2.5 py-1 rounded-full cursor-pointer flex items-center border
                  ${response.answer ? 'bg-success-50 text-success-700 border-success-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                  onClick={() => navigateToQuestion(response.question_id)}
                >
                  <span className="truncate max-w-[120px]">{question.text}</span>
                  <span className="ml-2 bg-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
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
  title={stripHtmlTags(hintContent?.title || 'Hint')}
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
  title={stripHtmlTags(learnContent?.title || 'Learn More')}
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
