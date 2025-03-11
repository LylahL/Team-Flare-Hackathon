import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './styles.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export interface DocumentPreviewProps {
  file: File | string; // Can be a File object or a URL string
  className?: string;
  maxHeight?: string | number;
  maxWidth?: string | number;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  file,
  className = '',
  maxHeight = '500px',
  maxWidth = '100%',
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!file) {
      setError('No file provided');
      setLoading(false);
      return;
    }

    // Handle the file based on its type (URL string or File object)
    if (typeof file === 'string') {
      setPreview(file);
      // Try to determine file type from URL
      const extension = file.split('.').pop()?.toLowerCase() || '';
      setFileType(getFileTypeFromExtension(extension));
      setLoading(false);
    } else {
      // It's a File object
      setFileType(file.type);
      
      // Create a preview URL for the file
      const reader = new FileReader();
      reader.onloadstart = () => setLoading(true);
      reader.onload = () => {
        setPreview(reader.result as string);
        setLoading(false);
      };
      reader.onerror = () => {
        setError('Failed to load file');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    }

    // Cleanup function to revoke object URL when component unmounts or file changes
    return () => {
      if (preview && typeof file !== 'string') {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file]);

  const getFileTypeFromExtension = (extension: string): string => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const pdfExtensions = ['pdf'];
    const docExtensions = ['doc', 'docx'];
    const xlsExtensions = ['xls', 'xlsx'];
    const txtExtensions = ['txt', 'md', 'rtf'];

    if (imageExtensions.includes(extension)) return 'image';
    if (pdfExtensions.includes(extension)) return 'application/pdf';
    if (docExtensions.includes(extension)) return 'application/msword';
    if (xlsExtensions.includes(extension)) return 'application/excel';
    if (txtExtensions.includes(extension)) return 'text/plain';
    
    return '';
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
  };

  const changePage = (offset: number) => {
    if (numPages) {
      setPageNumber(prevPageNumber => {
        const newPage = prevPageNumber + offset;
        return newPage >= 1 && newPage <= numPages ? newPage : prevPageNumber;
      });
    }
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const renderPreview = () => {
    if (loading) {
      return <div className="document-preview-loading">Loading preview...</div>;
    }

    if (error) {
      return <div className="document-preview-error">{error}</div>;
    }

    if (!preview) {
      return <div className="document-preview-placeholder">No preview available</div>;
    }

    // Check file type and render appropriate preview
    if (fileType.startsWith('image/') || fileType === 'image') {
      return (
        <div className="document-preview-image-container">
          <img 
            src={preview} 
            alt="Document preview" 
            className="document-preview-image" 
            style={{ maxHeight, maxWidth }}
          />
        </div>
      );
    } else if (fileType === 'application/pdf') {
      return (
        <div className="document-preview-pdf-container">
          <Document
            file={preview}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={() => setError('Failed to load PDF')}
            className="document-preview-pdf"
          >
            <Page 
              pageNumber={pageNumber} 
              width={Number(maxWidth) < 100 ? Number(maxWidth) : undefined}
              height={Number(maxHeight) < 100 ? Number(maxHeight) : undefined}
            />
          </Document>
          {numPages && numPages > 1 && (
            <div className="document-preview-pdf-controls">
              <button 
                onClick={previousPage} 
                disabled={pageNumber <= 1}
                className="document-preview-pdf-button"
              >
                Previous
              </button>
              <span className="document-preview-pdf-pages">
                Page {pageNumber} of {numPages}
              </span>
              <button 
                onClick={nextPage} 
                disabled={pageNumber >= (numPages || 1)}
                className="document-preview-pdf-button"
              >
                Next
              </button>
            </div>
          )}
        </div>
      );
    } else if (fileType === 'text/plain') {
      // For text files, we can try to display the content
      return (
        <div className="document-preview-text-container">
          <iframe 
            src={preview} 
            title="Text preview"
            className="document-preview-text"
            style={{ maxHeight, maxWidth }}
          ></iframe>
        </div>
      );
    } else if (fileType.includes('word') || fileType.includes('excel') || fileType.includes('spreadsheet')) {
      // For Office documents, show icon and filename
      return (
        <div className="document-preview-office">
          <div className="document-preview-office-icon">
            {fileType.includes('word') ? 'Word Document' : 'Spreadsheet'}
          </div>
          <div className="document-preview-filename">
            {typeof file === 'string' ? file.split('/').pop() : file.name}
          </div>
          <div className="document-preview-download">
            <a href={preview} download target="_blank" rel="noopener noreferrer">
              Download to view
            </a>
          </div>
        </div>
      );
    } else {
      // Fallback for unsupported file types
      return (
        <div className="document-preview-unsupported">
          <div className="document-preview-unsupported-icon">
            Unsupported File Type
          </div>
          <div className="document-preview-filename">
            {typeof file === 'string' ? file.split('/').pop() : file.name}
          </div>
          <div className="document-preview-download">
            <a href={preview} download target="_blank" rel="noopener noreferrer">
              Download file
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={`document-preview ${className}`}>
      {renderPreview()}
    </div>
  );
};

export default DocumentPreview;

import React, { useState, useEffect } from 'react';
import { FiFileText, FiImage, FiFile, FiDownload } from 'react-icons/fi';
import './styles.css';

interface DocumentPreviewProps {
  file: File;
  url?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file, url }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('unknown');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file && !url) {
      setError('No file or URL provided for preview');
      setLoading(false);
      return;
    }

    const fileUrl = url || URL.createObjectURL(file);
    setPreviewUrl(fileUrl);

    // Determine file type
    const fileName = file ? file.name : url?.split('/').pop() || '';
    

