import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Toolbar,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Button,
  MenuItem,
  Menu,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';

// Mock data - this would be replaced by Redux state once you implement the casesSlice
const mockCases = [
  {
    id: '1',
    caseNumber: 'IMM-2023-001',
    caseType: 'Green Card',
    applicant: 'John Doe',
    status: 'Pending',
    priority: 'High',
    submissionDate: '2023-01-15',
    dueDate: '2023-06-30',
  },
  {
    id: '2',
    caseNumber: 'IMM-2023-002',
    caseType: 'Work Visa',
    applicant: 'Jane Smith',
    status: 'Approved',
    priority: 'Medium',
    submissionDate: '2023-02-10',
    dueDate: '2023-07-15',
  },
  {
    id: '3',
    caseNumber: 'IMM-2023-003',
    caseType: 'Family Petition',
    applicant: 'Robert Johnson',
    status: 'In Review',
    priority: 'Low',
    submissionDate: '2023-03-05',
    dueDate: '2023-08-20',
  },
];

const caseTypes = ['All', 'Green Card', 'Work Visa', 'Family Petition', 'Citizenship', 'Asylum'];
const caseStatuses = ['All', 'Pending', 'In Review', 'Approved', 'Rejected', 'On Hold'];
const casePriorities = ['All', 'High', 'Medium', 'Low'];

const CasesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // This would be used once you implement the cases reducer
  // const {
  //   filteredItems: filteredCases,
  //   loading,
  //   error,
  //   filters,
  //   sorting
  // } = useSelector((state) => state.cases);
  
  // Temporary state management until Redux implementation is complete
  const [filters, setFilters] = useState({
    searchQuery: '',
    type: 'All',
    status: 'All',
    priority: 'All'
  });
  
  const [sorting, setSorting] = useState({
    field: 'caseNumber',
    order: 'asc'
  });
  
  const [filteredCases, setFilteredCases] = useState(mockCases);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  
  // Apply filters and sorting
  useEffect(() => {
    let result = [...mockCases];
    
    // Apply search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.caseNumber.toLowerCase().includes(query) ||
          item.applicant.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (filters.type !== 'All') {
      result = result.filter((item) => item.caseType === filters.type);
    }
    
    // Apply status filter
    if (filters.status !== 'All') {
      result = result.filter((item) => item.status === filters.status);
    }
    
    // Apply priority filter
    if (filters.priority !== 'All') {
      result = result.filter((item) => item.priority === filters.priority);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const isAsc = sorting.order === 'asc';
      if (sorting.field === 'dueDate' || sorting.field === 'submissionDate') {
        return isAsc
          ? new Date(a[sorting.field]) - new Date(b[sorting.field])
          : new Date(b[sorting.field]) - new Date(a[sorting.field]);
      }
      return isAsc
        ? a[sorting.field].localeCompare(b[sorting.field])
        : b[sorting.field].localeCompare(a[sorting.field]);
    });
    
    setFilteredCases(result);
  }, [filters, sorting]);
  
  const handleRequestSort = (property) => {
    const isAsc = sorting.field === property && sorting.order === 'asc';
    setSorting({
      field: property,
      order: isAsc ? 'desc' : 'asc'
    });
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSearchChange = (event) => {
    setFilters({
      ...filters,
      searchQuery: event.target.value
    });
    setPage(0);
  };
  
  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };
  
  const handleFilterChange = (type, value) => {
    setFilters({
      ...filters,
      [type]: value
    });
    setPage(0);
  };
  
  const handleActionClick = (event, caseItem) => {
    setActionAnchorEl(event.currentTarget);
    setSelectedCase(caseItem);
  };
  
  const handleActionClose = () => {
    setActionAnchorEl(null);
    setSelectedCase(null);
  };
  
  const handleViewCase = () => {
    navigate(`/cases/${selectedCase.id}`);
    handleActionClose();
  };
  
  const handleNewCase = () => {
    navigate('/cases/new');
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
        return 'warning';
      case 'In Review':
        return 'info';
      case 'On Hold':
        return 'default';
      default:
        return 'default';
    }
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Immigration Cases
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar>
          <TextField
            size="small"
            placeholder="Search cases..."
            variant="outlined"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            sx={{ width: 250, mr: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              sx={{ mr: 2 }}
            >
              Filter
            </Button>
            
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              <Box sx={{ p: 2, minWidth: 200 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Case Type</InputLabel>
                  <Select
                    value={filters.type}
                    label="Case Type"
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    {caseTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {caseStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filters.priority}
                    label="Priority"
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                  >
                    {casePriorities.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Menu>
          </Box>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewCase}
          >
            New Case
          </Button>
        </Toolbar>
        
        {(filters.type !== 'All' || filters.status !== 'All' || filters.priority !== 'All') && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 2, py: 1 }}>
            {filters.type !== 'All' && (
              <Chip 
                label={`Type: ${filters.type}`}
                onDelete={() => handleFilterChange('type', 'All')}
                size="small"
              />
            )}
            {filters.status !== 'All' && (
              <Chip 
                label={`Status: ${filters.status}`}
                onDelete={() => handleFilterChange('status', 'All')}
                size="small"
              />
            )}
            {filters.priority !== 'All' && (
              <Chip 
                label={`Priority: ${filters.priority}`}
                onDelete={() => handleFilterChange('priority', 'All')}
                size="small"
              />
            )}
          </Box>
        )}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sorting.field === 'caseNumber'}
                    direction={sorting.field === 'caseNumber' ? sorting.order : 'asc'}
                    onClick={() => handleRequestSort('caseNumber')}
                  >
                    Case Number
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sorting.field === 'caseType'}
                    direction={sorting.field === 'caseType' ? sorting.order : 'asc'}
                    onClick={() => handleRequestSort('caseType')}
                  >
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sorting.field === 'applicant'}
                    direction={sorting.field === 'applicant' ? sorting.order : 'asc'}
                    onClick={() => handleRequestSort('applicant')}
                  >
                    Applicant
                  </TableSortLabel>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sorting.field === 'submissionDate'}
                    direction={sorting.field === 'submissionDate' ? sorting.order : 'asc'}
                    onClick={() => handleRequestSort('submissionDate')}
                  >
                    Submitted
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sorting.field === 'dueDate'}
                    direction={sorting.field === 'due
