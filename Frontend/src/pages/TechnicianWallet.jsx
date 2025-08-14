// TechnicianWallet.jsx
// Converted from technician_wallet.html
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWallet,
  faDollarSign,
  faGift,
  faEdit,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const TechnicianWallet = () => {
  const [wallet, setWallet] = useState({
    balance: 0,
    delivered: 0,
    earned: 0,
    bonus: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => {
    fetch("http://localhost:8001/api/technician/wallet", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) =>
        res.ok ? res.json() : { balance: 0, delivered: 0, earned: 0, bonus: 0 }
      )
      .then((data) => setWallet(data));
    fetch("http://localhost:8001/api/technician/transactions", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTransactions(data || []));
  }, []);

  const filteredTx = transactions.filter(
    (tx) =>
      !search ||
      tx.customer?.toLowerCase().includes(search.toLowerCase()) ||
      tx.service_type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Technician Wallet
        </Typography>
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <FontAwesomeIcon
                icon={faWallet}
                style={{ fontSize: 32, color: "#388e3c", marginBottom: 8 }}
              />
              <Typography fontWeight={600} mb={1}>
                Wallet Balance
              </Typography>
              <Typography variant="h5" color="success.main">
                ${wallet.balance.toFixed(2)}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Button variant="contained" fullWidth>
                Withdraw Money
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <FontAwesomeIcon
                icon={faDollarSign}
                style={{ fontSize: 32, color: "#388e3c", marginBottom: 8 }}
              />
              <Typography fontWeight={600} mb={1}>
                Service Delivered
              </Typography>
              <Typography variant="h5">{wallet.delivered}</Typography>
              <Typography variant="body2">This Month</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <FontAwesomeIcon
                icon={faGift}
                style={{ fontSize: 32, color: "#fbc02d", marginBottom: 8 }}
              />
              <Typography fontWeight={600} mb={1}>
                Bonuses & Tips
              </Typography>
              <Typography variant="h5">${wallet.bonus.toFixed(2)}</Typography>
              <Typography variant="body2">This Month</Typography>
            </Paper>
          </Grid>
        </Grid>
        {/* Recent Transactions */}
        <Paper sx={{ p: 3, mt: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Recent Transactions</Typography>
            <TextField
              label="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              sx={{ width: 300 }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>DATE</TableCell>
                  <TableCell>SERVICE ID</TableCell>
                  <TableCell>CUSTOMER</TableCell>
                  <TableCell>SERVICE TYPE</TableCell>
                  <TableCell>HOURS</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>AMOUNT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTx.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTx.map((tx, i) => (
                    <TableRow key={i}>
                      <TableCell>{tx.date}</TableCell>
                      <TableCell>{tx.service_id}</TableCell>
                      <TableCell>{tx.customer}</TableCell>
                      <TableCell>{tx.service_type}</TableCell>
                      <TableCell>{tx.hours}</TableCell>
                      <TableCell>
                        <Chip
                          label={tx.status}
                          color={
                            tx.status === "Shipped"
                              ? "success"
                              : tx.status === "Processing"
                              ? "warning"
                              : "default"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          fontWeight={600}
                          color={
                            tx.status === "Shipped"
                              ? "success.main"
                              : tx.status === "Processing"
                              ? "warning.main"
                              : "text.secondary"
                          }
                        >
                          ${tx.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
};

export default TechnicianWallet;
