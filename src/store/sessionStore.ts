import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Survey, Question, Response, Session } from '../lib/supabase';

interface SessionState {
  activeSurvey: Survey | null;
  activeSession: Session | null;
  questions: Question[];
  responses: Response[];
  currentQuestion: Question | null;
  progress: number;
  actionPlan: string[];
  terminateMessage: string | null;
  loading: boolean;
  error: string | null;
  
  startSurvey: (surveyId: string) => Promise<void>;
  answerQuestion: (questionId: string, answer: boolean) => Promise<void>;
  updateAnswer: (questionId: string, answer: boolean) => Promise<void>;
  resetSurvey: () => Promise<void>;
  completeSession: () => Promise<void>;
  navigateToQuestion: (questionId: string) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSurvey: null,
  activeSession: null,
  questions: [],
  responses: [],
  currentQuestion: null,
  progress: 0,
  actionPlan: [],
  terminateMessage: null,
  loading: false,
  error: null,
  
  startSurvey: async (surveyId) => {
    set({ loading: true, error: null });
    
    try {
      // Fetch the survey
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();
      
      if (surveyError) throw surveyError;
      
      // Fetch all questions for the survey
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          hint:hints(*),
          learn:learns(*),
          action:actions(*),
          terminate:terminates(*)
        `)
        .eq('survey_id', surveyId)
        .order('order_position', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      if (!questionsData || questionsData.length === 0) {
        throw new Error('No questions found for this survey');
      }
      
      // Create a new session
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error('User not authenticated');
      }
      
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          survey_id: surveyId,
          user_id: userData.user.id,
        })
        .select()
        .single();
      
      if (sessionError) throw sessionError;
      
      set({
        activeSurvey: surveyData,
        activeSession: sessionData,
        questions: questionsData,
        currentQuestion: questionsData[0],
        responses: [],
        progress: 0,
        actionPlan: [],
        terminateMessage: null,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  answerQuestion: async (questionId, answer) => {
    const { activeSession, questions, responses } = get();
    
    if (!activeSession) {
      set({ error: 'No active session' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Check if we already have a response for this question (to avoid duplicates)
      const existingResponseIndex = responses.findIndex(r => r.question_id === questionId);
      
      let responseData;
      
      if (existingResponseIndex >= 0) {
        // Update existing response
        const existingResponse = responses[existingResponseIndex];
        const { data, error: responseError } = await supabase
          .from('responses')
          .update({ answer, updated_at: new Date().toISOString() })
          .eq('id', existingResponse.id)
          .select()
          .single();
        
        if (responseError) throw responseError;
        responseData = data;
        
        // Replace the existing response in our array
        const updatedResponses = [...responses];
        updatedResponses[existingResponseIndex] = responseData;
        
        // Truncate responses array to remove any that came after this one
        // (since changing an answer might change the path)
        const newResponses = updatedResponses.slice(0, existingResponseIndex + 1);
        
        // Find the current question
        const currentQuestion = questions.find(q => q.id === questionId);
        
        if (!currentQuestion) {
          throw new Error('Question not found');
        }
        
        // Determine the next question based on the answer
        const nextQuestionId = answer 
          ? currentQuestion.yes_leads_to 
          : currentQuestion.no_leads_to;
        
        // Check if there's a terminate flag
        if (currentQuestion.terminate_id) {
          const terminateData = currentQuestion.terminate as unknown as { content: string };
          
          // Collect all actions and complete the session
          const actionPlan = collectActionPlan(questions, newResponses);
          
          await completeSessionInDb(activeSession.id);
          
          set({
            responses: newResponses,
            actionPlan,
            terminateMessage: terminateData?.content || null,
            currentQuestion: null,
            progress: 100,
            loading: false,
          });
          
          return;
        }
        
        // If no next question, we're done
        if (!nextQuestionId) {
          // Collect all actions and complete the session
          const actionPlan = collectActionPlan(questions, newResponses);
          
          await completeSessionInDb(activeSession.id);
          
          set({
            responses: newResponses,
            actionPlan,
            currentQuestion: null,
            progress: 100,
            loading: false,
          });
          
          return;
        }
        
        // Find the next question
        const nextQuestion = questions.find(q => q.id === nextQuestionId);
        
        if (!nextQuestion) {
          throw new Error('Next question not found');
        }
        
        // Calculate progress
        const answeredQuestions = newResponses.length;
        const progress = Math.min(Math.round((answeredQuestions / questions.length) * 100), 100);
        
        set({
          responses: newResponses,
          currentQuestion: nextQuestion,
          progress,
          loading: false,
        });
      } else {
        // Create new response
        const { data, error: responseError } = await supabase
          .from('responses')
          .insert({
            session_id: activeSession.id,
            question_id: questionId,
            answer,
          })
          .select()
          .single();
        
        if (responseError) throw responseError;
        responseData = data;
        
        // Find the current question
        const currentQuestion = questions.find(q => q.id === questionId);
        
        if (!currentQuestion) {
          throw new Error('Question not found');
        }
        
        // Determine the next question based on the answer
        const nextQuestionId = answer 
          ? currentQuestion.yes_leads_to 
          : currentQuestion.no_leads_to;
        
        // Check if there's a terminate flag
        if (currentQuestion.terminate_id) {
          const terminateData = currentQuestion.terminate as unknown as { content: string };
          
          // Collect all actions and complete the session
          const actionPlan = collectActionPlan(questions, [...responses, responseData]);
          
          await completeSessionInDb(activeSession.id);
          
          set({
            responses: [...responses, responseData],
            actionPlan,
            terminateMessage: terminateData?.content || null,
            currentQuestion: null,
            progress: 100,
            loading: false,
          });
          
          return;
        }
        
        // If no next question, we're done
        if (!nextQuestionId) {
          // Collect all actions and complete the session
          const actionPlan = collectActionPlan(questions, [...responses, responseData]);
          
          await completeSessionInDb(activeSession.id);
          
          set({
            responses: [...responses, responseData],
            actionPlan,
            currentQuestion: null,
            progress: 100,
            loading: false,
          });
          
          return;
        }
        
        // Find the next question
        const nextQuestion = questions.find(q => q.id === nextQuestionId);
        
        if (!nextQuestion) {
          throw new Error('Next question not found');
        }
        
        // Calculate progress
        const answeredQuestions = responses.length + 1;
        const progress = Math.min(Math.round((answeredQuestions / questions.length) * 100), 100);
        
        set({
          responses: [...responses, responseData],
          currentQuestion: nextQuestion,
          progress,
          loading: false,
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updateAnswer: async (questionId, answer) => {
    const { activeSession, responses, questions } = get();
    
    if (!activeSession) {
      set({ error: 'No active session' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Find existing response
      const existingResponse = responses.find(r => r.question_id === questionId);
      
      if (existingResponse) {
        // Update existing response
        const { data: responseData, error: responseError } = await supabase
          .from('responses')
          .update({ answer, updated_at: new Date().toISOString() })
          .eq('id', existingResponse.id)
          .select()
          .single();
        
        if (responseError) throw responseError;
        
        // Update responses in state
        const updatedResponses = responses.map(r => 
          r.id === responseData.id ? responseData : r
        );
        
        // Reset progress to this question
        const currentQuestionIndex = getQuestionIndexInPath(questions, responses, questionId);
        
        if (currentQuestionIndex === -1) {
          throw new Error('Question not found in path');
        }
        
        // Get the question
        const currentQuestion = questions.find(q => q.id === questionId);
        
        if (!currentQuestion) {
          throw new Error('Question not found');
        }
        
        // Limit responses to just those up to the current question
        const limitedResponses = updatedResponses.slice(0, currentQuestionIndex + 1);
        
        // Calculate progress
        const progress = Math.min(Math.round((limitedResponses.length / questions.length) * 100), 100);
        
        set({
          responses: limitedResponses,
          currentQuestion,
          progress,
          loading: false,
        });
      } else {
        throw new Error('Response not found');
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  resetSurvey: async () => {
    const { activeSession, activeSurvey } = get();
    
    if (!activeSession || !activeSurvey) {
      set({ error: 'No active session' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Delete all responses for this session
      const { error: deleteError } = await supabase
        .from('responses')
        .delete()
        .eq('session_id', activeSession.id);
      
      if (deleteError) throw deleteError;
      
      // Start a new session
      await get().startSurvey(activeSurvey.id);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  completeSession: async () => {
    const { activeSession } = get();
    
    if (!activeSession) {
      set({ error: 'No active session' });
      return;
    }
    
    set({ loading: true, error: null });
    
    try {
      await completeSessionInDb(activeSession.id);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  navigateToQuestion: (questionId) => {
    const { questions, responses } = get();
    const question = questions.find(q => q.id === questionId);
    
    if (question) {
      // When navigating to a question, we need to find all responses up to this one
      const responseIndex = responses.findIndex(r => r.question_id === questionId);
      
      if (responseIndex >= 0) {
        // Keep only responses up to and including this question
        const relevantResponses = responses.slice(0, responseIndex + 1);
        
        // Calculate progress based on these responses
        const progress = Math.min(Math.round((relevantResponses.length / questions.length) * 100), 100);
        
        set({
          currentQuestion: question,
          responses: relevantResponses,
          progress,
        });
      } else {
        set({ currentQuestion: question });
      }
    }
  },
}));

// Helper functions
async function completeSessionInDb(sessionId: string) {
  const { error } = await supabase
    .from('sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId);
  
  if (error) throw error;
}

function collectActionPlan(questions: any[], responses: Response[]) {
  const actionItems: string[] = [];
  
  // For each response, check if we should add associated action based on trigger condition
  responses.forEach(response => {
    const question = questions.find(q => q.id === response.question_id);
    
    // Check if there's an action and it should be triggered based on the answer
    if (question && question.action_id) {
      const shouldTrigger = 
        // If action_trigger is not set, include action by default (backwards compatibility)
        !question.action_trigger || 
        // If action_trigger is 'yes', only include when answer is true
        (question.action_trigger === 'yes' && response.answer === true) ||
        // If action_trigger is 'no', only include when answer is false
        (question.action_trigger === 'no' && response.answer === false);
      
      if (shouldTrigger && question.action && typeof question.action === 'object') {
        const actionContent = (question.action as any).content;
        if (actionContent && !actionItems.includes(actionContent)) {
          actionItems.push(actionContent);
        }
      }
    }
  });
  
  return actionItems;
}

function getQuestionIndexInPath(questions: Question[], responses: Response[], questionId: string) {
  // Find the index of the response for this question
  return responses.findIndex(r => r.question_id === questionId);
}