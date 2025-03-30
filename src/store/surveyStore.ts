import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Survey, Question, Hint, Learn, Action, Terminate } from '../lib/supabase';

// Create separate slices of state to prevent unnecessary re-renders
interface SurveyBaseState {
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

interface SurveysState {
  surveys: Survey[];
  currentSurvey: Survey | null;
  fetchSurveys: () => Promise<void>;
  createSurvey: (name: string) => Promise<Survey>;
  updateSurvey: (id: string, name: string) => Promise<void>;
  deleteSurvey: (id: string) => Promise<void>;
  fetchSurveyDetails: (id: string) => Promise<void>;
}

interface QuestionsState {
  questions: Question[];
  createQuestion: (surveyId: string, text: string, order: number) => Promise<Question>;
  updateQuestion: (id: string, data: Partial<Question>) => Promise<void>;
  updateQuestionOrder: (questions: { id: string, order_position: number }[]) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
}

interface ResourcesState {
  hints: Hint[];
  learns: Learn[];
  actions: Action[];
  terminates: Terminate[];
  createHint: (title: string, content: string) => Promise<Hint>;
  createLearn: (title: string, content: string) => Promise<Learn>;
  createAction: (content: string) => Promise<Action>;
  createTerminate: (content: string) => Promise<Terminate>;
  fetchResources: () => Promise<void>;
}

// Create the store with the combined state
interface SurveyState extends SurveyBaseState, SurveysState, QuestionsState, ResourcesState {}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  // Base state
  loading: false,
  error: null,
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Surveys state
  surveys: [],
  currentSurvey: null,
  
  // Questions state
  questions: [],
  
  // Resources state
  hints: [],
  learns: [],
  actions: [],
  terminates: [],
  
  fetchSurveys: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      set({ surveys: data || [], loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  createSurvey: async (name) => {
    set({ loading: true, error: null });
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('surveys')
        .insert({
          name,
          created_by: userData.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ 
        surveys: [data, ...state.surveys],
        currentSurvey: data,
        loading: false 
      }));
      
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  
  updateSurvey: async (id, name) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('surveys')
        .update({ name })
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        surveys: state.surveys.map((survey) => 
          survey.id === id ? { ...survey, name } : survey
        ),
        currentSurvey: state.currentSurvey?.id === id 
          ? { ...state.currentSurvey, name }
          : state.currentSurvey,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deleteSurvey: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        surveys: state.surveys.filter((survey) => survey.id !== id),
        currentSurvey: state.currentSurvey?.id === id ? null : state.currentSurvey,
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  fetchSurveyDetails: async (id) => {
    set({ loading: true, error: null });
    
    try {
      // Fetch survey
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();
      
      if (surveyError) throw surveyError;
      
      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_id', id)
        .order('order_position', { ascending: true });
      
      if (questionsError) throw questionsError;
      
      set({ 
        currentSurvey: surveyData,
        questions: questionsData || [],
        loading: false 
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  createQuestion: async (surveyId, text, order) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          survey_id: surveyId,
          text,
          order_position: order,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ 
        questions: [...state.questions, data],
        loading: false 
      }));
      
      return data;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
  
  updateQuestion: async (id, updates) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('questions')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        questions: state.questions.map((question) => 
          question.id === id ? { ...question, ...updates } : question
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  updateQuestionOrder: async (updatedQuestions) => {
    set({ loading: true, error: null });
    
    try {
      // Create a transaction to update all questions at once
      const updates = updatedQuestions.map(({ id, order_position }) => {
        return supabase
          .from('questions')
          .update({ order_position })
          .eq('id', id);
      });
      
      await Promise.all(updates);
      
      // Update state
      set((state) => {
        const updatedQuestionsMap = new Map(
          updatedQuestions.map(q => [q.id, q.order_position])
        );
        
        const newQuestions = state.questions.map(question => {
          const newOrder = updatedQuestionsMap.get(question.id);
          if (newOrder !== undefined) {
            return { ...question, order_position: newOrder };
          }
          return question;
        });
        
        return {
          questions: newQuestions.sort((a, b) => a.order_position - b.order_position),
          loading: false
        };
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  deleteQuestion: async (id) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set((state) => ({
        questions: state.questions.filter((question) => question.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
  
  createHint: async (title, content) => {
    try {
      const { data, error } = await supabase
        .from('hints')
        .insert({ title, content })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ hints: [...state.hints, data] }));
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  createLearn: async (title, content) => {
    try {
      const { data, error } = await supabase
        .from('learns')
        .insert({ title, content })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ learns: [...state.learns, data] }));
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  createAction: async (content) => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .insert({ content })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ actions: [...state.actions, data] }));
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  createTerminate: async (content) => {
    try {
      const { data, error } = await supabase
        .from('terminates')
        .insert({ content })
        .select()
        .single();
      
      if (error) throw error;
      
      set((state) => ({ terminates: [...state.terminates, data] }));
      
      return data;
    } catch (error) {
      throw error;
    }
  },
  
  fetchResources: async () => {
    set({ loading: true, error: null });
    
    try {
      // Fetch all resources in parallel
      const [hintsRes, learnsRes, actionsRes, terminatesRes] = await Promise.all([
        supabase.from('hints').select('*'),
        supabase.from('learns').select('*'),
        supabase.from('actions').select('*'),
        supabase.from('terminates').select('*'),
      ]);
      
      if (hintsRes.error) throw hintsRes.error;
      if (learnsRes.error) throw learnsRes.error;
      if (actionsRes.error) throw actionsRes.error;
      if (terminatesRes.error) throw terminatesRes.error;
      
      set({
        hints: hintsRes.data || [],
        learns: learnsRes.data || [],
        actions: actionsRes.data || [],
        terminates: terminatesRes.data || [],
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },
}));

// Create selector hooks to only subscribe to the parts of the state they need
export const useCurrentSurvey = () => useSurveyStore(state => ({
  currentSurvey: state.currentSurvey,
  loading: state.loading,
  error: state.error,
  fetchSurveyDetails: state.fetchSurveyDetails,
  updateSurvey: state.updateSurvey
}));

export const useSurveys = () => useSurveyStore(state => ({
  surveys: state.surveys,
  loading: state.loading,
  error: state.error,
  fetchSurveys: state.fetchSurveys,
  createSurvey: state.createSurvey,
  deleteSurvey: state.deleteSurvey
}));

export const useQuestions = () => useSurveyStore(state => ({
  questions: state.questions,
  loading: state.loading,
  error: state.error,
  createQuestion: state.createQuestion,
  updateQuestion: state.updateQuestion,
  updateQuestionOrder: state.updateQuestionOrder,
  deleteQuestion: state.deleteQuestion
}));

export const useResources = () => useSurveyStore(state => ({
  hints: state.hints,
  learns: state.learns,
  actions: state.actions,
  terminates: state.terminates,
  loading: state.loading,
  error: state.error,
  fetchResources: state.fetchResources,
  createHint: state.createHint,
  createLearn: state.createLearn,
  createAction: state.createAction,
  createTerminate: state.createTerminate
}));