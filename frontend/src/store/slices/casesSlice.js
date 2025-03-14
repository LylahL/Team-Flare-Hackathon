import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Mock data
let mockCases = [
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
    status: 'In Review',
    priority: 'Medium',
    submissionDate: '2023-02-05',
    dueDate: '2023-05-15',
  },
  {
    id: '3',
    caseNumber: 'IMM-2023-003',
    caseType: 'Family Petition',
    applicant: 'Michael Johnson',
    status: 'Approved',
    priority: 'Low',
    submissionDate: '2023-01-10',
    dueDate: '2023-04-30',
  }
];

const generateId = () => {
  const maxId = mockCases.reduce((max, caseItem) => 
    Math.max(max, parseInt(caseItem.id)), 0
  );
  return (maxId + 1).toString();
};

export const fetchCases = createAsyncThunk(
  'cases/fetchCases',
  async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockCases);
      }, 1000);
    });
  }
);

export const fetchCaseById = createAsyncThunk(
  'cases/fetchCaseById',
  async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const foundCase = mockCases.find(c => c.id === id);
        if (!foundCase) {
          reject(new Error('Case not found'));
        }
        resolve(foundCase);
      }, 500);
    });
  }
);

export const addCase = createAsyncThunk(
  'cases/addCase',
  async (newCase) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const caseWithId = {
          ...newCase,
          id: generateId()
        };
        mockCases.push(caseWithId);
        resolve(caseWithId);
      }, 500);
    });
  }
);

export const updateCase = createAsyncThunk(
  'cases/updateCase',
  async (updatedCase) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCases.findIndex(c => c.id === updatedCase.id);
        if (index === -1) {
          reject(new Error('Case not found'));
        }
        mockCases[index] = updatedCase;
        resolve(updatedCase);
      }, 500);
    });
  }
);

export const deleteCase = createAsyncThunk(
  'cases/deleteCase',
  async (id) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockCases.findIndex(c => c.id === id);
        if (index === -1) {
          reject(new Error('Case not found'));
        }
        mockCases = mockCases.filter(c => c.id !== id);
        resolve(id);
      }, 500);
    });
  }
);

const initialState = {
  items: [],
  filteredItems: [],
  selectedCase: null,
  loading: false,
  error: null,
  filters: {
    searchQuery: '',
    type: 'All',
    status: 'All',
    priority: 'All'
  },
  sorting: {
    field: 'caseNumber',
    order: 'asc'
  }
};

const applyFilters = (items, filters, sorting) => {
  let result = [...items];

  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(
      (item) =>
        item.caseNumber.toLowerCase().includes(query) ||
        item.applicant.toLowerCase().includes(query)
    );
  }

  if (filters.type !== 'All') {
    result = result.filter((item) => item.caseType === filters.type);
  }

  if (filters.status !== 'All') {
    result = result.filter((item) => item.status === filters.status);
  }

  if (filters.priority !== 'All') {
    result = result.filter((item) => item.priority === filters.priority);
  }

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

  return result;
};

const casesSlice = createSlice({
  name: 'cases',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredItems = applyFilters(state.items, state.filters, state.sorting);
    },
    setSorting: (state, action) => {
      state.sorting = action.payload;
      state.filteredItems = applyFilters(state.items, state.filters, state.sorting);
    },
    clearSelectedCase: (state) => {
      state.selectedCase = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCases.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.filteredItems = applyFilters(action.payload, state.filters, state.sorting);
      })
      .addCase(fetchCases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCase = action.payload;
      })
      .addCase(fetchCaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCase.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.filteredItems = applyFilters(state.items, state.filters, state.sorting);
      })
      .addCase(addCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCase.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        );
        state.filteredItems = applyFilters(state.items, state.filters, state.sorting);
        state.selectedCase = action.payload;
      })
      .addCase(updateCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(deleteCase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCase.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.filteredItems = applyFilters(state.items, state.filters, state.sorting);
        if (state.selectedCase && state.selectedCase.id === action.payload) {
          state.selectedCase = null;
        }
      })
      .addCase(deleteCase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setFilters, setSorting, clearSelectedCase } = casesSlice.actions;
export default casesSlice.reducer;
