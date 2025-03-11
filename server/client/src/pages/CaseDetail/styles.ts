import styled, { css } from 'styled-components';

interface StatusBadgeProps {
  status: string;
  small?: boolean;
}

export const Container = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

export const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-bottom: 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const CaseTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

export const StatusBadge = styled.span<StatusBadgeProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.small ? '4px 8px' : '6px 12px'};
  border-radius: 100px;
  font-size: ${props => props.small ? '12px' : '14px'};
  font-weight: 500;
  white-space: nowrap;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return css`
          background-color: ${props.theme.colors.warning}15;
          color: ${props.theme.colors.warning};
        `;
      case 'approved':
        return css`
          background-color: ${props.theme.colors.success}15;
          color: ${props.theme.colors.success};
        `;
      case 'denied':
        return css`
          background-color: ${props.theme.colors.danger}15;
          color: ${props.theme.colors.danger};
        `;
      case 'in_review':
        return css`
          background-color: ${props.theme.colors.info}15;
          color: ${props.theme.colors.info};
        `;
      default:
        return css`
          background-color: ${props.theme.colors.gray}15;
          color: ${props.theme.colors.gray};
        `;
    }
  }}
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    
    button {
      flex: 1 0 calc(50% - 8px);
    }
  }
`;

export const Section = styled.section`
  margin-bottom: 32px;
`;

export const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

export const CaseInfo = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px 32px;
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const InfoLabel = styled.span`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
`;

export const InfoValue = styled.span`
  font-size: 16px;
  color: ${props => props.theme.colors.text.primary};
  font-weight: 500;
`;

export const TabContent = styled.div`
  padding: 24px 0;
`;

