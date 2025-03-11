import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiFileText, FiMessageCircle, FiClock } from 'react-icons/fi';
import DocumentUpload from '../../components/DocumentUpload';
import CaseNotes from '../../components/CaseNotes';
import { Button, Tabs, Tab, Spinner, Alert } from '../../components';
import { getCaseById, updateCaseStatus } from '../../services/caseService';
import { formatDate, formatCaseStatus } from '../../utils/formatters';
import { 
  Container, 
  Header, 
  BackButton,
  CaseTitle, 
  StatusBadge,
  CaseInfo,
  InfoItem,
  InfoLabel,
  InfoValue,
  SectionTitle,
  TabContent,
  ActionButtons,
  Section
} from './styles';

interface CaseDetailProps {}

const CaseDetail: React.FC<CaseDetailProps> = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setLoading(true);
        if (id) {
          const data = await getCaseById(id);
          setCaseData(data);
        }
      } catch (err) {
        setError('Failed to load case details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      setStatusUpdating(true);
      await updateCaseStatus(id!, newStatus);
      setCaseData({
        ...caseData,
        status: newStatus
      });
    } catch (err) {
      setError('Failed to update case status. Please try again.');
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleEditCase = () => {
    navigate(`/cases/${id}/edit`);
  };

  if (loading) {
    return (
      <Container>
        <div className="loading-container">
          <Spinner size="large" />
          <p>Loading case details...</p>
        </div>
      </Container>
    );
  }

  if (error || !caseData) {
    return (
      <Container>
        <Alert type="error" message={error || 'Case not found'} />
        <BackButton onClick={() => navigate('/cases')}>
          <FiArrowLeft /> Back to cases
        </BackButton>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <BackButton onClick={() => navigate('/cases')}>
            <FiArrowLeft /> Back to cases
          </BackButton>
          <CaseTitle>
            Case #{caseData.caseNumber}: {caseData.applicant.firstName} {caseData.applicant.lastName}
          </CaseTitle>
        </div>
        <StatusBadge status={caseData.status}>
          {formatCaseStatus(caseData.status)}
        </StatusBadge>
      </Header>

      <ActionButtons>
        <Button variant="primary" onClick={handleEditCase}>
          <FiEdit2 /> Edit Case
        </Button>
        <Button variant="outline" onClick={() => {}}>
          <FiTrash2 /> Archive Case
        </Button>
        <Button variant="success" onClick={() => handleStatusChange('approved')} disabled={statusUpdating}>
          Approve
        </Button>
        <Button variant="danger" onClick={() => handleStatusChange('denied')} disabled={statusUpdating}>
          Deny
        </Button>
      </ActionButtons>

      <Tabs activeTab={activeTab} onChange={setActiveTab}>
        <Tab id="overview" label="Overview">
          <TabContent>
            <Section>
              <SectionTitle>Applicant Information</SectionTitle>
              <CaseInfo>
                <InfoItem>
                  <InfoLabel>Full Name</InfoLabel>
                  <InfoValue>{caseData.applicant.firstName} {caseData.applicant.middleName || ''} {caseData.applicant.lastName}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Date of Birth</InfoLabel>
                  <InfoValue>{formatDate(caseData.applicant.dateOfBirth)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Country of Origin</InfoLabel>
                  <InfoValue>{caseData.applicant.countryOfOrigin}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>A-Number</InfoLabel>
                  <InfoValue>{caseData.applicant.alienNumber || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Email</InfoLabel>
                  <InfoValue>{caseData.applicant.email}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Phone</InfoLabel>
                  <InfoValue>{caseData.applicant.phone}</InfoValue>
                </InfoItem>
              </CaseInfo>
            </Section>

            <Section>
              <SectionTitle>Case Information</SectionTitle>
              <CaseInfo>
                <InfoItem>
                  <InfoLabel>Case Type</InfoLabel>
                  <InfoValue>{caseData.caseType}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Filing Date</InfoLabel>
                  <InfoValue>{formatDate(caseData.filingDate)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Priority Date</InfoLabel>
                  <InfoValue>{formatDate(caseData.priorityDate)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Status</InfoLabel>
                  <InfoValue>
                    <StatusBadge status={caseData.status} small>
                      {formatCaseStatus(caseData.status)}
                    </StatusBadge>
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Last Updated</InfoLabel>
                  <InfoValue>{formatDate(caseData.updatedAt)}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>Assigned To</InfoLabel>
                  <InfoValue>{caseData.assignedTo?.name || 'Unassigned'}</InfoValue>
                </InfoItem>
              </CaseInfo>
            </Section>
          </TabContent>
        </Tab>
        <Tab id="documents" label="Documents" icon={<FiFileText />}>
          <TabContent>
            <DocumentUpload caseId={id!} existingDocuments={caseData.documents} />
          </TabContent>
        </Tab>
        <Tab id="notes" label="Case Notes" icon={<FiMessageCircle />}>
          <TabContent>
            <CaseNotes caseId={id!} existingNotes={caseData.notes} />
          </TabContent>
        </Tab>
        <Tab id="timeline" label="Timeline" icon={<FiClock />}>
          <TabContent>
            <Section>
              <SectionTitle>Case Timeline</SectionTitle>
              {caseData.timeline && caseData.timeline.length > 0 ? (
                <div className="timeline">
                  {caseData.timeline.map((event: any, index: number) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-date">{formatDate(event.date)}</div>
                      <div className="timeline-content">
                        <h4>{event.title}</h4>
                        <p>{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No timeline events available for this case.</p>
              )}
            </Section>
          </TabContent>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default CaseDetail;

