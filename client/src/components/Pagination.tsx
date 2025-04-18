import React from 'react';
import { Flex, ActionButton, Button } from '@adobe/react-spectrum';
import ChevronLeft from '@spectrum-icons/workflow/ChevronLeft';
import ChevronRight from '@spectrum-icons/workflow/ChevronRight';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const Pagination: React.FC<PaginationProps> = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading 
}) => {
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && !isLoading) {
      onPageChange(page);
    }
  };

  // Create page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Custom styles to make buttons smaller
  const buttonStyle = {
    minWidth: '32px',
    height: '32px',
    padding: '0 8px'
  };

  return (
    <Flex direction="row" gap="size-100" alignItems="center">
      <ActionButton
        isQuiet
        isDisabled={currentPage === 1 || isLoading}
        onPress={() => goToPage(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </ActionButton>
      
      {getPageNumbers().map(pageNum => (
        <Button
          key={pageNum}
          variant={pageNum === currentPage ? "accent" : "primary"}
          isQuiet
          isDisabled={isLoading}
          onPress={() => goToPage(pageNum)}
          UNSAFE_className="pagination-button"
          UNSAFE_style={buttonStyle}
        >
          {pageNum}
        </Button>
      ))}
      
      <ActionButton
        isQuiet
        isDisabled={currentPage === totalPages || isLoading}
        onPress={() => goToPage(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight />
      </ActionButton>
    </Flex>
  );
};

export default Pagination; 