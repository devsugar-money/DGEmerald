// components/FileUpload.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase'; // Corrected import path

interface FileUploadProps {
  sessionId: string | number; // Adjust type as needed
  terminateId: string | number; // Adjust type as needed
  onUploadSuccess?: (filePath: string) => void; // Optional callback
}

const FileUpload: React.FC<FileUploadProps> = ({ sessionId, terminateId, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(false);
      setProgress(0);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;


    const res = (await supabase.auth.getUser()).data.user?.id

    console.log(res , "====================")

    setUploading(true);
    setProgress(0);
    setError(null);
    setSuccess(false);

    // Ensure consistent path format, maybe sanitize file.name if needed
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = `${sessionId}/${terminateId}/${Date.now()}-${sanitizedFileName}`;

    console.log(filePath)

    try {
      const { error: uploadError } = await supabase.storage
        .from('survey_uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false, // Set to true if you want to allow overwriting
        });

      if (uploadError) {
        // More specific error handling could be added here
        console.error('Upload Error:', uploadError);
        setError(`Upload failed: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      console.log('File uploaded to path:', filePath);

      // Save upload record to database
      // IMPORTANT: Assumes an 'uploads' table exists with these columns
      const { error: dbError } = await supabase.from('uploads')
        .insert({
          session_id: String(sessionId), // Ensure string type for UUID column
          terminate_id: String(terminateId), // Ensure string type for UUID column
          file_path: filePath,
          file_name: file.name, // Store original file name
          file_type: file.type,
          file_size: file.size,
          user_id: (await supabase.auth.getUser()).data.user?.id // Optional: Link to user
        });

      if (dbError) {
        console.error('DB Insert Error:', dbError);
        // Handle potential conflict or other DB errors
        setError(`Failed to record upload: ${dbError.message}`);
        // Consider deleting the uploaded file if DB record fails
        // await supabase.storage.from('survey-uploads').remove([filePath]);
      } else {
        setSuccess(true);
        console.log('Upload record saved to database.');
        if (onUploadSuccess) {
          onUploadSuccess(filePath);
        }
      }
    } catch (err: any) {
      console.error('Unexpected Upload Error:', err);
      setError(`An unexpected error occurred: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-upload shadow-lg space-y-4 border border-[#ccc]" style={{ marginTop: '15px', padding: '10px', borderRadius: '4px' }}>
      <h4 className='font-semibold' style={{ marginTop: '0', marginBottom: '10px' }}>Upload Document (Optional)</h4>

      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <button
      className='px-6 py-2 mt-4 text-white rounded-full hover:bg-blue-700'
        onClick={handleUpload}
        disabled={!file || uploading}
        style={{ padding: '8px 15px', cursor: 'pointer' , backgroundColor: '#536EB7' }}
      >
        {uploading ? `Uploading... ${progress}%` : 'Upload File'}
      </button>

      {uploading && (
        <div className="progress-bar" style={{ background: '#eee', borderRadius: '4px', marginTop: '10px', height: '10px', overflow: 'hidden' }}>
          <div
            className="progress"
            style={{ width: `${progress}%`, background: '#4caf50', height: '10px' }}
          />
        </div>
      )}

      {error && <div className="error" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      {success && <div className="success" style={{ color: 'green', marginTop: '10px' }}>File uploaded successfully!</div>}
    </div>
  );
};

export default FileUpload;
