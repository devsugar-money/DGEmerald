import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, AlertTriangle, FileCheck } from 'lucide-react';

const ActionPlan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { actionPlan = [], terminateMessage = null, surveyName = 'Survey' } = location.state || {};
  
  // If no action plan data is provided, redirect to home
  React.useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);
  
  if (!actionPlan.length && !terminateMessage) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-800">Your Custom <span className="text-primary-600">Action</span> Plan</h1>
      </div>
      
      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <div className="text-center p-8 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">My Personal <span className="text-primary-600">Action</span> Plan</h2>
          <p className="text-xl text-gray-600 mt-1">{surveyName}</p>
          <p className="text-sm text-gray-500 mt-1">Illustration Only*</p>
        </div>
        
        <div className="flex">
          <div className="flex-grow border-r border-gray-100">
            <div className="py-4 px-6 bg-primary-50">
              <h3 className="text-lg font-medium">Action Plan</h3>
              <p className="text-sm text-gray-500">Standard Subscription</p>
            </div>
            
            {terminateMessage && (
              <div className="p-6 border-b border-gray-200 bg-warning-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-warning-800">Important Note</h3>
                    <div className="mt-2 text-warning-700">
                      <p>{terminateMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {actionPlan.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {actionPlan.map((action, index) => (
                  <div key={index} className={`p-6 flex items-center ${
                    index % 2 === 0 ? 'bg-tertiary-50' : 'bg-secondary-50'
                  }`}>
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                      <div className="rounded-full bg-white w-10 h-10 flex items-center justify-center text-xl font-bold text-gray-700 border border-gray-200">
                        {(index + 1).toString().padStart(2, '0')}
                      </div>
                    </div>
                    <div className="ml-4 flex-grow">
                      <p className={`text-lg font-medium ${
                        index % 2 === 0 ? 'text-tertiary-700' : 'text-secondary-700'
                      }`}>{action}</p>
                    </div>
                    <div className="w-16 flex-shrink-0 flex items-center justify-center">
                      <FileCheck className={`h-8 w-8 ${
                        index % 2 === 0 ? 'text-tertiary-500' : 'text-secondary-500'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No specific actions were recommended based on your responses.
              </div>
            )}
          </div>
          
          <div className="w-64 bg-warning-100">
            <div className="py-4 px-6 bg-warning-200">
              <h3 className="text-lg font-medium">Step-by-Step Guidance</h3>
              <p className="text-sm text-gray-700">Premium Subscription</p>
            </div>
            
            <div className="p-4">
              {/* This would be premium content - just showing placeholders */}
              {[1, 2, 3, 4].map((_, idx) => (
                <div key={idx} className="my-6 flex justify-center">
                  <div className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link
          to="/"
          className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium"
        >
          Return to Home <ArrowRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};

export default ActionPlan;