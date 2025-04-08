# Implementation Plan for DGEmerald Features

## 1. Database Schema Modifications

After reviewing the current database schema, we'll modify it to add necessary features:

```sql
-- Database schema modifications complete:
-- ✓ Using existing hint/learn tables
-- ✓ Using existing has_upload column in terminates table
-- ✓ Created uploads table with RLS policies
-- ✓ Added indexes and triggers for uploads

-- Next steps focus on frontend implementation and storage integration
```

## 2. Authentication Enhancements

We'll modify the existing authentication system to include role-based access:

1. Update authStore.ts:
   - Add user role management
   - Add admin check functions
   - Implement role-based redirects

```typescript
// Add to AuthState interface
interface AuthState {
  // ...existing properties
  userRole: 'admin' | 'user' | null;
  isAdmin: boolean;
  checkUserRole: () => Promise<void>;
}

// Implementation
checkUserRole: async () => {
  if (!user) return;
  
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (error) {
    console.error('Error fetching user role:', error);
    return;
  }
  
  const isAdmin = data?.role === 'admin';
  set({ userRole: data?.role || 'user', isAdmin });
}
```

2. Utilize existing users table with role field:
```sql
-- The users table already has a role field, so we'll use that instead of creating a new table
-- Make sure the role field has appropriate validation
ALTER TABLE public.users
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'user')) 
  NOT VALID; -- Not validating existing data to avoid migration issues
```

3. Create protected route components:
```tsx
// AdminRoute.tsx
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuthStore();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading]);
  
  if (loading) return <LoadingSpinner />;
  return isAdmin ? <>{children}</> : null;
};
```

## 3. Admin Resource Management Pages

Create four separate admin pages for managing the existing tables: hints_title, hints_content, learn_title, and learn_content:

1. `HintTitleManager.tsx` - manages the existing hints_title table
2. `HintContentManager.tsx` - manages the existing hints_content table
3. `LearnTitleManager.tsx` - manages the existing learn_title table
4. `LearnContentManager.tsx` - manages the existing learn_content table

Each page will share similar components:
- List view with pagination
- Search functionality
- CRUD operations
- Rich text editor for content
- Preview capability

Example structure:
```tsx
// HintTitleManager.tsx
const HintTitleManager = () => {
  const [hintTitles, setHintTitles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentItem, setCurrentItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const fetchHintTitles = async () => {
      setLoading(true);
      const query = supabase
        .from('hints_title')
        .select('*');
        
      if (searchQuery) {
        query.ilike('title', `%${searchQuery}%`);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching hint titles:', error);
        return;
      }
      
      setHintTitles(data || []);
      setLoading(false);
    };
    
    fetchHintTitles();
  }, [searchQuery]);
  
  // CRUD operation handlers
  
  return (
    <AdminLayout>
      <h1>Hint Title Manager</h1>
      
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      
      <div className="resource-list">
        {loading ? (
          <LoadingSpinner />
        ) : (
          hintTitles.map(title => (
            <ResourceCard 
              key={title.id}
              title={title.title}
              onEdit={() => {
                setCurrentItem(title);
                setIsEditing(true);
              }}
              onDelete={() => handleDelete(title.id)}
            />
          ))
        )}
      </div>
      
      <Modal isOpen={isEditing}>
        <ResourceForm 
          initialData={currentItem}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
        />
      </Modal>
    </AdminLayout>
  );
};
```

## 4. Resource Selection Component

Create a reusable component for selecting resources in the survey editor, working with the existing database tables:

```tsx
// ResourceSelector.tsx
const ResourceSelector = ({ 
  resourceType, // 'hints_title', 'hints_content', 'learn_title', 'learn_content'
  onSelect,
  currentValue
}) => {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  
  // Fetch resources based on type and search
  useEffect(() => {
    const fetchResources = async () => {
      const { data, error } = await supabase
        .from(resourceType.includes('title') ? 
          resourceType.includes('hint') ? 'hint_titles' : 'learn_titles' : 
          resourceType.includes('hint') ? 'hint_contents' : 'learn_contents')
        .select('*')
        .ilike(resourceType.includes('title') ? 'title' : 'content', `%${search}%`)
        .limit(10);
      
      if (!error) setResources(data);
    };
    
    fetchResources();
  }, [resourceType, search]);
  
  // Handle preview
  const handlePreview = (item) => {
    setPreviewItem(item);
    setShowPreview(true);
  };
  
  return (
    <div className="resource-selector">
      <input
        type="text"
        placeholder={`Search ${resourceType.replace('_', ' ')}`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      <ul className="resource-list">
        {resources.map(resource => (
          <li key={resource.id}>
            <div className="resource-item">
              <span onClick={() => onSelect(resource)}>
                {resourceType.includes('title') ? resource.title : 
                  resource.content.substring(0, 50) + '...'}
              </span>
              <button onClick={() => handlePreview(resource)}>
                Preview
              </button>
            </div>
          </li>
        ))}
      </ul>
      
      {showPreview && previewItem && (
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        >
          <div className="preview-content">
            <h3>Preview</h3>
            {resourceType.includes('title') ? 
              <h4>{previewItem.title}</h4> : 
              <div dangerouslySetInnerHTML={{__html: previewItem.content}} />
            }
            <button onClick={() => {
              onSelect(previewItem);
              setShowPreview(false);
            }}>
              Select
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
```

