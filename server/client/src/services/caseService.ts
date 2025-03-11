import apiService from '../utils/api';
import { CaseStatus } from '../utils/formatters';

// Case types
export interface CaseFile {
  id: string;
  caseNumber: string;
  clientName: string;
  clientId: string;
  status: CaseStatus;
  type: string;
  filingDate: string;
  lastUpdated: string;
  assignedTo: string | null;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface CaseCreatePayload {
  clientName: string;
  clientId: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface CaseUpdatePayload {
  status?: CaseStatus;
  assignedTo?: string | null;
  priority?: 'low' | 'medium' | 'high';
  notes?: string;
}

export interface CaseFilterOptions {
  status?: CaseStatus | CaseStatus[];
  priority?: string | string[];
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Service for handling case-related API calls
 */
const caseService = {
  /**
   * Get all cases with optional filtering
   * @param filters Filter options for cases
   * @returns Promise with case list
   */
  getCases: (filters: CaseFilterOptions = {}): Promise<{ cases: CaseFile[], total: number }> => {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    return apiService.get(`/cases?${queryParams.toString()}`);
  },
  
  /**
   * Get a single case by ID
   * @param id Case ID
   * @returns Promise with case details
   */
  getCaseById: (id: string): Promise<CaseFile> => {
    return apiService.get(`/cases/${id}`);
  },
  
  /**
   * Create a new case
   * @param caseData Case creation data
   * @returns Promise with created case
   */
  createCase: (caseData: CaseCreatePayload): Promise<CaseFile> => {
    return apiService.post('/cases', caseData);
  },
  
  /**
   * Update an existing case
   * @param id Case ID
   * @param caseData Updated case data
   * @returns Promise with updated case
   */
  updateCase: (id: string, caseData: CaseUpdatePayload): Promise<CaseFile> => {
    return apiService.put(`/cases/${id}`, caseData);
  },
  
  /**
   * Delete a case
   * @param id Case ID
   * @returns Promise with deletion confirmation
   */
  deleteCase: (id: string): Promise<{ success: boolean, message: string }> => {
    return apiService.delete(`/cases/${id}`);
  },
  
  /**
   * Update case status
   * @param id Case ID
   * @param status New status
   * @returns Promise with updated case
   */
  updateCaseStatus: (id: string, status: CaseStatus): Promise<CaseFile> => {
    return apiService.patch(`/cases/${id}/status`, { status });
  },
  
  /**
   * Assign a case to a user
   * @param id Case ID
   * @param userId User ID (or null to unassign)
   * @returns Promise with updated case
   */
  assignCase: (id: string, userId: string | null): Promise<CaseFile> => {
    return apiService.patch(`/cases/${id}/assign`, { assignedTo: userId });
  },
  
  /**
   * Get case statistics
   * @returns Promise with case statistics
   */
  getCaseStatistics: (): Promise<{
    totalCases: number;
    byStatus: Record<CaseStatus, number>;
    byPriority: Record<string, number>;
  }> => {
    return apiService.get('/cases/statistics');
  },
  
  /**
   * Export cases to CSV or PDF
   * @param format Export format ('csv' or 'pdf')
   * @param filters Filter options for cases to export
   * @returns Promise with file URL
   */
  exportCases: (
    format: 'csv' | 'pdf', 
    filters: CaseFilterOptions = {}
  ): Promise<{ fileUrl: string }> => {
    const queryParams = new URLSearchParams();
    queryParams.append('format', format);
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value.toString());
        }
      }
    });
    
    return apiService.get(`/cases/export?${queryParams.toString()}`);
  }
};

export default caseService;

