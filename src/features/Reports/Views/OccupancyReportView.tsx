import type { FC } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  Hotel,
  TrendingUp,
  Download,
  DateRange,
  Assessment,
  AttachMoney,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import reportService from "../Services/ReportService.ts";

const OccupancyReportView: FC = observer(() => {
  const {
    occupancyData,
    occupancyLoading,
    occupancyStartDate,
    occupancyEndDate,
    averageADR,
    averageRevPAR,
  } = reportService;

  const handleStartDateChange = (date: string) => {
    reportService.setOccupancyStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    reportService.setOccupancyEndDate(date);
  };

  const handleRefresh = () => {
    reportService.loadOccupancyReport();
  };

  const handleExport = () => {
    reportService.exportOccupancyReport();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH');
  };

  const chartData = occupancyData.map(item => ({
    date: formatDate(item.date),
    'ห้องที่เข้าพัก': item.occupied_rooms,
    'ห้องว่าง': item.available_rooms,
    'อัตราการเข้าพัก': item.occupancy_rate,
    'ADR': item.adr,
    'RevPAR': item.revpar,
  }));

  const averageOccupancyRate = occupancyData.length > 0
    ? Math.round(occupancyData.reduce((sum, item) => sum + item.occupancy_rate, 0) / occupancyData.length * 100) / 100
    : 0;

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 'none',
      bgcolor: 'background.default',
      minHeight: '100vh',
      p: { xs: 2, md: 3 }
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          รายงานการเข้าพัก
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          วิเคราะห์อัตราการเข้าพักและประสิทธิภาพการใช้ห้องพัก
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="วันที่เริ่มต้น"
                value={occupancyStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="วันที่สิ้นสุด"
                value={occupancyEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={occupancyLoading ? <CircularProgress size={20} /> : <DateRange />}
                  onClick={handleRefresh}
                  disabled={occupancyLoading}
                >
                  {occupancyLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExport}
                  disabled={occupancyLoading || occupancyData.length === 0}
                >
                  ส่งออก CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" color="primary.main" gutterBottom>
                {averageOccupancyRate}%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                อัตราการเข้าพักเฉลี่ย
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AttachMoney sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                {formatCurrency(averageADR)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ADR เฉลี่ย
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                (Average Daily Rate)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" color="info.main" gutterBottom>
                {formatCurrency(averageRevPAR)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                RevPAR เฉลี่ย
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                (Revenue Per Available Room)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Hotel sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" color="warning.main" gutterBottom>
                {occupancyData.length > 0 ? occupancyData[0].total_rooms : 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ห้องพักทั้งหมด
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Occupancy Chart */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            กราฟการเข้าพักและห้องว่าง
          </Typography>
          <Box sx={{ width: '100%', height: 400, mt: 2 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'ห้องที่เข้าพัก' || name === 'ห้องว่าง') {
                      return [`${value} ห้อง`, name];
                    }
                    return [value, name];
                  }}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="ห้องที่เข้าพัก"
                  stackId="1"
                  stroke="#d32f2f"
                  fill="#d32f2f"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="ห้องว่าง"
                  stackId="1"
                  stroke="#2e7d32"
                  fill="#2e7d32"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Performance Chart */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            ประสิทธิภาพทางการเงิน (ADR & RevPAR)
          </Typography>
          <Box sx={{ width: '100%', height: 350, mt: 2 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: '#000' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="ADR"
                  stroke="#1976d2"
                  strokeWidth={2}
                  yAxisId="left"
                />
                <Line
                  type="monotone"
                  dataKey="RevPAR"
                  stroke="#ff9800"
                  strokeWidth={2}
                  yAxisId="left"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            ตารางรายละเอียดการเข้าพัก
          </Typography>

          {occupancyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>วันที่</strong></TableCell>
                    <TableCell align="center"><strong>ห้องที่เข้าพัก</strong></TableCell>
                    <TableCell align="center"><strong>ห้องว่าง</strong></TableCell>
                    <TableCell align="center"><strong>อัตราการเข้าพัก</strong></TableCell>
                    <TableCell align="right"><strong>ADR</strong></TableCell>
                    <TableCell align="right"><strong>RevPAR</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {occupancyData.map((row) => (
                    <TableRow key={row.date} hover>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${row.occupied_rooms} ห้อง`}
                          color="error"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${row.available_rooms} ห้อง`}
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${row.occupancy_rate}%`}
                          color={row.occupancy_rate >= 80 ? 'success' : row.occupancy_rate >= 60 ? 'warning' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(row.adr)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(row.revpar)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
});

export default OccupancyReportView;