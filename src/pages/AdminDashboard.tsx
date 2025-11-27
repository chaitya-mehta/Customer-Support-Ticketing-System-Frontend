import { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import type { Category, Ticket, User } from "../types";
import { getAllCategories } from "../store/slices/categorySlice";
import { getAllUsers } from "../store/slices/userSlice";
import { getAllTickets } from "../store/slices/ticketSlice";
import { toast } from "react-toastify";
import { useAppDispatch } from "../hooks";
import { TOAST_MESSAGES } from "../constants";

export default function AdminDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const [totalCategories, setTotalCategories] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [catData, userData, ticketData] = await Promise.all([
        dispatch(getAllCategories({ page: 1, limit: 5 })).unwrap(),
        dispatch(getAllUsers({ page: 1, limit: 5 })).unwrap(),
        dispatch(getAllTickets({ page: 1, limit: 5 })).unwrap(),
      ]);
      setCategories(catData.categories || []);
      setTotalCategories(catData.totalRecords || 0);
      setUsers(userData.users || []);
      setTotalUsers(userData.totalCount || 0);
      setTickets(ticketData.tickets || []);
      setTotalTickets(ticketData.totalCount || 0);
    } catch (err) {
      toast.error(TOAST_MESSAGES.ERROR.ADMIN_DATA_FAILED);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <Box p={3}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Admin Dashboard
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ background: "#1976d2", color: "white" }}>
                <CardContent>
                  <Typography variant="h6">Total Categories</Typography>
                  <Typography variant="h4">{totalCategories}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ background: "#2e7d32", color: "white" }}>
                <CardContent>
                  <Typography variant="h6">Total Users</Typography>
                  <Typography variant="h4">{totalUsers}</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Card sx={{ background: "#ed6c02", color: "white" }}>
                <CardContent>
                  <Typography variant="h6">Total Tickets</Typography>
                  <Typography variant="h4">{totalTickets}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}
