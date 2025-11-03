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
  Payment,
  TrendingUp,
  Download,
  DateRange,
  ShowChart,
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
  BarChart,
  Bar,
} from 'recharts';
import reportService from "../Services/ReportService.ts";

const RevenueReportView: FC = observer(() => {
  const {
    revenueData,
    revenueLoading,
    revenueStartDate,
    revenueEndDate,
    totalRevenue,
    averageOccupancy,
  } = reportService;

  const handleStartDateChange = (date: string) => {
    reportService.setRevenueStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    reportService.setRevenueEndDate(date);
  };

  const handleRefresh = () => {
    reportService.loadRevenueReport();
  };

  const handleExport = () => {
    reportService.exportRevenueReport();
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

  const chartData = revenueData.map(item => ({
    date: formatDate(item.date),
    'รายได้ห้องพัก': item.room_revenue,
    'รายได้บริการ': item.service_revenue,
    'รายได้รวม': item.total_revenue,
    'อัตราการเข้าพัก': item.occupancy_rate,
  }));

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
          รายงานรายได้
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          วิเคราะห์รายได้และประสิทธิภาพทางการเงินของโรงแรม
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
                value={revenueStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="วันที่สิ้นสุด"
                value={revenueEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={revenueLoading ? <CircularProgress size={20} /> : <DateRange />}
                  onClick={handleRefresh}
                  disabled={revenueLoading}
                >
                  {revenueLoading ? 'กำลังโหลด...' : 'รีเฟรช'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExport}
                  disabled={revenueLoading || revenueData.length === 0}
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Payment sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" color="primary.main" gutterBottom>
                {formatCurrency(totalRevenue)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                รายได้รวมทั้งหมด
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                {averageOccupancy}%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                อัตราการเข้าพักเฉลี่ย
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShowChart sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" color="info.main" gutterBottom>
                {revenueData.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                จำนวนวันในรายงาน
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            กราฟรายได้รายวัน
          </Typography>
          <Box sx={{ width: '100%', height: 400, mt: 2 }}>
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
                  dataKey="รายได้ห้องพัก"
                  stroke="#1976d2"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="รายได้บริการ"
                  stroke="#2e7d32"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="รายได้รวม"
                  stroke="#d32f2f"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Occupancy Chart */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            อัตราการเข้าพักรายวัน
          </Typography>
          <Box sx={{ width: '100%', height: 300, mt: 2 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
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
                  formatter={(value: number) => `${value}%`}
                  labelStyle={{ color: '#000' }}
                />
                <Bar dataKey="อัตราการเข้าพัก" fill="#ff9800" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            ตารางรายละเอียดรายได้
          </Typography>

          {revenueLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>วันที่</strong></TableCell>
                    <TableCell align="right"><strong>รายได้ห้องพัก</strong></TableCell>
                    <TableCell align="right"><strong>รายได้บริการ</strong></TableCell>
                    <TableCell align="right"><strong>รายได้รวม</strong></TableCell>
                    <TableCell align="center"><strong>อัตราการเข้าพัก</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {revenueData.map((row) => (
                    <TableRow key={row.date} hover>
                      <TableCell>{formatDate(row.date)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.room_revenue)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.service_revenue)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(row.total_revenue)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${row.occupancy_rate}%`}
                          color={row.occupancy_rate >= 80 ? 'success' : row.occupancy_rate >= 60 ? 'warning' : 'error'}
                          size="small"
                        />
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

export default RevenueReportView;