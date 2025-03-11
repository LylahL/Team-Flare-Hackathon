import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiFile } from 'react-icons/fi';
import DocumentPreview from '../DocumentPreview';
import { uploadDocument } from '../../services/documentService';
import { useNotification } from '../../contexts/NotificationContext';
import './styles.css';

interface DocumentUploadProps {
  caseId?: string;
  onUploadComplete?: (documentIds: string[]) => void;
  multiple?: boolean;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  caseId,
  onUploadComplete,
  multiple = true,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const { showNotification } = useNotification();
  const uploadedDocumentIds = useRef<string[]>([]);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!multiple && acceptedFiles.length > 0) {
      setFiles([acceptedFiles[0]]);
    } else {
      setFiles(prev => [...prev, ...acceptedFiles]);
    }
  }, [multiple]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxFileSize,
    multiple,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(file => {
        if (file.file.size > maxFileSize) {
          showNotification('error', `File ${file.file.name} exceeds maximum size of ${maxFileSize / (1024 * 1024)}MB`);
        } else {
          showNotification('error', `File ${file.file.name} is not an accepted file type`);
        }
      });
    }
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreview = (file: File) => {
    setPreviewFile(file);
  };

  const closePreview = () => {
    setPreviewFile(null);
  };

  const uploadFiles = async () => {
    if (!files.length) {
      showNotification('warning', 'No files selected for upload');
      return;
    }

    setUploading(true);
    uploadedDocumentIds.current = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        if (caseId) {
          formData.append('caseId', caseId);
        }

        const documentId = await uploadDocument(formData, (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: progress
          }));
        });
        
        uploadedDocumentIds.current.push(documentId);
        showNotification('success', `File ${file.name} uploaded successfully`);
      }

      if (onUploadComplete) {
        onUploadComplete(uploadedDocumentIds.current);
      }
      
      setFiles([]);
      setUploadProgress({});
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('error', 'Failed to upload one or more files');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FiFile className="file-icon pdf" />;
      case 'doc':
      case 'docx':
        return <FiFile className="file-icon doc" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FiFile className="file-icon image" />;
      default:
        return <FiFile className="file-icon" />;
    }
  };

  return (
    <div className="document-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <FiUpload className="upload-icon" />
          <p>Drag & drop files here, or click to select files</p>
          <small>
            Accepted file types: {acceptedFileTypes.join(', ')} (Max size: {maxFileSize / (1024 * 1024)}MB)
          </small>
        </div>
      </div>

      {files.length > 0 && (
        <div className="selected-files">
          <h4>Selected Files</h4>
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="file-item">
                <div className="file-info">
                  {getFileIcon(file.name)}
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <div className="file-actions">
                  {uploading ? (
                    <div className="progress-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${uploadProgress[file.name] || 0}%` }}
                      />
                      <span className="progress-text">
                        {uploadProgress[file.name] ? `${uploadProgress[file.name]}%` : 'Waiting...'}
                      </span>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="preview-btn"
                        onClick={() => handlePreview(file)}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeFile(index)}
                      >
                        <FiX />
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {!uploading && (
            <button
              type="button"
              className="upload-btn"
              onClick={uploadFiles}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload All Files'}
            </button>
          )}
        </div>
      )}

      {previewFile && (
        <div className="preview-modal">
          <div className="preview-content">
            <div className="preview-header">
              <h3>Preview: {previewFile.name}</h3>
              <button className="close-preview" onClick={closePreview}>
                <FiX />
              </button>
            </div>
            <DocumentPreview file={previewFile} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;

import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiTrash2, FiDownload, FiCheck, FiX } from 'react-icons/fi';
import { uploadDocument, deleteDocument } from '../../services/documentService';
import { formatFileSize, formatDate } from '../../utils/formatters';
import {
  Container,
  DropzoneContainer,
  DocumentsContainer,
  DocumentItem,
  DocumentIcon,
  DocumentInfo,
  DocumentTitle,
  DocumentMeta,
  DocumentActions,
  UploadProgress,
  ProgressBar,
  NoDocuments,
  FileTypeTag,
  ActionButton
} from './styles';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

interface DocumentUploadProps {
  caseId: string;
  existingDocuments?: Document[];
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ caseId, existingDocuments = [] }) => {
  const [documents, setDocuments] = useState<Document[]>(existingDocuments);
  const [uploading, setUploading] = useState<{ [key: string]: { progress: number; error?: string } }>({});
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<{ [key: string]: AbortController }>({});

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const fileId = `${file.name}-${Date.now()}`;
      
      // Initialize upload state
      setUploading(prev => ({
        ...prev,
        [fileId]: { progress: 0 }
      }));

      // Create abort controller for this upload
      abortControllerRef.current[fileId] = new AbortController();
      
      try {
        // Mock progress updates (

