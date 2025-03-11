import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Service for handling document-related operations
 */
class DocumentService {
  /**
   * Upload a document to the server
   * @param caseId - The ID of the case this document belongs to
   * @param file - The file to upload
   * @param metadata - Additional metadata for the document
   * @param onProgress - Optional callback for upload progress
   */
  async uploadDocument(
    caseId: string,
    file: File,
    metadata: {
      documentType: string;
      description?: string;
      tags?: string[];
    },
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', metadata.documentType);
    
    if (metadata.description) {
      formData.append('description', metadata.description);
    }
    
    if (metadata.tags && metadata.tags.length > 0) {
      formData.append('tags', JSON.stringify(metadata.tags));
    }

    try {
      const response = await axios.post(
        `${API_URL}/cases/${caseId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: onProgress,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a specific case
   * @param caseId - The ID of the case
   */
  async getDocuments(caseId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${API_URL}/cases/${caseId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  /**
   * Get a single document by ID
   * @param documentId - The ID of the document
   */
  async getDocument(documentId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  /**
   * Download a document
   * @param documentId - The ID of the document to download
   * @param fileName - Optional custom filename for the downloaded file
   */
  async downloadDocument(documentId: string, fileName?: string): Promise<void> {
    try {
      const response = await axios.get(`${API_URL}/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from Content-Disposition header or use provided filename
      const contentDisposition = response.headers['content-disposition'];
      let downloadFileName = fileName;
      
      if (!downloadFileName && contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          downloadFileName = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', downloadFileName || 'document');
      
      // Append to the DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param documentId - The ID of the document to delete
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/documents/${documentId}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Update document metadata
   * @param documentId - The ID of the document to update
   * @param metadata - The updated metadata
   */
  async updateDocumentMetadata(
    documentId: string,
    metadata: {
      documentType?: string;
      description?: string;
      tags?: string[];
    }
  ): Promise<any> {
    try {
      const response = await axios.patch(
        `${API_URL}/documents/${documentId}`,
        metadata
      );
      return response.data;
    } catch (error) {
      console.error('Error updating document metadata:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const documentService = new DocumentService();
export default documentService;

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_URL } from '../config/constants';

// Define TypeScript interfaces for document types
export interface DocumentMetadata {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  uploadedBy: string;
  caseId?: string;
  description?: string;
  tags?: string[];
  status?: 'pending' | 'approved' | 'rejected';
}

export interface DocumentUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export type DocumentUploadCallback = (progress: DocumentUploadProgress) => void;

class DocumentService {
  private apiUrl = `${API_URL}/documents`;

  /**
   * Upload a document with progress tracking
   */
  async uploadDocument(
    file: File,
    metadata: Partial<DocumentMetadata>,
    onProgress?: DocumentUploadCallback
  ): Promise<DocumentMetadata> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add metadata as JSON string
    formData.append('metadata', JSON.stringify(metadata));

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage,
          });
        }
      },
    };

    try {
      const response: AxiosResponse<DocumentMetadata> = await axios.post(
        this.apiUrl,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error uploading document');
      throw error;
    }
  }

  /**
   * Get all documents (with optional filtering)
   */
  async getDocuments(filters?: {
    caseId?: string;
    fileType?: string;
    uploadedBy?: string;
    status?: string;
  }): Promise<DocumentMetadata[]> {
    try {
      const response: AxiosResponse<DocumentMetadata[]> = await axios.get(
        this.apiUrl,
        { params: filters }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error fetching documents');
      throw error;
    }
  }

  /**
   * Get a single document by ID
   */
  async getDocument(id: string): Promise<DocumentMetadata> {
    try {
      const response: AxiosResponse<DocumentMetadata> = await axios.get(
        `${this.apiUrl}/${id}`
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'Error fetching document');

