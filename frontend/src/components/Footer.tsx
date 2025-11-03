import React from "react";
import { Box, Container, Typography } from "@mui/material";

function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: "#f5f5f5", py: 3, mt: "auto" }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {new Date().getFullYear()}
          {" Cactus Town. All rights reserved."}
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;
