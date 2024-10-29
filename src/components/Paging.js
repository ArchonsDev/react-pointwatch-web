import React from "react";
import { Stack, Pagination } from "@mui/material";

const PaginationComponent = ({ totalPages, currentPage, handlePageChange }) => {
  return (
    <Stack spacing={2}>
      <Pagination
        count={totalPages}
        page={currentPage}
        variant="outlined"
        shape="rounded"
        showFirstButton
        showLastButton
        onChange={(event, value) => handlePageChange(value)}
        sx={{
          "& .MuiPaginationItem-root": {
            border: "none",
            backgroundColor: "#180018",
            color: "white",
            fontFamily: "Poppins-SemiBold",
            "&:hover": {
              backgroundColor: "#9d084a",
            },
          },
          "& .MuiPaginationItem-root.Mui-selected": {
            backgroundColor: "#9d084a",
          },
          "& .MuiPaginationItem-ellipsis": {
            backgroundColor: "transparent",
            color: "#180018",
          },
        }}
      />
    </Stack>
  );
};

export default PaginationComponent;
