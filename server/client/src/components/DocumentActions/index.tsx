import { useState } from 'react';
import { FiDownload, FiTrash2, FiShare2, FiEye } from 'react-icons/fi';
import ShareDocumentDialog from '../ShareDocumentDialog';
import { documentService } from '../../services/documentService';
import { useNotification } from '../../contexts/NotificationContext';
import './styles.css';

interface DocumentActionsProps {
  documentId: string;
  documentName: string;
  onView?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  showView?: boolean;
  showDelete?: boolean;
  showShare?: boolean;
  showDownload?: boolean;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  documentId,
  documentName,
  onView,
  onDelete,
  disabled = false,
  showView = true,
  showDelete = true,
  showShare = true,
  showDownload = true,
}) => {
  const [loading, setLoading] = useState<{
    download: boolean;
    delete: boolean;
    share: boolean;
  }>({
    download: false,
    delete: false,
    share: false,
  });
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { showNotification } = useNotification();

  const handleDownload = async () => {
    try {
      setLoading((prev) => ({ ...prev, download: true }));
      await documentService.downloadDocument(documentId);
      showNotification({
        type: 'success',
        message: 'Document downloaded successfully',
      });
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to download document',
      });
      console.error('Download error:', error);
    } finally {
      setLoading((prev) => ({ ...prev, download: false }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${documentName}?`)) {
      return;
    }
    
    try {
      setLoading((prev) => ({ ...prev, delete: true }));
      await documentService.deleteDocument(documentId);
      showNotification({
        type: 'success',
        message: 'Document deleted successfully',
      });
      if (onDelete) onDelete();
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to delete document',
      });
      console.error('Delete error:', error);
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  const handleShare = () => {
    setLoading((prev) => ({ ...prev, share: true }));
    // Open share dialog
    setShowShareDialog(true);
    setLoading((prev) => ({ ...prev, share: false }));
  };

  return (
    <div className="document-actions">
      {showView && (
        <button
          className="action-button view-button"
          onClick={onView}
          disabled={disabled}
          aria-label="View document"
        >
          <FiEye className="action-icon" />
        </button>
      )}

      {showDownload && (
        <button
          className={`action-button download-button ${loading.download ? 'loading' : ''}`}
          onClick={handleDownload}
          disabled={disabled || loading.download}
          aria-label="Download document"
        >
          {loading.download ? (
            <span className="loading-spinner"></span>
          ) : (
            <FiDownload className="action-icon" />
          )}
        </button>
      )}

      {showShare && (
        <button
          className={`action-button share-button ${loading.share ? 'loading' : ''}`}
          onClick={handleShare}
          disabled={disabled || loading.share}
          aria-label="Share document"
        >
          {loading.share ? (
            <span className="loading-spinner"></span>
          ) : (
            <FiShare2 className="action-icon" />
          )}
        </button>
      )}

      {showDelete && (
        <button
          className={`action-button delete-button ${loading.delete ? 'loading' : ''}`}
          onClick={handleDelete}
          disabled={disabled || loading.delete}
          aria-label="Delete document"
        >
          {loading.delete ? (
            <span className="loading-spinner"></span>
          ) : (
            <FiTrash2 className="action-icon" />
          )}
        </button>
      )}

      {showShareDialog && (
        <ShareDocumentDialog
          documentId={documentId}
          documentName={documentName}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
};

export default DocumentActions;

import React, { useState } from 'react';
import './styles.css';
import { documentService } from '../../services/documentService';
import { useNotification } from '../../contexts/NotificationContext';

interface DocumentActionsProps {
  documentId: string;
  documentUrl: string;
  documentName: string;
  documentType: string;
}

const DocumentActions: React.FC<DocumentActionsProps> = ({
  documentId,
  documentUrl,
  documentName,
  documentType
}) => {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});
  const { showNotification } = useNotification();
  
  const handleAction = async (action: string) => {
    setIsLoading(prev => ({ ...prev, [action]: true }));
    
    try {
      switch (action) {
        case 'download':
          await handleDownload();
          break;
        case 'print':
          handlePrint();
          break;
        case 'share':
          await handleShare();
          break;
        case 'delete':
          await handleDelete();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action} action:`, error);
      showNotification({
        type: 'error',
        message: `Failed to ${action} document. Please try again.`
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [action]: false }));
    }
  };

  const handleDownload = async () => {
    await documentService.downloadDocument(documentId, documentName);
    showNotification({
      type: 'success',
      message: 'Document downloaded successfully'
    });
  };

  const handlePrint = () => {
    const newWindow = window.open(documentUrl

