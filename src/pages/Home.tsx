import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Survey } from '../lib/supabase';
import { Trees, ArrowRight } from '../components/IconProvider';

const Home = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPublicSurveys() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('surveys')
          .select('*')
          .limit(6);
        
        if (error) throw error;
        
        setSurveys(data || []);
      } catch (error) {
        console.error('Error fetching surveys:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicSurveys();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center py-12">
        <Trees className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Decision Tree Builder</h1>
        <p className="text-xl text-gray-600 mb-8">
          Create interactive decision trees to guide your users through complex decisions
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-white text-indigo-600 border border-indigo-600 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            Login
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Surveys</h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : surveys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <div key={survey.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{survey.name}</h3>
                  <div className="flex justify-end mt-4">
                    <Link
                      to={`/survey/${survey.id}`}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center"
                    >
                      Take Survey <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No surveys available yet.</p>
          </div>
        )}
      </section>

      <section className="mt-16 bg-gray-50 p-8 rounded-lg">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Create Your Tree</h3>
            <p className="text-gray-600">Design a decision tree with yes/no questions and customize paths.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Add Resources</h3>
            <p className="text-gray-600">Include hints, learning resources, and actionable items.</p>
          </div>
          
          <div className="text-center">
            <div className="bg-indigo-100 text-indigo-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Share & Analyze</h3>
            <p className="text-gray-600">Share your decision tree and collect user responses.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;