import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { API_URL } from '../../config/constants';
import DocumentPreview from '../DocumentPreview';
import { Spinner } from '../common/Spinner';
import './styles.css';

// Set worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Types for shared document data
interface SharedDocumentData {
  documentId: string;
  documentName: string;
  documentType: string;
  documentUrl: string;
  sharedBy: {
    name: string;
    email: string;
  };
  permissions: 'view' | 'edit' | 'download';
  expiresAt: string;
}

const SharedDocumentViewer: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [documentData, setDocumentData] = useState<SharedDocumentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchSharedDocument = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`${API_URL}/documents/shared/${token}`);
        setDocumentData(response.data);
      } catch (err: any) {
        console.error('Error fetching shared document:', err);
        
        if (err.response?.status === 403 || err.response?.status === 401) {
          setAccessDenied(true);
          setError(err.response.data.message || 'Access denied. This link may have expired or been revoked.');
        } else {
          setError('Unable to load the document. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (token) {
      fetchSharedDocument();
    }
  }, [token]);
  
  const handleDownload = async () => {
    if (!documentData) return;
    
    try {
      const response = await axios.get(`${API_URL}/documents/shared/${token}/download`, {
        responseType: 'blob'
      });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', documentData.documentName);
      
      // Append to the DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download the document.');
    }
  };
  
  const renderExpirationMessage = () => {
    if (!documentData) return null;
    
    const expirationDate = new Date(documentData.expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    
    return (
      <div className="expiration-message">
        {daysRemaining <= 3 ? (
          <p className="expiring-soon">
            Access to this document expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}.
          </p>
        ) : (
          <p>
            Access expires on {expirationDate.toLocaleDateString()}.
          </p>
        )}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="shared-document-container loading">
        <Spinner size="large" />
        <p>Loading document...</p>
      </div>
    );
  }
  
  if (accessDenied || error) {
    return (
      <div className="shared-document-container error">
        <div className="error-icon">!</div>
        <h2>Access Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')} className="primary-button">
          Return Home
        </button>
      </div>
    );
  }
  
  if (!documentData) {
    return (
      <div className="shared-document-container error">
        <p>No document data available.</p>
      </div>
    );
  }
  
  return (
    <div className="shared-document-container">
      <div className="shared-document-header">
        <h1>{documentData.documentName}</h1>
        <div className="shared-document-info">
          <p>Shared by: {documentData.sharedBy.name}</p>
          {renderExpirationMessage()}
        </div>
      </div>
      
      <div className="shared-document-content">
        {documentData.documentUrl && (
          <DocumentPreview 
            file={documentData.documentUrl} 
            className="shared-document-preview"
          />
        )}
      </div>
      
      <div className="shared-document-actions">
        {documentData.permissions === 'download' || documentData.permissions === 'edit' ? (
          <button 
            onClick={handleDownload} 
            className="download-button"
          >
            Download Document
          </button>
        ) : (
          <p className="permissions-note">You have view-only access to this document.</p>
        )}
        
        {documentData.permissions === 'edit' && (
          <button className="edit-button">
            Edit Document
          </button>
        )}
      </div>
    </div>
  );
};

export default SharedDocumentViewer;

