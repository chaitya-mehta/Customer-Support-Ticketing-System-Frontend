import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React from "react";

export interface Column<T> {
  id: string;
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  colSpan?: number;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found",
  getRowKey,
  onRowClick,
  colSpan,
}: DataTableProps<T>): React.ReactElement {
  const columnCount = colSpan || columns.length;

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                width={column.width}
                align={column.align || "left"}
                sx={{ fontWeight: "bold" }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columnCount} sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columnCount}
                sx={{ textAlign: "center", py: 4, fontWeight: "bold" }}
              >
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={getRowKey(row)}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  cursor: onRowClick ? "pointer" : "default",
                }}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align || "left"}>
                    {column.render ? column.render(row) : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default DataTable;