## 5. Enhanced SpreadsheetEditor

Modify the SpreadsheetEditor.tsx to incorporate the new resource selection:

```tsx
// Modify the question structure in the spreadsheet
const modifiedColumns = [
  // ... existing columns
  {
    accessor: 'hint_title_id',
    header: 'Hint Title',
    cell: ({ row, value, updateData }) => (
      <ResourceSelector
        resourceType="hint_title"
        currentValue={value}
        onSelect={(resource) => updateData(row.index, 'hint_title_id', resource.id)}
      />
    )
  },
  {
    accessor: 'hint_content_id',
    header: 'Hint Content',
    cell: ({ row, value, updateData }) => (
      <ResourceSelector
        resourceType="hint_content"
        currentValue={value}
        onSelect={(resource) => updateData(row.index, 'hint_content_id', resource.id)}
      />
    )
  },
  // Similar for learn_title_id and learn_content_id
  {
    accessor: 'terminate_id',
    header: 'Terminate',
    cell: ({ row, value, updateData }) => (
      <>
        <ResourceSelector
          resourceType="terminate"
          currentValue={value}
          onSelect={(resource) => updateData(row.index, 'terminate_id', resource.id)}
        />
        {value && (
          <div className="terminate-options">
            <label>
              <input
                type="checkbox"
                checked={row.original.hasUpload || false}
                onChange={(e) => 
                  updateData(row.index, 'hasUpload', e.target.checked)
                }
              />
              Enable File Upload
            </label>
          </div>
        )}
      </>
    )
  }
];
```

## 6. Supabase Storage Implementation

Set up Supabase storage for file uploads:

1. Create storage bucket:
```typescript
// lib/storage.ts
export const initializeStorage = async () => {
  const { data: buckets } = await supabase.storage.listBuckets();
  
  // Check if survey-uploads bucket exists
  const bucketExists = buckets?.find(b => b.name === 'survey-uploads');
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket('survey-uploads', {
      public: false,
      fileSizeLimit: 10485760 // 10MB
    });
    
    if (error) {
      console.error('Error creating storage bucket:', error);
    }
  }
};
```

2. Create file upload component:
```tsx
// components/FileUpload.tsx
const FileUpload = ({ sessionId, terminateId }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    
    const filePath = `${sessionId}/${terminateId}/${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from('survey-uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        onUploadProgress: (progress) => {
          setProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      });
      
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }
    
    // Save upload record to database
    const { error: dbError } = await supabase
      .from('uploads')
      .insert({
        session_id: sessionId,
        terminate_id: terminateId,
        file_path: filePath,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size
      });
      
    if (dbError) {
      setError(dbError.message);
    } else {
      setSuccess(true);
    }
    
    setUploading(false);
  };
  
  return (
    <div className="file-upload">
      <h3>Upload Document</h3>
      
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />
      
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        Upload
      </button>
      
      {uploading && (
        <div className="progress-bar">
          <div 
            className="progress" 
            style={{ width: `${progress}%` }}
          />
          <span>{progress}%</span>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
      {success && <div className="success">File uploaded successfully!</div>}
    </div>
  );
};
```

## 7. Update Take Survey Flow

Modify the TakeSurvey.tsx component to handle the new data structure and file uploads:

```tsx
// In the question display section
const [currentQuestion, setCurrentQuestion] = useState(null);

// Fetch related resources for the current question
useEffect(() => {
  if (!currentQuestion) return;
  
  const fetchResources = async () => {
    // Fetch hint title
    if (currentQuestion.hint_title_id) {
      const { data } = await supabase
        .from('hint_titles')
        .select('title')
        .eq('id', currentQuestion.hint_title_id)
        .single();
        
      setHintTitle(data?.title);
    }
    
    // Similar fetches for hint content, learn title, learn content
  };
  
  fetchResources();
}, [currentQuestion]);

// In the terminate section, add file upload if enabled
{currentQuestion.terminate_id && currentQuestion.hasUpload && (
  <FileUpload 
    sessionId={sessionId} 
    terminateId={currentQuestion.terminate_id} 
  />
)}
```

## 8. Implementation

### Project Summary

### Key Deliverables

1. Database Schema Enhancements ✓
   - Using existing hint/learn tables ✓
   - Using existing has_upload column in terminates table ✓
   - Added uploads table with proper structure and RLS policies ✓
   - Added performance indexes and cleanup triggers ✓

2. Authentication Enhancements
   - Update auth store to use existing users table for role management
   - Add protected route components
   - Add admin dashboard access control

3. Admin Resource Management Pages
   - Create four admin pages for managing existing resource tables
   - Implement CRUD operations for each
   - Add search and preview features

4. Resource Selection System
   - Create ResourceSelector component for existing tables
   - Update SpreadsheetEditor to use new components
   - Implement preview functionality

5. Storage Implementation
   - Configure storage buckets for file uploads
   - Create file upload component
   - Implement progress tracking and error handling
   - Connect with terminates functionality

6. Integration
   - Update TakeSurvey flow to use new data structure
   - Test end-to-end functionality
   - Add migration scripts

7. UI Improvements
   - Enhance admin dashboard with navigation
   - Add responsive design elements
   - Implement loading states and error handling
