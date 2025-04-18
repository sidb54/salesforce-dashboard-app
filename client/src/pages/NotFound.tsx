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
import NotFound404 from '@spectrum-icons/illustrations/NoSearchResults';
import { useAuthContext } from '../contexts/AuthContext';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  return (
    <View height="100vh" backgroundColor="gray-50" padding="size-300">
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <IllustratedMessage>
          <NotFound404 />
          <Heading>404 - Page Not Found</Heading>
          <Content>The page you're looking for doesn't exist or has been moved.</Content>
          <Flex direction="row" gap="size-200" marginTop="size-200">
            <Button 
              variant="primary" 
              onPress={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            >
              Go to {isAuthenticated ? 'Dashboard' : 'Login'}
            </Button>
            <Button 
              variant="secondary" 
              onPress={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Flex>
        </IllustratedMessage>
      </Flex>
    </View>
  );
};

export default NotFound; 