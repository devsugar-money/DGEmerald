import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Modal from './Modal';

// Define resource type for the ResourceSelector
type ResourceType = 'hints_title' | 'hints_content' | 'learn_title' | 'learn_content' | 'terminate';

interface Resource {
  id: string;
  title?: string;
  content?: string;
  [key: string]: any;
}

interface ResourceSelectorProps {
  resourceType: ResourceType;
  onSelect: (resource: Resource) => void;
  currentValue?: string | null;
}

const ResourceSelector = ({ 
  resourceType, 
  onSelect,
  currentValue 
}: ResourceSelectorProps) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewItem, setPreviewItem] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  // Get the table name for the resource type
  const getTableName = () => {
    switch(resourceType) {
      case 'hints_title':
        return 'hints_title';
      case 'hints_content':
        return 'hints_content';
      case 'learn_title':
        return 'learn_title';
      case 'learn_content':
        return 'learn_content';
      case 'terminate':
        return 'terminates';
      default:
        return '';
    }
  };
  
  // Get the search field name based on resource type
  const getSearchFieldName = () => {
    return resourceType.includes('title') ? 'title' : 'content';
  };
  
  // Fetch the currently selected resource if there's a currentValue
  useEffect(() => {
    const fetchSelectedResource = async () => {
      if (!currentValue) {
        setSelectedResource(null);
        return;
      }
      
      const tableName = getTableName();
      if (!tableName) return;
      
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .eq('id', currentValue)
        .single();
        
      if (!error && data) {
        // First convert to unknown type, then check for required properties
        const resource = data as unknown as any;
        if (typeof resource === 'object' && resource !== null && typeof resource.id === 'string') {
          setSelectedResource({
            id: resource.id,
            title: resource.title,
            content: resource.content,
            created_at: resource.created_at || '',
            ...(resource as any)
          });
        }
      }
    };
    
    fetchSelectedResource();
  }, [currentValue]);
  
  // Fetch resources based on type and search
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      const tableName = getTableName();
      const searchField = getSearchFieldName();
      
      if (!tableName) {
        setLoading(false);
        return;
      }
      
      let query = supabase
        .from(tableName as any)
        .select('*');
        
      if (search) {
        query = query.ilike(searchField, `%${search}%`);
      }
      
      query = query.limit(10);
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${resourceType}:`, error);
        setResources([]);
      } else {
        // First convert to unknown type, then apply our filter and convert to Resources
        const rawData = data || [];
        const anyData = rawData as unknown as any[];
        const safeResources = anyData
          .filter(item => typeof item === 'object' && item !== null && typeof item.id === 'string')
          .map(item => ({
            id: item.id,
            title: item.title,
            content: item.content,
            created_at: item.created_at || '',
            ...(item as any)
          }));
        
        setResources(safeResources);
      }
      
      setLoading(false);
    };
    
    fetchResources();
  }, [resourceType, search]);
  
  // Handle preview
  const handlePreview = (item: Resource) => {
    setPreviewItem(item);
    setShowPreview(true);
  };
  
  // Handle select and update parent
  const handleSelect = (resource: Resource) => {
    setSelectedResource(resource);
    onSelect(resource);
  };
  
  // Get display text for the resource based on its type
  const getDisplayText = (resource: Resource) => {
    if (resourceType.includes('title')) {
      return resource.title || '[No Title]';
    } else {
      // For content type resources, remove HTML tags and truncate
      const content = resource.content || '';
      const plainText = content.replace(/<[^>]*>?/gm, '');
      return plainText.length > 50 ? plainText.substring(0, 50) + '...' : plainText;
    }
  };
  
  return (
    <div className="resource-selector">
      <div className="flex items-center space-x-2 mb-2">
        {selectedResource ? (
          <div className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 border rounded-md">
            <span className="text-sm truncate">
              {getDisplayText(selectedResource)}
            </span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedResource(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSearch('');
            }}
            className="w-full px-3 py-2 text-left border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Select {resourceType.replace('_', ' ')}...
          </button>
        )}
      </div>
      
      {!selectedResource && (
        <div className="resource-search-panel">
          <div className="mb-2">
            <input
              type="text"
              placeholder={`Search ${resourceType.replace('_', ' ')}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : (
            <ul className="resource-list max-h-60 overflow-y-auto border rounded-md divide-y">
              {resources.length === 0 ? (
                <li className="p-3 text-center text-gray-500">
                  No resources found
                </li>
              ) : (
                resources.map(resource => (
                  <li key={resource.id} className="px-3 py-2 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(resource);
                        }}
                        className="cursor-pointer flex-grow truncate"
                      >
                        {getDisplayText(resource)}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(resource);
                        }}
                        className="ml-2 px-2 py-1 text-xs text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50"
                      >
                        Preview
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
      
      {showPreview && previewItem && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Resource Preview"
        >
          <div className="p-4 space-y-4">
            {resourceType.includes('title') ? (
              <h4 className="text-lg font-medium">{previewItem.title}</h4>
            ) : (
              <div className="p-4 border rounded bg-gray-50">
                <div dangerouslySetInnerHTML={{__html: previewItem.content || ''}} />
              </div>
            )}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPreview(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(previewItem);
                  setShowPreview(false);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Select
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ResourceSelector;
