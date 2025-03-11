import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FormContainer,
  FormSection,
  FormTitle,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  DatePicker,
  ErrorMessage,
  ButtonGroup,
  SubmitButton,
  CancelButton,
} from './styles';
import { createCase, getCaseById, updateCase } from '../../utils/api';
import { formatDate } from '../../utils/formatters';

// Define case type
interface CaseFormData {
  id?: string;
  title: string;
  caseType: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  startDate: string;
  dueDate: string;
  status: string;
  assignedTo: string;
  description: string;
  documents: string[];
  notes: string;
}

const defaultFormData: CaseFormData = {
  title: '',
  caseType: 'asylum',
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  startDate: formatDate(new Date()),
  dueDate: '',
  status: 'new',
  assignedTo: '',
  description: '',
  documents: [],
  notes: '',
};

const caseTypes = [
  { value: 'asylum', label: 'Asylum' },
  { value: 'family', label: 'Family-Based' },
  { value: 'employment', label: 'Employment-Based' },
  { value: 'citizenship', label: 'Citizenship' },
  { value: 'visa', label: 'Visa Application' },
  { value: 'deportation', label: 'Deportation Defense' },
];

const statusOptions = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending_documents', label: 'Pending Documents' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'submitted', label: 'Submitted to USCIS' },
  { value: 'approved', label: 'Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'appealing', label: 'Appealing' },
  { value: 'closed', label: 'Closed' },
];

const CaseForm: React.FC = () => {
  const [formData, setFormData] = useState<CaseFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof CaseFormData, string>>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [attorneys, setAttorneys] = useState<{ id: string; name: string }[]>([]);
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  useEffect(() => {
    // Load attorneys list
    // This would be replaced with an actual API call
    setAttorneys([
      { id: '1', name: 'Jane Smith' },
      { id: '2', name: 'John Doe' },
      { id: '3', name: 'Maria Rodriguez' },
    ]);

    // If in edit mode, fetch the case data
    if (isEditMode && id) {
      fetchCaseData(id);
    }
  }, [id, isEditMode]);

  const fetchCaseData = async (caseId: string) => {
    try {
      setLoading(true);
      const caseData = await getCaseById(caseId);
      setFormData({
        ...caseData,
        startDate: formatDate(new Date(caseData.startDate)),
        dueDate: caseData.dueDate ? formatDate(new Date(caseData.dueDate)) : '',
      });
    } catch (error) {
      console.error('Failed to fetch case data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name as keyof CaseFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateChange = (name: string, date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, [name]: formatDate(date) }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CaseFormData, string>> = {};
    
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.clientName) newErrors.clientName = 'Client name is required';
    if (!formData.clientEmail) newErrors.clientEmail = 'Client email is required';
    if (!formData.clientPhone) newErrors.clientPhone = 'Client phone is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    
    // Email format validation
    if (formData.clientEmail && !/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      
      if (isEditMode && id) {
        await updateCase(id, formData);
      } else {
        await createCase(formData);
      }
      
      navigate('/cases');
    } catch (error) {
      console.error('Failed to save case:', error);
      setErrors(prev => ({ ...prev, submit: 'Failed to save case. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/cases');
  };

  if (loading && isEditMode) {
    return <div>Loading case data...</div>;
  }

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormTitle>{isEditMode ? 'Edit Case' : 'Create New Case'}</FormTitle>
      
      <FormSection>
        <FormTitle>Case Information</FormTitle>
        
        <FormGroup>
          <Label htmlFor="title">Case Title*</Label>
          <Input 
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            error={!!errors.title}
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="caseType">Case Type*</Label>
          <Select
            id="caseType"
            name="caseType"
            value={formData.caseType}
            onChange={handleInputChange}
          >
            {caseTypes.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="description">Case Description</Label>
          <TextArea 
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
          />
        </FormGroup>
      </FormSection>
      
      <FormSection>
        <FormTitle>Client Information</FormTitle>
        
        <FormGroup>
          <Label htmlFor="clientName">Client Name*</Label>
          <Input 
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            error={!!errors.clientName}
          />
          {errors.clientName && <ErrorMessage>{errors.clientName}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="clientEmail">Client Email*</Label>
          <Input 
            type="email"
            id="clientEmail"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleInputChange}
            error={!!errors.clientEmail}
          />
          {errors.clientEmail && <ErrorMessage>{errors.clientEmail}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="clientPhone">Client Phone*</Label>
          <Input 
            type="tel"
            id="clientPhone"
            name="clientPhone"
            value={formData.clientPhone}
            onChange={handleInputChange}
            error={!!errors.clientPhone}
          />
          {errors.clientPhone && <ErrorMessage>{errors.clientPhone}</ErrorMessage>}
        </FormGroup>
      </FormSection>
      
      <FormSection>
        <FormTitle>Case Management</FormTitle>
        
        <FormGroup>
          <Label htmlFor="startDate">Start Date*</Label>
          <DatePicker
            selected={formData.startDate ? new Date(formData.startDate) : null}
            onChange={(date: Date) => handleDateChange('startDate', date)}
            dateFormat="MM/dd/yyyy"
            error={!!errors.startDate}
          />
          {errors.startDate && <ErrorMessage>{errors.startDate}</ErrorMessage>}
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="dueDate">Due Date</Label>
          <DatePicker
            selected={formData.dueDate ? new Date(formData.dueDate) : null}
            onChange={(date: Date) => handleDateChange('dueDate', date)}
            dateFormat="MM/dd/yyyy"
          />
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="assignedTo">Assigned Attorney</Label>
          <Select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleInputChange}
          >
            <option value="">-- Select Attorney --</option>
            {attorneys.map(attorney => (
              <option key={attorney.id} value={attorney.id}>{attorney.name}</option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="notes">Notes</Label>
          <TextArea 
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
          />
        </FormGroup>
      </FormSection>
      
      {errors.submit && <ErrorMessage>{errors.submit}</ErrorMessage>}
      
      <ButtonGroup>
        <CancelButton type="button" onClick={handleCancel}>
          Cancel
        </CancelButton>
        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Saving...' : (isEditMode ? 'Update Case' : 'Create Case')}
        </SubmitButton>
      </ButtonGroup>
    </FormContainer>
  );
};

export default CaseForm;

