import React, { useState, useEffect } from 'react';
import { useShareDocument } from '../../hooks/useShareDocument';
import './styles.css';

interface ShareDocumentDialogProps {
  documentId: string;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareDocumentDialog: React.FC<ShareDocumentDialogProps> = ({
  documentId,
  documentName,
  isOpen,
  onClose
}) => {
  const [email, setEmail] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');
  const [showCopied, setShowCopied] = useState<boolean>(false);
  const [shareOption, setShareOption] = useState<'email' | 'link'>('email');
  const [permission, setPermission] = useState<'view' | 'edit'>('view');
  
  const { 
    shareDocumentByEmail, 
    generateShareLink, 
    isLoading, 
    error, 
    clearError,
    success
  } = useShareDocument();

  // Generate share link when dialog opens
  useEffect(() => {
    if (isOpen && documentId) {
      handleGenerateLink();
    }
    
    return () => {
      clearError();
      setEmail('');
      setShowCopied(false);
    };
  }, [isOpen, documentId, clearError]);

  const handleGenerateLink = async () => {
    const link = await generateShareLink(documentId, permission);
    if (link) {
      setShareLink(link);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePermissionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPermission = e.target.value as 'view' | 'edit';
    setPermission(newPermission);
    
    if (shareOption === 'link') {
      // Regenerate link with new permission
      const link = await generateShareLink(documentId, newPermission);
      if (link) {
        setShareLink(link);
      }
    }
  };

  const handleShareOptionChange = (option: 'email' | 'link') => {
    setShareOption(option);
    clearError();
  };

  const handleShareByEmail = async () => {
    if (!email.trim()) return;
    
    await shareDocumentByEmail(documentId, email, permission);
    if (!error) {
      setEmail('');
    }
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="share-dialog-overlay">
      <div className="share-dialog-container">
        <div className="share-dialog-header">
          <h2>Share "{documentName}"</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="share-dialog-tabs">
          <button 
            className={`tab-button ${shareOption === 'email' ? 'active' : ''}`}
            onClick={() => handleShareOptionChange('email')}
          >
            Share by Email
          </button>
          <button 
            className={`tab-button ${shareOption === 'link' ? 'active' : ''}`}
            onClick={() => handleShareOptionChange('link')}
          >
            Get Link
          </button>
        </div>
        
        <div className="share-dialog-content">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="permission-selector">
            <label htmlFor="permission">Permission:</label>
            <select 
              id="permission" 
              value={permission} 
              onChange={handlePermissionChange}
            >
              <option value="view">Can view</option>
              <option value="edit">Can edit</option>
            </select>
          </div>
          
          {shareOption === 'email' ? (
            <div className="email-share-container">
              <div className="input-group">
                <input 
                  type="email" 
                  value={email} 
                  onChange={handleEmailChange} 
                  placeholder="Enter email address"
                  disabled={isLoading}
                />
                <button 
                  className="share-button"
                  onClick={handleShareByEmail}
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? 'Sharing...' : 'Share'}
                </button>
              </div>
            </div>
          ) : (
            <div className="link-share-container">
              <div className="input-group">
                <input 
                  type="text" 
                  value={shareLink} 
                  readOnly 
                  className="share-link-input"
                />
                <button 
                  className="copy-button"
                  onClick={copyLinkToClipboard}
                  disabled={!shareLink}
                >
                  {showCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareDocumentDialog;

import { useState, useEffect } from 'react';
import { FiX, FiMail, FiLink, FiCopy, FiCheck } from 'react-icons/fi';
import { documentService } from '../../services/documentService';
import { useNotification } from '../../contexts/NotificationContext';
import './styles.css';

interface ShareDocumentDialogProps {
  documentId: string;
  documentName: string;
  onClose: () => void;
}

interface ShareOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const ShareDocumentDialog: React.FC<ShareDocumentDialogProps> = ({
  documentId,
  documentName,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [copied, setCopied] = useState(false);
  const { showNotification } = useNotification();
  const [users, setUsers] = useState<Array<{ id: string, name: string, email: string }>>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // This would be implemented in an actual app
        // const response = await userService.getUsers();
        // setUsers(response.data);
        // Mock data for demo
        setUsers([
          { id: '1', name: 'John Doe', email: 'john@example.com' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
          { id: '3', name: 'Mark Johnson', email: 'mark@example.com' },
        ]);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const generateShareableLink = async () => {
      try {
        // In a real app, this would call an API to generate a unique link
        // const response = await documentService.generateShareableLink(documentId);
        // setShareableLink(response.data.link);
        
        // Mock link for demo
        setShareableLink(`https://app.example.com/shared/doc/${documentId}?token=xyz123`);
      } catch (error) {
        console.error('Error generating link:', error);
      }
    };

    fetchUsers();
    generateShareableLink();
  }, [documentId]);

  const shareOptions: ShareOption[] = [
    {
      id: 'email',
      label: 'Share via Email',
      description: 'Send an email invitation',
      icon: <FiMail />,
    },
    {
      id: 'link',
      label: 'Share via Link',
      description: 'Create a shareable link',
      icon: <FiLink />,
    },
  ];

  const [activeOption, setActiveOption] = useState(shareOptions[0].id);

  const handleShareByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showNotification({
        type: 'error',
        message: 'Please enter a valid email address',
      });
      return;
    }

    setLoading(true);
    
    try {
      // This would be implemented in a real app
      // await documentService.shareDocument(documentId, email, permission);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification({
        type: 'success',
        message: `Document shared with ${email} successfully`,
      });
      
      setEmail('');
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to share document',
      });
      console.error('Share error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      showNotification({
        type: 'success',
        message: 'Link copied to clipboard',
      });
      
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to copy link',
      });
    }
  };

  return (
    <div className="share-dialog-overlay">
      <div className="share-dialog-container" onClick={e => e.stopPropagation()}>
        <div className="share-dialog-header">
          <h2>Share "{documentName}"</h2>
          <button className="close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="share-options">
          {shareOptions.map(option => (
            <button
              key={option.id}
              className={`share-option-button ${activeOption === option.id ? 'active' : ''}`}
              onClick={() => setActiveOption(option.id)}
            >
              <div className="share-option-icon">{option.icon}</div>
              <div className="share-option-text">
                <span className="share-option-label">{option.label}</span>
                <span className="share-option-description">{option.description}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="share-dialog-content">
          {activeOption === 'email' && (
            <form onSubmit={handleShareByEmail}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="permission">Permission</label>
                <select
                  id="permission"
                  value={permission}
                  onChange={(e) => setPermission(e.target.value)}
                >
                  <option value="view">View only</option>
                  <option value="comment">Can comment</option>
                  <option value="edit">Can edit</option>
                </select>
              </div>
              
              <div className="share-users-list">
                <h3>Already shared with</h3>
                {users.length > 0 ? (
                  <ul>
                    {users.map(user => (
                      <li key={user.id}>
                        <div className="

