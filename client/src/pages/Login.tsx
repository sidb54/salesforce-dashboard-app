import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  View,
  Flex,
  Form,
  TextField,
  Button,
  Heading,
  Text,
  ProgressCircle,
  InlineAlert,
  Divider
} from '@adobe/react-spectrum';

import { useAuthContext } from '../contexts/AuthContext';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [triggerError, setTriggerError] = useState(false);

  // This will cause a render error that can be caught by error boundary
  if (triggerError) {
    throw new Error('Test error from Login page render');
  }

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      // For testing the error boundary - remove in production
      if (values.email === 'error@test.com') {
        setTriggerError(true);
        return;
      }
      
      setIsSubmitting(true);
      setError(null);
      
      try {
        await login(values.email, values.password);
        navigate('/dashboard');
      } catch (err: any) {
        if (err.response && err.response.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (err.response && err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError('Login failed. Please check your network connection and try again.');
        }
        setShowAlert(true);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
      <Flex 
        direction="column" 
        alignItems="center" 
        justifyContent="center" 
        height="100vh" 
      >
        <View 
          backgroundColor="static-white" 
          borderWidth="thin" 
          borderColor="gray-200" 
          borderRadius="medium" 
          width="size-5000" 
          padding="size-400"
          maxWidth="90%"
          UNSAFE_style={{
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Heading level={2} marginBottom="size-200" alignSelf="center">Sign In to SF Dashboard</Heading>
          <Divider size="S" marginBottom="size-300" />
          
          {showAlert && error && (
            <Flex justifyContent="center" alignItems="center" marginBottom="size-200">
              <InlineAlert variant="negative">
                {error}
              </InlineAlert>
            </Flex>
          )}
          
          <Form 
            maxWidth="100%" 
            onSubmit={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
          >
            <TextField
              label="Email Address"
              name="email"
              autoComplete="email"
              isRequired
              width="100%"
              marginBottom="size-300"
              value={formik.values.email}
              onChange={(value) => {
                formik.setFieldValue('email', value);
                setShowAlert(false);
              }}
              onBlur={() => formik.setFieldTouched('email')}
              validationState={formik.touched.email && formik.errors.email ? 'invalid' : undefined}
              errorMessage={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
            />
            
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              isRequired
              width="100%"
              marginBottom="size-300"
              value={formik.values.password}
              onChange={(value) => {
                formik.setFieldValue('password', value);
                setShowAlert(false);
              }}
              onBlur={() => formik.setFieldTouched('password')}
              validationState={formik.touched.password && formik.errors.password ? 'invalid' : undefined}
              errorMessage={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
            />
            
            <Button
              type="submit"
              variant="accent"
              isDisabled={isSubmitting || !formik.dirty || !formik.isValid}
              width="100%"
              marginTop="size-200"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
            
            <Flex alignItems="center" justifyContent="center" marginTop="size-200" height="size-300">
              {isSubmitting ? <ProgressCircle size="S" aria-label="Signing in..." isIndeterminate /> : null}
            </Flex>
            
            <Divider size="S" marginY="size-300" />
            
            <Flex direction="row" justifyContent="center" marginTop="size-200" alignItems="center" gap="size-100">
              <Text>Don't have an account?</Text>
              <Button 
                variant="secondary" 
                onPress={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </Flex>
          </Form>
        </View>
      </Flex>
  );
};

export default Login; 