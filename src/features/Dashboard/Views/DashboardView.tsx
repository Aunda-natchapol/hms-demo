import { type FC } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Typography,
} from "@mui/material";
import {
  Construction,
} from '@mui/icons-material';

const DashboardView: FC = observer(() => {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center'
      }}
    >
      <Construction
        sx={{
          fontSize: 120,
          color: 'warning.main',
          mb: 4
        }}
      />

      <Typography
        variant="h2"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 600, mb: 3 }}
      >
        แดชบอร์ด
      </Typography>

      <Typography
        variant="h4"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        กำลังพัฒนา...
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
      >
        Work in Progress
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mt: 4, maxWidth: 600 }}
      >
        หน้าแดชบอร์ดกำลังอยู่ในขั้นตอนการพัฒนา<br />
        โปรดรอการอัปเดตในเร็วๆ นี้
      </Typography>
    </Box>
  );
});

export default DashboardView;
