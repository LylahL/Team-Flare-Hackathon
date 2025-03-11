import React, { useState, useEffect } from 'react';
import './styles.css';
import { Document, Page, pdfjs } from 'react-pdf';
import DocumentActions from '../DocumentActions';
import { Spinner } from '../common/Spinner';

// Set worker path for PDF.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentType: string;
  documentId: string;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType,
  documentId
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('Error while loading document:', error);
    setError('Failed to load document. Please try again later.');
    setLoading(false);
  };

  const handlePrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber(prevPage => Math.min(prevPage + 1, numPages || 1));
  };

  if (!isOpen) return null;

  const renderDocumentViewer = () => {
    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
    
    if (loading) {
      return (
        <div className="document-loading">
          <Spinner size="large" />
          <p>Loading document...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="document-error">
          <div className="error-icon">!</div>
          <h3>Error Loading Document</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={() => setLoading(true)}>
            Retry
          </button>
        </div>
      );
    }

    switch (fileExtension) {
      case 'pdf':
        return (
          <div className="pdf-container">
            <Document
              file={documentUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={<Spinner size="medium" />}
            >
              <Page pageNumber={pageNumber} />
            </Document>
            
            {numPages && numPages > 1 && (
              <div className="pdf-controls">
                <button 
                  onClick={handlePrevPage} 
                  disabled={pageNumber <= 1}
                  className="page-control-button"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {pageNumber} of {numPages}
                </span>
                <button 
                  onClick={handleNextPage} 
                  disabled={pageNumber >= numPages}
                  className="page-control-button"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );
      
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="image-container">
            <img 
              src={documentUrl} 
              alt={documentName} 
              className="document-image"
              onLoad={() => setLoading(false)}
              onError={() => handleDocumentLoadError(new Error('Failed to load image'))}
            />
          </div>
        );
      
      case 'doc':
      case 'docx':
        return (
          <div className="office-viewer">
            <iframe 
              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(documentUrl)}`}
              title={documentName}
              width="100%"
              height="600px"
              frameBorder="0"
              onLoad={() => setLoading(false)}
              onError={() => handleDocumentLoadError(new Error('Failed to load document'))}
            />
          </div>
        );
        
      default:
        return (
          <div className="unsupported-file">
            <div className="file-icon">
              <i className="fa fa-file" aria-hidden="true"></i>
            </div>
            <h3>File Preview Unavailable</h3>
            <p>This file type ({fileExtension}) cannot be previewed.</p>
            <div className="document-download-prompt">
              <p>You can download the file to view it on your device.</p>
              <button className="download-button" onClick={() => window.open(documentUrl, '_blank')}>
                Download File
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="document-viewer-modal-overlay">
      <div className="document-viewer-modal">
        <div className="document-viewer-header">
          <h2 className="document-title">{documentName}</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="document-viewer-content">
          {renderDocumentViewer()}
        </div>
        
        <div className="document-viewer-footer">
          <DocumentActions 
            documentId={documentId}
            documentUrl={documentUrl} 
            documentName={documentName}
            documentType={documentType}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentViewerModal;

