import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  View,
  Flex,
  Heading,
  Button,
  Content,
  IllustratedMessage
} from '@adobe/react-spectrum';
import NoSearchResults from '@spectrum-icons/illustrations/NoSearchResults';
import { useAuthContext } from '../contexts/AuthContext';

interface ErrorPageProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  const handleResetAndNavigate = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    }
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  return (
    <View height="100vh" backgroundColor="gray-50" padding="size-300">
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <IllustratedMessage>
          <NoSearchResults />
          <Heading>500 - Something Went Wrong</Heading>
          <Content>We're sorry, an unexpected error has occurred.</Content>
          {/* {error && (
            <Content marginBottom="size-200">
              <code>{error.message || 'Unknown error'}</code>
            </Content>
          )} */}
          <Flex direction="row" gap="size-200" marginTop="size-200">
            <Button 
              variant="primary" 
              onPress={handleResetAndNavigate}
            >
              Go to {isAuthenticated ? 'Dashboard' : 'Login'}
            </Button>
            <Button 
              variant="secondary" 
              onPress={() => {
                if (resetErrorBoundary) {
                  resetErrorBoundary();
                }
                navigate(-1);
              }}
            >
              Go Back
            </Button>
          </Flex>
        </IllustratedMessage>
      </Flex>
    </View>
  );
};

export default ErrorPage; 