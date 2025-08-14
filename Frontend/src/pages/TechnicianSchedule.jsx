// TechnicianSchedule.jsx
// Converted from technician_schedule.html
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCheck,
  faTimes,
  faCoffee,
  faPlus,
  faCalendarDay,
} from "@fortawesome/free-solid-svg-icons";

const TechnicianSchedule = () => {
  const [schedule, setSchedule] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetch(
      `http://localhost:8001/api/technician/schedule?year=${year}&month=${
        month + 1
      }`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    )
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => setSchedule(data));
  }, [month, year]);

  // Calendar generation
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  const days = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push(date);
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedSchedule = schedule[selectedDate] || [];

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Technician Schedule
        </Typography>
        <Grid container spacing={3}>
          {/* Calendar */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <Button onClick={() => setMonth((m) => m - 1)}>
                  <FontAwesomeIcon icon={faChevronLeft} />
                </Button>
                <Typography variant="h6" mx={2}>
                  {new Date(year, month).toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
                <Button onClick={() => setMonth((m) => m + 1)}>
                  <FontAwesomeIcon icon={faChevronRight} />
                </Button>
                <Button
                  sx={{ ml: 2 }}
                  onClick={() => {
                    setMonth(new Date().getMonth());
                    setYear(new Date().getFullYear());
                  }}
                >
                  Today
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day) => (
                          <TableCell key={day}>{day}</TableCell>
                        )
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[0, 1, 2, 3, 4, 5].map((weekIdx) => (
                      <TableRow key={weekIdx}>
                        {days
                          .slice(weekIdx * 7, weekIdx * 7 + 7)
                          .map((date) => {
                            const dateStr = date.toISOString().split("T")[0];
                            const isCurrentMonth = date.getMonth() === month;
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selectedDate;
                            return (
                              <TableCell
                                key={dateStr}
                                sx={{
                                  bgcolor: isSelected
                                    ? "primary.light"
                                    : isToday
                                    ? "info.light"
                                    : isCurrentMonth
                                    ? "white"
                                    : "grey.200",
                                  cursor: "pointer",
                                  border: isSelected
                                    ? "2px solid #1976d2"
                                    : "1px solid #eee",
                                }}
                                onClick={() => setSelectedDate(dateStr)}
                              >
                                <Typography fontWeight={600}>
                                  {date.getDate()}
                                </Typography>
                                {(schedule[dateStr] || [])
                                  .slice(0, 2)
                                  .map((item, i) => (
                                    <Chip
                                      key={i}
                                      label={item.status}
                                      color={
                                        item.status === "available"
                                          ? "success"
                                          : item.status === "busy"
                                          ? "error"
                                          : "warning"
                                      }
                                      size="small"
                                      sx={{ mt: 0.5 }}
                                    />
                                  ))}
                                {schedule[dateStr] &&
                                  schedule[dateStr].length > 2 && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      +{schedule[dateStr].length - 2} more
                                    </Typography>
                                  )}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
          {/* Today's Schedule */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Schedule for {selectedDate}
              </Typography>
              {selectedSchedule.length === 0 ? (
                <Typography color="text.secondary">
                  No schedule for this day.
                </Typography>
              ) : (
                selectedSchedule.map((item, i) => (
                  <Paper key={i} sx={{ p: 2, mb: 1, bgcolor: "grey.50" }}>
                    <Typography fontWeight={600}>
                      {item.start_time} - {item.end_time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.notes || "No notes"}
                    </Typography>
                    <Chip
                      label={item.status}
                      color={
                        item.status === "available"
                          ? "success"
                          : item.status === "busy"
                          ? "error"
                          : "warning"
                      }
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Paper>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TechnicianSchedule;
