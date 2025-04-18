import React, { useState } from 'react';
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

// Validation schema
const validationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required'),
  lastName: yup
    .string()
    .required('Last name is required'),
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, error: authError } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        await register(values.firstName, values.lastName, values.email, values.password);
        navigate('/dashboard');
      } catch (err) {
        const errMessage = authError || 'Registration failed. Please try again.';
        setError(errMessage);
        setIsAlertOpen(true);
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
          <Heading level={2} marginBottom="size-200" alignSelf="center">Create Account for SF Dashboard</Heading>
          <Divider size="S" marginBottom="size-300" />

          {isAlertOpen && error && (
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
            <Flex gap="size-200" wrap>
              <TextField
                label="First Name"
                name="firstName"
                autoComplete="given-name"
                isRequired
                flex="1"
                width="100%"
                value={formik.values.firstName}
                onChange={(value) => formik.setFieldValue('firstName', value)}
                onBlur={() => formik.setFieldTouched('firstName')}
                validationState={formik.touched.firstName && formik.errors.firstName ? 'invalid' : undefined}
                errorMessage={formik.touched.firstName && formik.errors.firstName ? formik.errors.firstName : undefined}
              />
              
              <TextField
                label="Last Name"
                name="lastName"
                autoComplete="family-name"
                isRequired
                flex="1"
                width="100%"
                value={formik.values.lastName}
                onChange={(value) => formik.setFieldValue('lastName', value)}
                onBlur={() => formik.setFieldTouched('lastName')}
                validationState={formik.touched.lastName && formik.errors.lastName ? 'invalid' : undefined}
                errorMessage={formik.touched.lastName && formik.errors.lastName ? formik.errors.lastName : undefined}
              />
            </Flex>
            
            <TextField
              label="Email Address"
              name="email"
              autoComplete="email"
              isRequired
              width="100%"
              marginY="size-300"
              value={formik.values.email}
              onChange={(value) => formik.setFieldValue('email', value)}
              onBlur={() => formik.setFieldTouched('email')}
              validationState={formik.touched.email && formik.errors.email ? 'invalid' : undefined}
              errorMessage={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
            />
            
            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="new-password"
              isRequired
              width="100%"
              marginBottom="size-300"
              value={formik.values.password}
              onChange={(value) => formik.setFieldValue('password', value)}
              onBlur={() => formik.setFieldTouched('password')}
              validationState={formik.touched.password && formik.errors.password ? 'invalid' : undefined}
              errorMessage={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
            />
            
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              isRequired
              width="100%"
              marginBottom="size-300"
              value={formik.values.confirmPassword}
              onChange={(value) => formik.setFieldValue('confirmPassword', value)}
              onBlur={() => formik.setFieldTouched('confirmPassword')}
              validationState={formik.touched.confirmPassword && formik.errors.confirmPassword ? 'invalid' : undefined}
              errorMessage={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : undefined}
            />
            
            <Button
              type="submit"
              variant="accent"
              isDisabled={isSubmitting || !formik.dirty || !formik.isValid}
              width="100%"
              marginTop="size-200"
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </Button>
            
            <Flex alignItems="center" justifyContent="center" marginTop="size-200" height="size-300">
              {isSubmitting ? <ProgressCircle size="S" aria-label="Registering..." isIndeterminate /> : null}
            </Flex>
            
            <Divider size="S" marginY="size-300" />
            
            <Flex direction="row" justifyContent="center" marginTop="size-200" alignItems="center" gap="size-100">
              <Text>Already have an account?</Text>
              <Button variant="secondary" onPress={() => navigate('/login')} marginStart="size-100">
                Sign In
              </Button>
            </Flex>
          </Form>
        </View>
      </Flex>
  );
};

export default Register; 