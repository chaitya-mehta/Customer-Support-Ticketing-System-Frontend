import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
} from "@mui/icons-material";
import { Box, Button, IconButton, Tooltip, Typography } from "@mui/material";
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  showRecordsInfo?: boolean;
  showPageInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  isLoading = false,
  onPageChange,
  showRecordsInfo = true,
  showPageInfo = true,
}) => {
  const startIndex = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIndex = Math.min(currentPage * pageSize, totalCount || 0);

  const getPaginationRange = () => {
    if (totalPages <= 1) return [1];

    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handleFirstPage = () => {
    if (currentPage > 1) {
      onPageChange(1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleLastPage = () => {
    if (currentPage < totalPages) {
      onPageChange(totalPages);
    }
  };

  const handlePageClick = (pageNumber: number) => {
    onPageChange(pageNumber);
  };

  if (totalPages <= 1 && !showRecordsInfo) {
    return null;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 3,
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      {showRecordsInfo && (
        <Typography variant="body2" color="text.secondary">
          Showing {startIndex} to {endIndex} of {totalCount} entries
        </Typography>
      )}

      {totalPages > 1 ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title="First Page">
            <span>
              <IconButton
                onClick={handleFirstPage}
                disabled={currentPage === 1 || isLoading}
                size="small"
              >
                <FirstPageIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Previous Page">
            <span>
              <IconButton
                onClick={handlePreviousPage}
                disabled={currentPage === 1 || isLoading}
                size="small"
              >
                <ChevronLeftIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            {getPaginationRange().map((pageNumber, index) =>
              pageNumber === "..." ? (
                <Typography
                  key={`dots-${index}`}
                  sx={{
                    px: 1,
                    display: "flex",
                    alignItems: "center",
                    color: "text.secondary",
                  }}
                >
                  ...
                </Typography>
              ) : (
                <Button
                  key={pageNumber}
                  variant={
                    currentPage === pageNumber ? "contained" : "outlined"
                  }
                  onClick={() => handlePageClick(pageNumber as number)}
                  disabled={isLoading}
                  size="small"
                  sx={{
                    minWidth: 32,
                    height: 32,
                    p: 0,
                  }}
                >
                  {pageNumber}
                </Button>
              )
            )}
          </Box>

          <Tooltip title="Next Page">
            <span>
              <IconButton
                onClick={handleNextPage}
                disabled={currentPage === totalPages || isLoading}
                size="small"
              >
                <ChevronRightIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Last Page">
            <span>
              <IconButton
                onClick={handleLastPage}
                disabled={currentPage === totalPages || isLoading}
                size="small"
              >
                <LastPageIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ) : (
        showPageInfo && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Page 1 of 1
            </Typography>
          </Box>
        )
      )}

      {showPageInfo && (
        <Typography variant="body2" color="text.secondary">
          Page {currentPage} of {totalPages}
        </Typography>
      )}
    </Box>
  );
};

export default Pagination;
