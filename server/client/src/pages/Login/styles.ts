import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 20px;
`;

export const FormContainer = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 480px;
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

export const LogoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

export const Logo = styled.div`
  width: 80px;
  height: 80px;
  background-color: #5C77FF;
  border-radius: 50%;
  margin-bottom: 16px;
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #1E293B;
  margin-bottom: 8px;
  text-align: center;
`;

export const FormGroup = styled.div`
  margin-bottom: 24px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
`;

interface InputProps {
  hasError?: boolean;
}

export const Input = styled.input<InputProps>`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${({ hasError }) => (hasError ? '#EF4444' : '#CBD5E1')};
  border-radius: 8px;
  font-size: 16px;
  color: #1E293B;
  background-color: #F8FAFC;
  transition: border-color 0.2s, box-shadow 0.2s;
  
  &:focus {
    outline: none;
    border-color: #5C77FF;
    box-shadow: 0 0 0 3px rgba(92, 119, 255, 0.2);
  }
  
  &::placeholder {
    color: #94A3B8;
  }
`;

export const Button = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #5C77FF;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;
  
  &:hover {
    background-color: #4C63D9;
  }
  
  &:disabled {
    background-color: #94A3B8;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  color: #EF4444;
  font-size: 14px;
  margin-top: 6px;
  margin-bottom: 0;
`;

export const ForgotPassword = styled(Link)`
  display: block;
  text-align: right;
  color: #5C77FF;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const RegisterLink = styled.p`
  text-align: center;
  margin-top: 32px;
  font-size: 14px;
  color: #64748B;
  
  a {
    color: #5C77FF;
    font-weight: 600;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

