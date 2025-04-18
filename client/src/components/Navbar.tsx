import React from 'react';
import { View, Flex, Text, ActionButton, Heading } from '@adobe/react-spectrum';
import LogOut from '@spectrum-icons/workflow/LogOut';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

interface NavbarProps {
  title?: string;
}

const Navbar: React.FC<NavbarProps> = ({ title = 'Salesforce Dashboard' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Add hover effect to the title
  const [isHovered, setIsHovered] = React.useState(false);

  const titleContainerStyle = {
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
    display: 'flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: '6px',
    background: isHovered ? 'rgba(255, 255, 255, 0.15)' : 'transparent'
  };

  const handleTitleClick = () => {
    navigate('/');
  };

  return (
    <View 
      backgroundColor="blue-600"
      paddingX="size-300"
      paddingY="size-200"
      height="size-600"
    >
      <Flex 
        alignItems="center" 
        justifyContent="space-between"
        height="100%"
      >
        <Flex alignItems="center" gap="size-200">
          <div 
            style={titleContainerStyle} 
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleTitleClick}
          >
            <Heading level={3} marginY={0}>
              <Text>{title}</Text>
            </Heading>
          </div>
        </Flex>
        {user && (
          <Flex alignItems="center" gap="size-200">
            <Text>
              Welcome, {user.firstName} {user.lastName}
            </Text>
            <ActionButton 
              isQuiet 
              aria-label="Logout" 
              onPress={handleLogout}
            >
              <LogOut />
            </ActionButton>
          </Flex>
        )}
      </Flex>
    </View>
  );
};

export default Navbar; 