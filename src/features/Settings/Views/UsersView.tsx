import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid2,
  Chip,
  IconButton,
  Alert,
  FormControlLabel,
  Switch,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,

  Security as SecurityIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { settingsService, type User } from '../Services/SettingsService';

const UsersView: React.FC = observer(() => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    roleId: '',
    department: 'Front Desk' as User['department'],
    isActive: true,
  });

  const departments: User['department'][] = ['Front Desk', 'Housekeeping', 'Maintenance', 'Management', 'F&B'];
  const departmentLabels: Record<User['department'], string> = {
    'Front Desk': 'แผนกต้อนรับ',
    'Housekeeping': 'แผนกแม่บ้าน',
    'Maintenance': 'แผนกซ่อมบำรุง',
    'Management': 'แผนกจัดการ',
    'F&B': 'แผนกอาหารและเครื่องดื่ม'
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roleId: user.role.id,
        department: user.department,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        roleId: '',
        department: 'Front Desk',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSave = () => {
    if (!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.roleId) {
      return;
    }

    const selectedRole = settingsService.roles.find(r => r.id === formData.roleId);
    if (!selectedRole) return;

    const userData = {
      username: formData.username,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: selectedRole,
      department: formData.department,
      isActive: formData.isActive,
    };

    if (editingUser) {
      settingsService.updateUser(editingUser.id, userData);
      setSuccessMessage('อัปเดตผู้ใช้งานเรียบร้อยแล้ว!');
    } else {
      settingsService.addUser(userData);
      setSuccessMessage('สร้างผู้ใช้งานเรียบร้อยแล้ว!');
    }

    handleCloseDialog();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้งาน "${user.firstName} ${user.lastName}"?`)) {
      settingsService.deleteUser(user.id);
      setSuccessMessage('ลบผู้ใช้งานเรียบร้อยแล้ว!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Management': return 'primary';
      case 'Front Desk': return 'info';
      case 'Housekeeping': return 'secondary';
      case 'Maintenance': return 'warning';
      case 'F&B': return 'error';
      default: return 'default';
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatLastLogin = (lastLogin?: Date) => {
    if (!lastLogin) return 'ไม่เคย';
    const now = new Date();
    const diffInHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'เมื่อสักครู่';
    if (diffInHours < 24) return `${Math.floor(diffInHours)} ชั่วโมงที่แล้ว`;
    return lastLogin.toLocaleDateString('th-TH');
  };

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 'none',
      bgcolor: 'background.default',
      minHeight: '100vh',
      p: 3
    }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>จัดการผู้ใช้งาน</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            จัดการบัญชีผู้ใช้งาน สิทธิ์การใช้งาน และแผนก
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          เพิ่มผู้ใช้งาน
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid2 container spacing={3} sx={{ mb: 3 }}>
        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">ผู้ใช้งานทั้งหมด</Typography>
              </Box>
              <Typography variant="h4">{settingsService.users.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                {settingsService.getActiveUsers().length} ใช้งานอยู่
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        <Grid2 size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SecurityIcon color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h6">บทบาท</Typography>
              </Box>
              <Typography variant="h4">{settingsService.roles.length}</Typography>
              <Typography variant="body2" color="text.secondary">
                {settingsService.getActiveRoles().length} ใช้งานอยู่
              </Typography>
            </CardContent>
          </Card>
        </Grid2>

        {departments.slice(0, 2).map((dept) => (
          <Grid2 key={dept} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
              <CardContent sx={{ background: 'transparent' }}>
                <Typography variant="h6">{departmentLabels[dept]}</Typography>
                <Typography variant="h4">
                  {settingsService.getUsersByDepartment(dept).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ผู้ใช้งาน
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ผู้ใช้งาน</TableCell>
                  <TableCell>อีเมล</TableCell>
                  <TableCell>บทบาท</TableCell>
                  <TableCell>แผนก</TableCell>
                  <TableCell>เข้าสู่ระบบล่าสุด</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settingsService.users.map((user) => (
                  <TableRow
                    key={user.id}
                    sx={{ opacity: user.isActive ? 1 : 0.6 }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {getUserInitials(user.firstName, user.lastName)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {user.firstName} {user.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.name}
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={departmentLabels[user.department]}
                        color={getDepartmentColor(user.department) as 'primary' | 'info' | 'secondary' | 'warning' | 'error' | 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatLastLogin(user.lastLogin)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        color={getStatusColor(user.isActive)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(user)}
                        color="error"
                        disabled={user.username === 'admin'} // Protect admin user
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งานใหม่'}
        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={3} sx={{ mt: 1 }}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="ชื่อผู้ใช้งาน"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                fullWidth
                required
                placeholder="เช่น john.doe"
                disabled={editingUser?.username === 'admin'} // Protect admin username
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                type="email"
                label="อีเมล"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                required
                placeholder="user@hotel.com"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="ชื่อจริง"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                fullWidth
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="นามสกุล"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                fullWidth
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="บทบาท"
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                fullWidth
                required
                disabled={editingUser?.username === 'admin'} // Protect admin role
              >
                {settingsService.getActiveRoles().map((role) => (
                  <MenuItem key={role.id} value={role.id}>
                    {role.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="แผนก"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as User['department'] })}
                fullWidth
                required
              >
                {departments.map((department) => (
                  <MenuItem key={department} value={department}>
                    {departmentLabels[department]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    disabled={editingUser?.username === 'admin'} // Protect admin status
                  />
                }
                label="เปิดใช้งาน"
              />
            </Grid2>

            {/* Role Permissions Preview */}
            {formData.roleId && (
              <Grid2 size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>สิทธิ์การใช้งาน</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {settingsService.roles.find(r => r.id === formData.roleId)?.permissions.map((permission) => (
                      <Chip
                        key={permission.id}
                        label={permission.name}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>
                </Card>
              </Grid2>
            )}
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.username || !formData.email || !formData.firstName || !formData.lastName || !formData.roleId}
          >
            {editingUser ? 'อัปเดต' : 'สร้าง'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default UsersView;