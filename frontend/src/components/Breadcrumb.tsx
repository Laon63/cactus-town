import React from 'react';
import { useLocation, Link as RouterLink } from 'react-router-dom';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';

function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Box sx={{ bgcolor: '#e9ecef', py: 1.5, px: 2 }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link component={RouterLink} to="/" color="inherit">
          Home
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);

          return isLast ? (
            <Typography key={routeTo} color="text.primary">
              {displayName}
            </Typography>
          ) : (
            <Link component={RouterLink} to={routeTo} key={routeTo} color="inherit">
              {displayName}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}

export default Breadcrumb;