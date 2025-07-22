
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  url?: string;
  error?: string;
}

interface FileUploadZoneProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  bucketName?: string;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesUploaded,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'text/*', '.pdf', '.doc', '.docx'],
  bucketName = 'uploads'
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileName = `${fileId}-${file.name}`;
    
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    };

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          onUploadProgress: (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setUploadedFiles(prev => 
              prev.map(f => 
                f.id === fileId 
                  ? { ...f, progress: percentage }
                  : f
              )
            );
          }
        });

      if (error) throw error;

      const { data: publicData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return {
        ...uploadedFile,
        status: 'completed',
        progress: 100,
        url: publicData.publicUrl
      };
    } catch (error) {
      return {
        ...uploadedFile,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (uploadedFiles.length + acceptedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading' as const,
      progress: 0
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    const uploadPromises = acceptedFiles.map(uploadFile);
    const results = await Promise.all(uploadPromises);

    setUploadedFiles(prev => {
      const updated = prev.map(file => {
        const result = results.find(r => r.name === file.name);
        return result || file;
      });
      
      onFilesUploaded?.(updated.filter(f => f.status === 'completed'));
      return updated;
    });

    const successCount = results.filter(r => r.status === 'completed').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    if (successCount > 0) {
      toast({
        title: "Upload successful",
        description: `${successCount} file(s) uploaded successfully`,
      });
    }

    if (errorCount > 0) {
      toast({
        title: "Upload errors",
        description: `${errorCount} file(s) failed to upload`,
        variant: "destructive"
      });
    }
  }, [uploadedFiles.length, maxFiles, onFilesUploaded, toast, bucketName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxFiles
  });

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-sm text-gray-500">
            or click to browse files
          </p>
          <p className="text-xs text-gray-400">
            Supports: {acceptedTypes.join(', ')} (max {maxFiles} files)
          </p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-medium">Uploaded Files</h3>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <File className="h-8 w-8 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                {file.status === 'uploading' && (
                  <Progress value={file.progress} className="w-full mt-1" />
                )}
                {file.status === 'error' && (
                  <p className="text-xs text-red-500 mt-1">{file.error}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {file.status === 'completed' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {file.status === 'error' && (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
