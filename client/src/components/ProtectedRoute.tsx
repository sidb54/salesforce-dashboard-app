import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import { View, Flex, ProgressCircle } from '@adobe/react-spectrum';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, isCheckingAuth } = useAuthContext();
  
  // Show loading indicator if authentication status is being checked
  if (isLoading || isCheckingAuth) {
    return (
      <View height="100vh">
        <Flex
          alignItems="center"
          justifyContent="center"
          height="100%"
        >
          <ProgressCircle size="L" aria-label="Loading authentication..." isIndeterminate />
        </Flex>
      </View>
    );
  }

  // Redirect to login if not authenticated after check is complete
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 