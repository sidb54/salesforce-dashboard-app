import React, { useState, useEffect, CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import {
  View,
  Flex,
  Button,
  ProgressCircle,
  Heading,
  ActionButton,
  Content,
  IllustratedMessage
} from '@adobe/react-spectrum';
import { Cell, Column, Row, TableView, TableBody, TableHeader } from '@react-spectrum/table';
import NoSearchResults from '@spectrum-icons/illustrations/NoSearchResults';
import { useAuthContext } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';

interface SalesforceAccount {
  Id: string;
  Name: string;
  Phone: string;
  Website: string;
  Industry: string;
  BillingStreet: string;
  BillingCity: string;
  BillingState: string;
  BillingPostalCode: string;
  BillingCountry: string;
}

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface AccountsResponse {
  accounts: SalesforceAccount[];
  pagination: PaginationData;
}

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  const [pageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [localTotalPages, setLocalTotalPages] = useState(1);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);

  // Style for selectable text in table cells
  const selectableTextStyle: CSSProperties = {
    cursor: "text",
    WebkitUserSelect: "text",
    userSelect: "text",
    width: "100%",
    display: "inline-block"
  };

  // Configure query with proper caching
  const { 
    data, 
    isLoading, 
    error, 
    isFetching,
  } = useQuery<AccountsResponse>({
    queryKey: ['accounts', currentPage],
    queryFn: async () => {
      const response = await api.get('/salesforce/accounts', {
        params: {
          page: currentPage,
          pageSize
        }
      });
      
      setLocalTotalPages(response.data.pagination.totalPages);
      return response.data;
    },
    enabled: isAuthenticated && shouldFetch,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Initialize data fetch on first load
  useEffect(() => {
    if (isAuthenticated && !initialLoadComplete) {
      setShouldFetch(true);
    }
  }, [isAuthenticated, initialLoadComplete]);

  // Track when data loading completes
  useEffect(() => {
    if (!isLoading && !isFetching && data) {
      setInitialLoadComplete(true);
      setShouldFetch(false); // Reset fetch flag after loading completes
    }
  }, [isLoading, isFetching, data]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setShouldFetch(true); // Enable fetching when page changes
  };

  const formatAddress = (account: SalesforceAccount) => {
    if (!account.BillingStreet) return '';
    
    return `${account.BillingStreet}, ${account.BillingCity}, ${account.BillingState} ${account.BillingPostalCode}, ${account.BillingCountry}`;
  };

  const isPageLoading = isLoading || (!initialLoadComplete && isFetching);
  const accounts = data?.accounts || [];
  const hasAccounts = accounts.length > 0;
  const showNoAccountsMessage = initialLoadComplete && !isPageLoading && !hasAccounts && !error;
  const totalPages = data?.pagination?.totalPages || localTotalPages;

  const fetchAccounts = () => {
    if (!isFetching) {
      setShouldFetch(true);
    }
  };

  const resetData = () => {
    setCurrentPage(1);
    setShouldFetch(true);
  };

  return (
    <View height="100vh" backgroundColor="gray-50">
      <Navbar />

      <View paddingX="size-600" paddingY="size-400">
        <View
          backgroundColor="gray-50"
          borderRadius="medium"
          borderWidth="thin"
          borderColor="gray-300"
          padding="size-300"
        >
          <View  marginBottom="size-300">
            <Heading level={4} marginBottom="0">Salesforce Accounts</Heading>
          </View>
          
          {isPageLoading ? (
            <Flex alignItems="center" justifyContent="center" height="size-3000">
              <ProgressCircle size="L" aria-label="Loading accounts..." isIndeterminate />
            </Flex>
          ) : error ? (
            <Flex alignItems="center" justifyContent="center" height="size-3000">
              <IllustratedMessage>
                <NoSearchResults />
                <Heading>Error Loading Accounts</Heading>
                <Content>There was an error loading Salesforce accounts. Please try again.</Content>
                <ActionButton onPress={fetchAccounts}>Retry</ActionButton>
              </IllustratedMessage>
            </Flex>
          ) : showNoAccountsMessage ? (
            <Flex alignItems="center" justifyContent="center" height="size-3000">
              <IllustratedMessage>
                <NoSearchResults />
                <Heading>No Accounts Found</Heading>
                <Content>There are no Salesforce accounts to display.</Content>
                <ActionButton onPress={resetData}>Refresh</ActionButton>
              </IllustratedMessage>
            </Flex>
          ) : (
            <>
              <TableView
                aria-label="Salesforce accounts"
                height="size-6000"
                overflowMode="wrap"
              >
                <TableHeader>
                  <Column key="name" width={200}>Name</Column>
                  <Column key="phone" width={150}>Phone</Column>
                  <Column key="website" width={200}>Website</Column>
                  <Column key="industry" width={150}>Industry</Column>
                  <Column key="address">Billing Address</Column>
                </TableHeader>
                <TableBody items={accounts}>
                  {(item: SalesforceAccount) => (
                    <Row key={item.Id}>
                      <Cell><span style={selectableTextStyle}>{item.Name}</span></Cell>
                      <Cell><span style={selectableTextStyle}>{item.Phone}</span></Cell>
                      <Cell><span style={selectableTextStyle}>{item.Website}</span></Cell>
                      <Cell><span style={selectableTextStyle}>{item.Industry}</span></Cell>
                      <Cell><span style={selectableTextStyle}>{formatAddress(item)}</span></Cell>
                    </Row>
                  )}
                </TableBody>
              </TableView>
              
              {/* Pagination */}
              <Flex direction="row" marginTop="size-300" justifyContent="center">
                {hasAccounts && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    isLoading={isFetching}
                  />
                )}
              </Flex>
              
              {/* Loading indicator for page changes */}
              {isFetching && !isLoading && (
                <Flex justifyContent="center" marginTop="size-100">
                  <ProgressCircle size="S" aria-label="Loading..." isIndeterminate />
                </Flex>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

export default Dashboard; 