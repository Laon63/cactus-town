import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import { useAuth } from "../context/AuthContext";

function HomePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const townId = searchParams.get("townId");

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px - 56px)", // Full height minus header and footer
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        // Placeholder for desert background
        bgcolor: "#fdf6e3",
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
          사막의 마을, Cactus Town
        </Typography>
        <Typography variant="h5" component="p" color="text.secondary" paragraph>
          특정 그룹끼리만 공유되는 링크로 입장하고, 각자 선인장을 만들어 방문자들의 쪽지를 받아보세요.
        </Typography>
        <Box sx={{ mt: 4, display: "flex", gap: 2, justifyContent: "center" }}>
          <Button component={Link} to="/town/create" variant="contained" size="large">
            새 Town 만들기
          </Button>
          <Button
            component={Link}
            to={`/cactus/${user?.id}`}
            variant="outlined"
            size="large"
            disabled={!user}
          >
            내 선인장 확인
          </Button>
          {townId && (
            <Button
              component={Link}
              to={`/town/${townId}`}
              variant="outlined"
              size="large"
            >
              해당 Town 방문
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
}

export default HomePage;