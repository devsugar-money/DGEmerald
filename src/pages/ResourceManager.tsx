import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSurveyStore } from '../store/surveyStore';
import { useAuthStore } from '../store/authStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/Tabs';
import { BadgeHelp as Help, Book, ListChecks, AlertTriangle } from 'lucide-react';

const ResourceManager = () => {
  const { hints, learns, actions, terminates, fetchResources, loading } = useSurveyStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hints');

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Resource Manager</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="hints" className="flex items-center">
            <Help className="h-4 w-4 mr-1" /> Hints
          </TabsTrigger>
          <TabsTrigger value="learns" className="flex items-center">
            <Book className="h-4 w-4 mr-1" /> Learns
          </TabsTrigger>
          <TabsTrigger value="actions" className="flex items-center">
            <ListChecks className="h-4 w-4 mr-1" /> Actions
          </TabsTrigger>
          <TabsTrigger value="terminates" className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" /> Terminates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="hints">
          {hints.length === 0 ? (
            <EmptyState type="hints" />
          ) : (
            <ResourceList 
              items={hints} 
              fields={['title', 'content']}
              icon={<Help className="h-5 w-5 text-blue-600" />}
            />
          )}
        </TabsContent>
        
        <TabsContent value="learns">
          {learns.length === 0 ? (
            <EmptyState type="learns" />
          ) : (
            <ResourceList 
              items={learns} 
              fields={['title', 'content']}
              icon={<Book className="h-5 w-5 text-purple-600" />}
            />
          )}
        </TabsContent>
        
        <TabsContent value="actions">
          {actions.length === 0 ? (
            <EmptyState type="actions" />
          ) : (
            <ResourceList 
              items={actions} 
              fields={['content']}
              icon={<ListChecks className="h-5 w-5 text-green-600" />}
            />
          )}
        </TabsContent>
        
        <TabsContent value="terminates">
          {terminates.length === 0 ? (
            <EmptyState type="terminates" />
          ) : (
            <ResourceList 
              items={terminates} 
              fields={['content']}
              icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const EmptyState = ({ type }: { type: string }) => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <p className="text-gray-600 mb-2">No {type} available yet.</p>
      <p className="text-gray-500 text-sm">
        {type === 'hints' || type === 'learns' 
          ? `${type.charAt(0).toUpperCase() + type.slice(1)} will be created when you add them to questions.`
          : `${type.charAt(0).toUpperCase() + type.slice(1, type.length - 1)} items will be created when you add them to questions.`
        }
      </p>
    </div>
  );
};

interface ResourceListProps {
  items: any[];
  fields: string[];
  icon: React.ReactNode;
}

const ResourceList = ({ items, fields, icon }: ResourceListProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li key={item.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">{icon}</div>
              <div className="flex-1 min-w-0">
                {fields.includes('title') && (
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                )}
                {fields.includes('content') && (
                  <p className="text-sm text-gray-500 mt-1">
                    {item.content}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Created: {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResourceManager;