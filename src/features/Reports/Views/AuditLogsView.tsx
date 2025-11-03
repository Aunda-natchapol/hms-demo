import type { FC } from "react";
import { observer } from "mobx-react-lite";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Avatar,
} from "@mui/material";
import Grid from '@mui/material/Grid2';
import {
  Security,
  Download,
  DateRange,
  Person,
  Computer,
  FilterList,
} from '@mui/icons-material';
import reportService from "../Services/ReportService.ts";

const AuditLogsView: FC = observer(() => {
  const {
    filteredAuditLogs,
    auditLoading,
    auditStartDate,
    auditEndDate,
    auditModule,
  } = reportService;

  const handleStartDateChange = (date: string) => {
    reportService.setAuditStartDate(date);
  };

  const handleEndDateChange = (date: string) => {
    reportService.setAuditEndDate(date);
  };

  const handleModuleChange = (module: string) => {
    reportService.setAuditModule(module);
  };

  const handleRefresh = () => {
    reportService.loadAuditLogs();
  };

  const handleExport = () => {
    reportService.exportAuditLogs();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('th-TH');
  };

  const getActionColor = (action: string) => {
    if (action.includes('เข้าสู่ระบบ')) return 'success';
    if (action.includes('ออกจากระบบ')) return 'info';
    if (action.includes('ยกเลิก') || action.includes('ลบ')) return 'error';
    if (action.includes('สร้าง') || action.includes('เพิ่ม')) return 'primary';
    if (action.includes('แก้ไข')) return 'warning';
    return 'default';
  };

  const getModuleColor = (module: string) => {
    switch (module) {
      case 'Authentication': return 'success';
      case 'Reservations': return 'primary';
      case 'FrontDesk': return 'warning';
      case 'RoomOps': return 'info';
      case 'Settings': return 'secondary';
      default: return 'default';
    }
  };

  const modules = [
    { value: 'all', label: 'ทุกโมดูล' },
    { value: 'Authentication', label: 'การยืนยันตัวตน' },
    { value: 'Reservations', label: 'การจองห้องพัก' },
    { value: 'FrontDesk', label: 'แผนกต้อนรับ' },
    { value: 'RoomOps', label: 'การจัดการห้องพัก' },
    { value: 'Settings', label: 'ตั้งค่าระบบ' },
  ];

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
          บันทึกการใช้งานระบบ
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          ติดตามและตรวจสอบการใช้งานระบบของผู้ใช้ทั้งหมด
        </Typography>
      </Box>

      {/* Controls */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 2.5 }}>
              <TextField
                fullWidth
                type="date"
                label="วันที่เริ่มต้น"
                value={auditStartDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2.5 }}>
              <TextField
                fullWidth
                type="date"
                label="วันที่สิ้นสุด"
                value={auditEndDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2.5 }}>
              <FormControl fullWidth>
                <InputLabel>โมดูล</InputLabel>
                <Select
                  value={auditModule}
                  onChange={(e) => handleModuleChange(e.target.value)}
                  label="โมดูล"
                >
                  {modules.map((module) => (
                    <MenuItem key={module.value} value={module.value}>
                      {module.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4.5 }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={auditLoading ? <CircularProgress size={20} /> : <FilterList />}
                  onClick={handleRefresh}
                  disabled={auditLoading}
                >
                  {auditLoading ? 'กำลังโหลด...' : 'กรองข้อมูล'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  onClick={handleExport}
                  disabled={auditLoading || filteredAuditLogs.length === 0}
                >
                  ส่งออก CSV
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" color="primary.main" gutterBottom>
                {filteredAuditLogs.length}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                บันทึกทั้งหมด
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" color="success.main" gutterBottom>
                {new Set(filteredAuditLogs.map(log => log.user_id)).size}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                ผู้ใช้ที่ใช้งาน
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Computer sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
              <Typography variant="h4" color="info.main" gutterBottom>
                {new Set(filteredAuditLogs.map(log => log.ip_address)).size}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                IP Address ที่แตกต่าง
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <DateRange sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" color="warning.main" gutterBottom>
                {Math.ceil((new Date(auditEndDate).getTime() - new Date(auditStartDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                วันในรายงาน
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Activity by Module */}
      <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            การใช้งานแยกตามโมดูล
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {modules.slice(1).map((module) => {
              const count = filteredAuditLogs.filter(log => log.module === module.value).length;
              return (
                <Grid size={{ xs: 6, md: 2.4 }} key={module.value}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="h5" color={`${getModuleColor(module.value)}.main`}>
                        {count}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {module.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            รายละเอียดบันทึกการใช้งาน
          </Typography>

          {auditLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>เวลา</strong></TableCell>
                    <TableCell><strong>ผู้ใช้</strong></TableCell>
                    <TableCell><strong>โมดูล</strong></TableCell>
                    <TableCell><strong>การกระทำ</strong></TableCell>
                    <TableCell><strong>รายละเอียด</strong></TableCell>
                    <TableCell><strong>IP Address</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAuditLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          ไม่พบบันทึกการใช้งานในช่วงเวลาที่เลือก
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <TableRow key={log.id} hover>
                        <TableCell sx={{ minWidth: 160 }}>
                          <Typography variant="body2">
                            {formatDateTime(log.timestamp)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                              {log.user_name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {log.user_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {log.user_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.module}
                            color={getModuleColor(log.module)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action}
                            color={getActionColor(log.action)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Typography
                            variant="body2"
                            noWrap
                            title={log.details}
                          >
                            {log.details}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontFamily="monospace">
                            {log.ip_address}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
});

export default AuditLogsView;