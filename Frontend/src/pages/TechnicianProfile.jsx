// TechnicianProfile.jsx
// Converted from technician_profile.html
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Avatar,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faWallet,
  faHistory,
  faCertificate,
  faEnvelope,
  faPhone,
  faCheckCircle,
  faHammer,
  faSprayCan,
  faAirPump,
  faStar,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

const TechnicianProfile = () => {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    fetch("http://localhost:8001/api/technician/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setProfile(data));
  }, []);

  if (!profile) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "grey.100", minHeight: "100vh", py: 4 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 2 }}>
        <Typography variant="h4" fontWeight={700} mb={4}>
          Technician Profile
        </Typography>
        <Grid container spacing={3}>
          {/* Profile Card */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: "center" }}>
              <Avatar
                src={profile.avatar_url || ""}
                sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
              />
              <Typography variant="h5" fontWeight={600}>
                {profile.first_name} {profile.last_name}
              </Typography>
              <Typography color="text.secondary" mb={2}>
                ID: {profile.technician_id}
              </Typography>
              <Chip
                label={
                  profile.is_verified
                    ? "Verified Professional"
                    : "Pending Verification"
                }
                color={profile.is_verified ? "success" : "warning"}
                sx={{ mb: 2 }}
              />
              <Divider sx={{ my: 2 }} />
              <Button variant="contained" fullWidth>
                Edit Profile
              </Button>
            </Paper>
            {/* Contact Info */}
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography color="primary" fontWeight={600} mb={2}>
                Contact Information
              </Typography>
              <Typography>
                <strong>Email:</strong> {profile.email}
              </Typography>
              <Typography>
                <strong>Phone:</strong> {profile.phone}
              </Typography>
              <Typography>
                <strong>Business Name:</strong> {profile.business_name}
              </Typography>
              <Typography>
                <strong>Experience:</strong> {profile.years_experience} years
              </Typography>
              <Typography>
                <strong>Service Radius:</strong> {profile.service_radius} km
              </Typography>
              <Typography>
                <strong>Location:</strong> {profile.city}, {profile.province}
              </Typography>
            </Paper>
          </Grid>
          {/* Skills and Certificates */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Certified Skills
              </Typography>
              <Grid container spacing={2}>
                {(profile.areas_of_expertise || []).map((skill) => (
                  <Grid item xs={12} sm={6} md={4} key={skill}>
                    <Chip
                      label={skill
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                      color="primary"
                      sx={{ mb: 1 }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Button variant="outlined" sx={{ mt: 2 }}>
                Request to add new skill
              </Button>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Certificates & Experience
              </Typography>
              <Typography>
                <strong>Years of Experience:</strong> {profile.years_experience}{" "}
                years
              </Typography>
              {profile.is_certified && profile.certification_details ? (
                <>
                  <Typography>
                    <strong>Certified Professional</strong>
                  </Typography>
                  <Typography>
                    <strong>Authority:</strong>{" "}
                    {profile.certification_details.certification_authority}
                  </Typography>
                  <Typography>
                    <strong>Certification #:</strong>{" "}
                    {profile.certification_details.certification_number}
                  </Typography>
                  <Typography>
                    <strong>Expires:</strong>{" "}
                    {new Date(
                      profile.certification_details.certification_expiry
                    ).toLocaleDateString()}
                  </Typography>
                </>
              ) : (
                <Typography color="text.secondary">
                  Non-Certified Technician (Professional experience based)
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default TechnicianProfile;
