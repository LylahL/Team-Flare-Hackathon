import React, { useState, useEffect } from 'react';
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
  Select
} from '@mui/material';
import { 
  Search as SearchIcon, 
  FilterList as FilterListIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration purposes
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
    caseType: 'Visa',
    applicant: 'Jane Smith',
    status: 'Approved',
    priority: 'Medium',
    submissionDate: '2023-02-10',
    dueDate: '2023-07-15',
  },
  {
    id: '3',
    caseNumber: 'IMM-2023-003',
    caseType: 'Citizenship',
    applicant: 'Robert Johnson',
    status: 'In Review',
    priority: 'Low',
    submissionDate: '2023-03-05',
    dueDate: '2023-08-20',
  },
  {
    id: '4',
    caseNumber: 'IMM-2023-004',
    caseType: 'DACA',
    applicant: 'Maria Garcia',
    status: 'Pending',
    priority: 'High',
    submissionDate: '2023-03-15',
    dueDate: '2023-09-01',
  },
  {
    id: '5',
    caseNumber: 'IMM-2023-005',
    caseType: 'Asylum',
    applicant: 'Ahmed Khan',
    status: 'Submitted',
    priority: 'High',
    submissionDate: '2023-04-02',
    dueDate: '2023-10-15',
  },
  {
    id: '6',
    caseNumber: 'IMM-2023-006',
    caseType: 'Green Card',
    applicant: 'Sarah Wilson',
    status: 'In Review',
    priority: 'Medium',
    submissionDate: '2023-04-18',
    dueDate: '2023-11-05',
  },
  {
    id: '7',
    caseNumber: 'IMM-2023-007',
    caseType: 'Visa',
    applicant: 'David Brown',
    status: 'Denied',
    priority: 'Low',
    submissionDate: '2023-05-10',
    dueDate: '2023-12-01',
  },
];

const caseTypes = ['All', 'Green Card', 'Visa', 'Citizenship', 'DACA', 'Asylum'];
const statusOptions = ['All', 'Pending', 'Submitted', 'In Review', 'Approved', 'Denied'];
const priorityOptions = ['All', 'High', 'Medium', 'Low'];

const CasesPage = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  // Sorting state
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('caseNumber');
  
  // Filtering state
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Action menu state
  const [actionAnchorEl, setActionAnchorEl] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchCases = async () => {
      try {
        // In a real application, this would be an API call
        // const response = await axios.get('/api/cases');
        // setCases(response.data);
        setCases(mockCases);
        setFilteredCases(mockCases);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cases:', error);
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  useEffect(() => {
    // Apply filters whenever filter state changes
    applyFilters();
  }, [searchQuery, filterType, filterStatus, filterPriority, cases]);

  const applyFilters = () => {
    let result = [...cases];

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (caseItem) =>
          caseItem.caseNumber.toLowerCase().includes(query) ||
          caseItem.applicant.toLowerCase().includes(query)
      );
    }

    // Apply case type filter
    if (filterType !== 'All') {
      result = result.filter((caseItem) => caseItem.caseType === filterType);
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      result = result.filter((caseItem) => caseItem.status === filterStatus);
    }

    // Apply priority filter
    if (filterPriority !== 'All') {
      result = result.filter((caseItem) => caseItem.priority === filterPriority);
    }

    // Apply sorting
    result = result.sort((a, b) => {
      const isAsc = order === 'asc';
      if (orderBy === 'dueDate' || orderBy === 'submissionDate') {
        return isAsc 
          ? new Date(a[orderBy]) - new Date(b[orderBy])
          : new Date(b[orderBy]) - new Date(a[orderBy]);
      }
      
      return isAsc
        ? a[orderBy].localeCompare(b[orderBy])
        : b[orderBy].localeCompare(a[orderBy]);
    });

    setFilteredCases(result);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'type':
        setFilterType(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      case 'priority':
        setFilterPriority(value);
        break;
      default:
        break;
    }
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
      case 'Pending':
      case 'Submitted':
        return 'warning';
      case 'In Review':
        return 'info';
      case 'Denied':
        return 'error';
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

  // Calculate days until due date
  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Immigration Cases
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Toolbar sx={{ pl: 2, pr: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search cases..."
              variant="outlined"
              value={searchQuery}
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
            
            <Button 
              variant="outlined"
              onClick={handleFilterClick}
              startIcon={<FilterListIcon />}
              endIcon={<ArrowDropDownIcon />}
              sx={{ mr: 2 }}
            >
              Filters
            </Button>
            
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
              sx={{ mt: 1 }}
            >
              <Box sx={{ p: 2, width: 300 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Filter Cases
                </Typography>
                
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Case Type</InputLabel>
                  <Select
                    value={filterType}
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
                
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={filterPriority}
                    label="Priority"
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                  >
                    {priorityOptions.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    onClick={() => {
                      setFilterType('All');
                      setFilterStatus('All');
                      setFilterPriority('All');
                    }}
                    sx={{ mr: 1 }}
                  >
                    Clear
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={handleFilterClose}
                  >
                    Apply
                  </Button>
                </Box>
              </Box>
            </Menu>
            
            {/* Display active filters as chips */}
            {(filterType !== 'All' || filterStatus !== 'All' || filterPriority !== 'All') && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filterType !== 'All' && (
                  <Chip 
                    label={`Type: ${filterType}`}
                    onDelete={() => handleFilterChange('type', 'All')}
                    size="small"
                  />
                )}
                {filterStatus !== 'All' && (
                  <Chip 
                    label={`Status: ${filterStatus}`}
                    onDelete={() => handleFilterChange('status', 'All')}
                    size="small"
                  />
                )}
                {filterPriority !== 'All' && (
                  <Chip 
                    label={`Priority: ${filterPriority}`}
                    onDelete={() => handleFilterChange('priority', 'All')}
                    size="small"
                  />
                )}
              </Box>
            )}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewCase}
          >
            New Case
          </Button>
        </Toolbar>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'caseNumber'}
                    direction={orderBy === 'caseNumber' ? order : 'asc'}
                    onClick={() => handleRequestSort('caseNumber')}
                  >
                    Case

