import React from 'react';
import { 
  DashboardContainer, 
  DashboardHeader, 
  PageTitle, 
  StatsGrid, 
  StatCard, 
  StatIcon, 
  StatContent, 
  StatValue, 
  StatLabel,
  CasesSection,
  SectionHeader,
  SectionTitle,
  TableContainer,
  CaseTable,
  TableHeader,
  TableRow,
  TableCell,
  StatusBadge,
  ViewAllLink,
  FilterDropdown,
  ActionButton,
  SearchBar,
  SearchInput,
  SearchIcon,
  FiltersContainer
} from './styles';
import { FiUsers, FiClock, FiCheckCircle, FiAlertCircle, FiCalendar, FiSearch, FiFilter, FiChevronDown } from 'react-icons/fi';
import Layout from '../../components/Layout';

const Dashboard: React.FC = () => {
  const caseData = [
    {
      id: 'CASE-2023-001',
      client: 'Maria Rodriguez',
      type: 'Green Card',
      status: 'In Progress',
      dueDate: '2023-10-15',
    },
    {
      id: 'CASE-2023-002',
      client: 'Ali Khan',
      type: 'Citizenship',
      status: 'Approved',
      dueDate: '2023-09-30',
    },
    {
      id: 'CASE-2023-003',
      client: 'Chen Wei',
      type: 'Work Visa',
      status: 'Pending Review',
      dueDate: '2023-11-05',
    },
    {
      id: 'CASE-2023-004',
      client: 'John Smith',
      type: 'Asylum',
      status: 'Awaiting Documents',
      dueDate: '2023-10-22',
    },
    {
      id: 'CASE-2023-005',
      client: 'Sofia Martinez',
      type: 'DACA Renewal',
      status: 'Completed',
      dueDate: '2023-09-15',
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Completed':
        return '#4caf50';
      case 'In Progress':
        return '#2196f3';
      case 'Pending Review':
        return '#ff9800';
      case 'Awaiting Documents':
        return '#ff5722';
      default:
        return '#7c8db5';
    }
  };

  return (
    <Layout>
      <DashboardContainer>
        <DashboardHeader>
          <PageTitle>Dashboard</PageTitle>
        </DashboardHeader>
        
        <StatsGrid>
          <StatCard>
            <StatIcon color="#4a80f0">
              <FiUsers size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>42</StatValue>
              <StatLabel>Active Clients</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#4caf50">
              <FiCheckCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>18</StatValue>
              <StatLabel>Cases Completed</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#ff9800">
              <FiClock size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>27</StatValue>
              <StatLabel>Cases In Progress</StatLabel>
            </StatContent>
          </StatCard>
          
          <StatCard>
            <StatIcon color="#e91e63">
              <FiAlertCircle size={24} />
            </StatIcon>
            <StatContent>
              <StatValue>5</StatValue>
              <StatLabel>Urgent Cases</StatLabel>
            </StatContent>
          </StatCard>
        </StatsGrid>
        
        <CasesSection>
          <SectionHeader>
            <SectionTitle>Recent Cases</SectionTitle>
            <ViewAllLink to="/cases">View All Cases</ViewAllLink>
          </SectionHeader>
          
          <FiltersContainer>
            <SearchBar>
              <SearchIcon>
                <FiSearch size={18} />
              </SearchIcon>
              <SearchInput placeholder="Search cases..." />
            </SearchBar>
            
            <FilterDropdown>
              <FiFilter size={16} />
              <span>Filter</span>
              <FiChevronDown size={14} />
            </FilterDropdown>
          </FiltersContainer>
          
          <TableContainer>
            <CaseTable>
              <thead>
                <TableRow>
                  <TableHeader>Case ID</TableHeader>
                  <TableHeader>Client Name</TableHeader>
                  <TableHeader>Case Type</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Due Date</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </thead>
              <tbody>
                {caseData.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell>{caseItem.id}</TableCell>
                    <TableCell>{caseItem.client}</TableCell>
                    <TableCell>{caseItem.type}</TableCell>
                    <TableCell>
                      <StatusBadge color={

