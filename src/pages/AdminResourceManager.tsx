import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Tabs, TabsList, TabsTrigger } from '../components/Tabs';
import { 
  BadgeHelp as Help, 
  Book, 
  PlusCircle, 
  Search, 
  Edit, 
  Trash, 
  Eye
} from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import { supabase } from '../lib/supabase';
import Modal from '../components/Modal';

// Define the resource types and their tables in Supabase
type ResourceType = 'hints_title' | 'hints_content' | 'learn_title' | 'learn_content';

// Map resource types to their database tables
// Using 'as const' to tell TypeScript these are literal strings
const resourceTableMap = {
  'hints_title': 'hints_title',
  'hints_content': 'hints_content', 
  'learn_title': 'learn_title',
  'learn_content': 'learn_content'
} as const;

interface Resource {
  id: string;
  title?: string;
  content?: string;
  created_at: string;
  [key: string]: any;
}

const AdminResourceManager = () => {
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ResourceType>('hints_title');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'preview'>('create');
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  
  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [user, isAdmin, navigate]);

  // Fetch resources based on active tab
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      
      // Using type assertion to bypass TypeScript's table name checking
      // since the database has these tables but they're not in the TypeScript types
      let query = supabase
        .from(resourceTableMap[activeTab] as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply search filter if present
      if (searchQuery) {
        if (activeTab === 'hints_title' || activeTab === 'learn_title') {
          query = query.ilike('title', `%${searchQuery}%`);
        } else {
          query = query.ilike('content', `%${searchQuery}%`);
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${activeTab}:`, error);
        setResources([]);
      } else {
        // Use type assertion to ensure we're setting valid resource objects
        setResources((data || []) as Resource[]);
      }
      
      setLoading(false);
    };
    
    fetchResources();
  }, [activeTab, searchQuery]);

  // Open modal for creation
  const handleCreate = () => {
    setCurrentResource(null);
    setFormTitle('');
    setFormContent('');
    setModalMode('create');
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (resource: Resource) => {
    setCurrentResource(resource);
    setFormTitle(resource.title || '');
    setFormContent(resource.content || '');
    setModalMode('edit');
    setShowModal(true);
  };

  // Open modal for preview
  const handlePreview = (resource: Resource) => {
    setCurrentResource(resource);
    setModalMode('preview');
    setShowModal(true);
  };

  // Handle resource deletion
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      const { error } = await supabase
        .from(resourceTableMap[activeTab] as any)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting ${activeTab}:`, error);
        alert(`Failed to delete: ${error.message}`);
      } else {
        // Remove from local state
        setResources(resources.filter(item => item.id !== id));
      }
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    if ((activeTab === 'hints_title' || activeTab === 'learn_title') && !formTitle.trim()) {
      alert('Title is required');
      return;
    }
    
    if ((activeTab === 'hints_content' || activeTab === 'learn_content') && !formContent.trim()) {
      alert('Content is required');
      return;
    }

    // Prepare data
    const resourceData: { title?: string; content?: string } = {};
    if (activeTab === 'hints_title' || activeTab === 'learn_title') {
      resourceData.title = formTitle;
    }
    if (activeTab === 'hints_content' || activeTab === 'learn_content') {
      resourceData.content = formContent;
    }

    // Create or update
    if (modalMode === 'create') {
      // Ensure required fields are present based on table type
      if (activeTab === 'hints_title' || activeTab === 'learn_title') {
        if (!resourceData.title) {
          resourceData.title = '';
        }
      } else if (activeTab === 'hints_content' || activeTab === 'learn_content') {
        if (!resourceData.content) {
          resourceData.content = '';
        }
      }
      
      const { data, error } = await supabase
        .from(resourceTableMap[activeTab] as any)
        .insert(resourceData as any)
        .select();
      
      if (error) {
        console.error(`Error creating ${activeTab}:`, error);
        alert(`Failed to create: ${error.message}`);
      } else if (data) {
        // Use type assertion to ensure we're adding a valid resource object
        setResources([data[0] as Resource, ...resources]);
        setShowModal(false);
      }
    } else if (modalMode === 'edit' && currentResource) {
      const { data, error } = await supabase
        .from(resourceTableMap[activeTab] as any)
        .update(resourceData as any)
        .eq('id', currentResource.id)
        .select();
      
      if (error) {
        console.error(`Error updating ${activeTab}:`, error);
        alert(`Failed to update: ${error.message}`);
      } else if (data) {
        // Use type assertion to ensure we're working with valid resource objects
        setResources(resources.map(item => 
          item.id === currentResource.id ? (data[0] as Resource) : item
        ));
        setShowModal(false);
      }
    }
  };

  // Determine which fields to show based on active tab
  const showTitle = activeTab === 'hints_title' || activeTab === 'learn_title';
  const showContent = activeTab === 'hints_content' || activeTab === 'learn_content';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Resource Manager</h1>
        <button
          onClick={handleCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ResourceType)}>
          <TabsList className="mb-6">
            <TabsTrigger value="hints_title" className="flex items-center">
              <Help className="h-4 w-4 mr-1" /> Hint Titles
            </TabsTrigger>
            <TabsTrigger value="hints_content" className="flex items-center">
              <Help className="h-4 w-4 mr-1" /> Hint Contents
            </TabsTrigger>
            <TabsTrigger value="learn_title" className="flex items-center">
              <Book className="h-4 w-4 mr-1" /> Learn Titles
            </TabsTrigger>
            <TabsTrigger value="learn_content" className="flex items-center">
              <Book className="h-4 w-4 mr-1" /> Learn Contents
            </TabsTrigger>
          </TabsList>
          
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeTab.replace('_', ' ')}...`}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">No {activeTab.replace('_', ' ')} found.</p>
              <p className="text-gray-500 text-sm">
                {searchQuery ? 
                  `No results match "${searchQuery}". Try a different search term.` : 
                  `Create your first ${activeTab.replace('_', ' ')} using the button above.`
                }
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    {showTitle && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>}
                    {showContent && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{resource.id}</td>
                      {showTitle && (
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {resource.title}
                        </td>
                      )}
                      {showContent && (
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="max-w-md truncate">
                            {resource.content}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(resource.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handlePreview(resource)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(resource)}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(resource.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Tabs>
      </div>
      
      {/* Modal for create/edit/preview */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
            modalMode === 'create' 
              ? `Create New ${activeTab.replace('_', ' ')}` 
              : modalMode === 'edit' 
                ? `Edit ${activeTab.replace('_', ' ')}` 
                : `Preview ${activeTab.replace('_', ' ')}`
          }
        >
          <div className="p-4">
            {modalMode === 'preview' ? (
              <div className="space-y-4">
                {showTitle && currentResource?.title && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Title:</h3>
                    <p className="text-gray-900">{currentResource.title}</p>
                  </div>
                )}
                {showContent && currentResource?.content && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500">Content:</h3>
                    <div className="p-4 border rounded bg-gray-50">
                      <div dangerouslySetInnerHTML={{ __html: currentResource.content }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {showTitle && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
                {showContent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <RichTextEditor
                      value={formContent}
                      onChange={setFormContent}
                      minHeight={250}
                    />
                  </div>
                )}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    {modalMode === 'create' ? 'Create' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
            
            {modalMode === 'preview' && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminResourceManager;
