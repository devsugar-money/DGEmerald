// lib/storage.ts
import { supabase } from './supabase'; // Corrected import path

export const initializeStorage = async () => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return;
    }

    // Check if survey-uploads bucket exists
    const bucketExists = buckets?.find((b: { name: string }) => b.name === 'survey-uploads');

    if (!bucketExists) {
      console.log('Creating survey-uploads bucket...');
      const { error: createError } = await supabase.storage.createBucket('survey-uploads', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
        // Consider adding RLS policies for security later
      });

      if (createError) {
        console.error('Error creating storage bucket:', createError);
      } else {
        console.log('survey-uploads bucket created successfully.');
      }
    } else {
      console.log('survey-uploads bucket already exists.');
    }
  } catch (error) {
    console.error('Unexpected error during storage initialization:', error);
  }
};
