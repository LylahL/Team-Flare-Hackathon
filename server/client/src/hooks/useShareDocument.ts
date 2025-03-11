import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/constants';

interface ShareDocumentParams {
  documentId: string;
  emails?: string[];
  expiresInDays?: number;
  message?: string;
  permissions?: 'view' | 'download' | 'edit';
}

interface ShareResponse {
  shareId: string;
  shareLink: string;
  expiresAt: string;
}

/**
 * Custom hook for document sharing functionality
 */
export const useShareDocument = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  
  /**
   * Generate a sharing link for a document
   */
  const generateShareLink = async (
    documentId: string, 
    expiresInDays: number = 7,
    permissions: 'view' | 'download' | 'edit' = 'view'
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post<ShareResponse>(
        `${API_URL}/documents/${documentId}/share/link`, 
        { expiresInDays, permissions }
      );
      
      const link = response.data.shareLink;
      setShareLink(link);
      return link;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate share link';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Share document with specific recipients via email
   */
  const shareDocumentViaEmail = async ({
    documentId,
    emails,
    expiresInDays = 7,
    message = '',
    permissions = 'view'
  }: ShareDocumentParams): Promise<void> => {
    if (!emails || emails.length === 0) {
      setError('At least one email address is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await axios.post(`${API_URL}/documents/${documentId}/share/email`, {
        emails,
        expiresInDays,
        message,
        permissions
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to share document';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Revoke a previously shared document
   */
  const revokeSharing = async (shareId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${API_URL}/documents/share/${shareId}`);
      setShareLink(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to revoke sharing';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get all active shares for a document
   */
  const getActiveShares = async (documentId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${API_URL}/documents/${documentId}/shares`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch active shares';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    shareLink,
    generateShareLink,
    shareDocumentViaEmail,
    revokeSharing,
    getActiveShares
  };
};

import { useState, useCallback } from 'react';
import axios from 'axios';

interface ShareDocumentHook {
  shareDocumentByEmail: (documentId: string, email: string, permission: 'view' | 'edit') => Promise<boolean>;
  generateShareLink: (documentId: string, permission: 'view' | 'edit') => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  success: string | null;
  clearError: () => void;
  clearSuccess: () => void;
}

export const useShareDocument = (): ShareDocumentHook => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess(null);
  }, []);

  const shareDocumentByEmail = useCallback(
    async (documentId: string, email: string, permission: 'view' | 'edit'): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address');
        }

        // Make API call to share document
        const response = await axios.post('/api/documents/share/email', {
          documentId,
          email,
          permission
        });

        setSuccess(`Document has been shared with ${email}`);
        setIsLoading(false);
        return true;
      } catch (err) {
        const errorMessage = 
          err instanceof Error 
            ? err.message 
            : 'Failed to share document. Please try again.';
            
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
    },
    

