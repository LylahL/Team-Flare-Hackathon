import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles.css';

// Interface for Case object
interface Case {
  id: string;
  caseNumber: string;
  applicantName: string;
  status: string;
  caseType: string;
  dateSubmitted: string;
  lastUpdated: string;
}

// Mock data for cases - this would be replaced with API calls
const mockCases: Case[] = [
  {
    id: '1',
    caseNumber: 'IMM-2023-0001',
    applicantName: 'John Smith',
    status: 'In Progress',
    caseType: 'Green Card',
    dateSubmitted: '2023-01-15',
    lastUpdated: '2023-06-20',
  },
  {
    id: '2',
    caseNumber: 'IMM-2023-0002',
    applicantName: 'Maria Rodriguez',
    status: 'Approved',
    caseType: 'Naturalization',
    dateSubmitted: '2022-11-05',
    lastUpdated: '2023-05-12',
  },
  {
    id: '3',
    caseNumber: 'IMM-2023-0003',
    applicantName: 'Ahmed Hassan',
    status: 'Pending Review',
    caseType: 'Work Visa',
    dateSubmitted: '2023-03-22',
    lastUpdated: '2023-06-15',
  },
  {
    id: '4',
    caseNumber: 'IMM-2023-0004',
    applicantName: 'Priya Patel',
    status: 'Document Request',
    caseType: 'Family Visa',
    dateSubmitted: '2023-02-10',
    lastUpdated: '2023-06-01',
  },
  {
    id: '5',
    caseNumber: 'IMM-2023-0005',
    applicantName: 'Carlos Gomez',
    status: 'In Progress',
    caseType: 'Student Visa',
    dateSubmitted: '2023-04-18',
    lastUpdated: '2023-06-22',
  },
  {
    id: '6',
    caseNumber: 'IMM-2023-0006',
    applicantName: 'Lisa Chen',
    status: 'Approved',
    caseType: 'Work Visa',
    dateSubmitted: '2022-12-30',
    lastUpdated: '2023-04-15',
  },
];

const Cases: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [caseTypeFilter, setCaseTypeFilter] = useState('');
  const [sortField, setSortField] = useState('dateSubmitted');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [casesPerPage] = useState(5);

  // Load cases on component mount
  useEffect(() => {
    // In a real application, this would be an API call
    setCases(mockCases);
    setFilteredCases(mockCases);
  }, []);

  // Filter and sort cases when filter criteria change
  useEffect(() => {
    let result = [...cases];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (caseItem) =>
          caseItem.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter((caseItem) => caseItem.status === statusFilter);
    }
    
    // Apply case type filter
    if (caseTypeFilter) {
      result = result.filter((caseItem) => caseItem.caseType === caseTypeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField as keyof Case];
      const bValue = b[sortField as keyof Case];
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredCases(result);
    setCurrentPage(1);
  }, [cases, searchTerm, statusFilter, caseTypeFilter, sortField, sortDirection]);

  // Get status class for styling
  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'Approved':
        return 'status-approved';
      case 'Pending Review':
        return 'status-pending';
      case 'Document Request':
        return 'status-document';
      case 'In Progress':
        return 'status-progress';
      default:
        return '';
    }
  };

  // Pagination logic
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="cases-container">
      <div className="cases-header">
        <h1>My Cases</h1>
        <Link to="/cases/new" className="new-case-button">
          + New Case
        </Link>
      </div>

      <div className="filter-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or case number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="filter-options">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="In Progress">In Progress</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Document Request">Document Request</option>
          </select>

          <select
            value={caseTypeFilter}
            onChange={(e) => setCaseTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Case Types</option>
            <option value="Green Card">Green Card</option>
            <option value="Naturalization">Naturalization</option>
            <option value="Work Visa">Work Visa</option>
            <option value="Family Visa">Family Visa</option>
            <option value="Student Visa">Student Visa</option>
          </select>
        </div>
      </div>

      <div className="cases-table">
        <div className="cases-table-header">
          <div className="table-header-cell" onClick={() => handleSort('caseNumber')}>
            Case #
            {sortField === 'caseNumber' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
              </span>
            )}
          </div>
          <div className="table-header-cell" onClick={() => handleSort('applicantName')}>
            Applicant Name
            {sortField === 'applicantName' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
              </span>
            )}
          </div>
          <div className="table-header-cell" onClick={() => handleSort('status')}>
            Status
            {sortField === 'status' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
              </span>
            )}
          </div>
          <div className="table-header-cell" onClick={() => handleSort('caseType')}>
            Case Type
            {sortField === 'caseType' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
              </span>
            )}
          </div>
          <div className="table-header-cell" onClick={() => handleSort('dateSubmitted')}>
            Date Submitted
            {sortField === 'dateSubmitted' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
              </span>
            )}
          </div>
          <div className="table-header-cell" onClick={() => handleSort('lastUpdated')}>
            Last Updated
            {sortField === 'lastUpdated' && (
              <span className="sort-indicator">
                {sortDirection === 'asc' ? ' ↑' : ' ↓'}
              </span>
            )}
          </div>
          <div className="table-header-cell">Actions</div>
        </div>

        {currentCases.length > 0 ? (
          currentCases.map((caseItem) => (
            <div key={caseItem.id} className="cases-table-row">
              <div className="table-cell">{caseItem.caseNumber}</div>
              <div className="table-cell">{caseItem.applicantName}</div>
              <div className="table-cell">
                <span className={`status-badge ${getStatusClass(caseItem.status)}`}>
                  {caseItem.status}
                </span>
              </div>
              <div className="table-cell">{caseItem.caseType}</div>
              <div className="table-cell">{caseItem.dateSubmitted}</div>
              <div className="table-cell">{caseItem.lastUpdated}</div>
              <div className="table-cell actions">
                <Link to={`/cases/${caseItem.id}`} className="view-button">
                  View
                </Link>
                <button className="edit-button">Edit</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-cases">
            <p>No cases found matching your criteria.</p>
          </div>
        )}
      </div>

      {filteredCases.length > 0 && (
        <div className="pagination">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Cases;

