/**
 * Utility functions for formatting data
 */

/**
 * Format a date to a readable format
 * @param dateString ISO date string or Date object
 * @param options date formatting options
 * @returns formatted date string
 */
export const formatDate = (
  dateString: string | Date | undefined | null,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  if (!dateString) return 'N/A';
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Format a date to include the time
 * @param dateString ISO date string or Date object
 * @returns formatted date and time string
 */
export const formatDateTime = (dateString: string | Date | undefined | null): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format a case number to a standardized format
 * @param caseNumber the raw case number
 * @returns formatted case number
 */
export const formatCaseNumber = (caseNumber: string | undefined | null): string => {
  if (!caseNumber) return 'N/A';
  
  // If the case number follows the format XXX-XXX-XXX-XXX
  const caseRegex = /^([A-Z0-9]{3})-?([A-Z0-9]{3})-?([A-Z0-9]{3})-?([A-Z0-9]{3})$/;
  
  if (caseRegex.test(caseNumber)) {
    return caseNumber.replace(caseRegex, '$1-$2-$3-$4');
  }
  
  // Return as is if it doesn't match the expected format
  return caseNumber;
};

/**
 * Case status options
 */
export enum CaseStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  PENDING_DOCUMENTS = 'pending_documents',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  DENIED = 'denied',
  APPEALED = 'appealed',
  CLOSED = 'closed'
}

/**
 * Get a human-readable label for a case status
 * @param status the case status code
 * @returns formatted status label
 */
export const formatCaseStatus = (status: string | undefined | null): string => {
  if (!status) return 'Unknown';
  
  const statusMappings: Record<string, string> = {
    [CaseStatus.NEW]: 'New',
    [CaseStatus.IN_PROGRESS]: 'In Progress',
    [CaseStatus.PENDING_DOCUMENTS]: 'Pending Documents',
    [CaseStatus.PENDING_REVIEW]: 'Pending Review',
    [CaseStatus.APPROVED]: 'Approved',
    [CaseStatus.DENIED]: 'Denied',
    [CaseStatus.APPEALED]: 'Appealed',
    [CaseStatus.CLOSED]: 'Closed'
  };
  
  return statusMappings[status] || 'Unknown';
};

/**
 * Get the appropriate CSS class for a case status
 * @param status the case status code
 * @returns CSS class name
 */
export const getCaseStatusClass = (status: string | undefined | null): string => {
  if (!status) return 'status-unknown';
  
  const statusClasses: Record<string, string> = {
    [CaseStatus.NEW]: 'status-new',
    [CaseStatus.IN_PROGRESS]: 'status-in-progress',
    [CaseStatus.PENDING_DOCUMENTS]: 'status-pending',
    [CaseStatus.PENDING_REVIEW]: 'status-pending',
    [CaseStatus.APPROVED]: 'status-approved',
    [CaseStatus.DENIED]: 'status-denied',
    [CaseStatus.APPEALED]: 'status-appealed',
    [CaseStatus.CLOSED]: 'status-closed'
  };
  
  return statusClasses[status] || 'status-unknown';
};

