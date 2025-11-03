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
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { settingsService, type RoomType } from '../Services/SettingsService';

const RoomTypesView: React.FC = observer(() => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseRate: 0,
    capacity: 1,
    bedType: 'Single' as RoomType['bedType'],
    amenities: [] as string[],
    isActive: true,
  });

  const bedTypes: RoomType['bedType'][] = ['Single', 'Double', 'Twin', 'King', 'Queen'];
  const bedTypeLabels: Record<RoomType['bedType'], string> = {
    'Single': 'เตียงเดี่ยว',
    'Double': 'เตียงคู่',
    'Twin': 'เตียงแฝด',
    'King': 'เตียงคิง',
    'Queen': 'เตียงควีน'
  };
  const availableAmenities = [
    'WiFi', 'AC', 'TV', 'Minibar', 'Safe', 'Balcony',
    'Coffee Machine', 'Bathtub', 'Work Desk', 'Living Room',
    'Kitchenette', 'Room Service', 'Laundry Service'
  ];
  const amenityLabels: Record<string, string> = {
    'WiFi': 'WiFi',
    'AC': 'เครื่องปรับอากาศ',
    'TV': 'ทีวี',
    'Minibar': 'มินิบาร์',
    'Safe': 'ตู้นิรภัย',
    'Balcony': 'ระเบียง',
    'Coffee Machine': 'เครื่องทำกาแฟ',
    'Bathtub': 'อ่างอาบน้ำ',
    'Work Desk': 'โต๊ะทำงาน',
    'Living Room': 'ห้องนั่งเล่น',
    'Kitchenette': 'ครัวเล็ก',
    'Room Service': 'รูมเซอร์วิส',
    'Laundry Service': 'บริการซักรีด'
  };

  const handleOpenDialog = (roomType?: RoomType) => {
    if (roomType) {
      setEditingRoomType(roomType);
      setFormData({
        name: roomType.name,
        description: roomType.description,
        baseRate: roomType.baseRate,
        capacity: roomType.capacity,
        bedType: roomType.bedType,
        amenities: roomType.amenities,
        isActive: roomType.isActive,
      });
    } else {
      setEditingRoomType(null);
      setFormData({
        name: '',
        description: '',
        baseRate: 0,
        capacity: 1,
        bedType: 'Single',
        amenities: [],
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRoomType(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.description || formData.baseRate <= 0) {
      return;
    }

    if (editingRoomType) {
      settingsService.updateRoomType(editingRoomType.id, formData);
      setSuccessMessage('อัปเดตประเภทห้องเรียบร้อย!');
    } else {
      settingsService.addRoomType(formData);
      setSuccessMessage('สร้างประเภทห้องเรียบร้อย!');
    }

    handleCloseDialog();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (roomType: RoomType) => {
    if (window.confirm(`Are you sure you want to delete "${roomType.name}"?`)) {
      settingsService.deleteRoomType(roomType.id);
      setSuccessMessage('ลบประเภทห้องเรียบร้อย!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  return (
    <Box sx={{
      width: '100%',
      maxWidth: 'none',
      p: { xs: 2, md: 3 },
      bgcolor: 'background.default',
      minHeight: '100vh'
    }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          ประเภทห้องและราคา
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          จัดการประเภทห้องพักและกำหนดราคาแต่ละประเภท
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box></Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          เพิ่มประเภทห้อง
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อ</TableCell>
                  <TableCell>คำอธิบาย</TableCell>
                  <TableCell>ราคาพื้นฐาน</TableCell>
                  <TableCell>จำนวนผู้เข้าพัก</TableCell>
                  <TableCell>ประเภทเตียง</TableCell>
                  <TableCell>สิ่งอำนวยความสะดวก</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settingsService.roomTypes.map((roomType) => (
                  <TableRow key={roomType.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {roomType.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }}>
                        {roomType.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ฿{roomType.baseRate.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{roomType.capacity} คน</TableCell>
                    <TableCell>{bedTypeLabels[roomType.bedType]}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 200 }}>
                        {roomType.amenities.slice(0, 3).map((amenity) => (
                          <Chip key={amenity} label={amenityLabels[amenity] || amenity} size="small" />
                        ))}
                        {roomType.amenities.length > 3 && (
                          <Chip
                            label={`+${roomType.amenities.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={roomType.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        color={getStatusColor(roomType.isActive)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(roomType)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(roomType)}
                        color="error"
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>เพิ่มประเภทห้อง</DialogTitle>
        <DialogContent>
          <Grid2 container spacing={3} sx={{ mt: 1 }}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="ชื่อประเภทห้อง"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="เช่น ห้องเดี่ยวมาตรฐาน"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="ประเภทเตียง"
                value={formData.bedType}
                onChange={(e) => setFormData({ ...formData, bedType: e.target.value as RoomType['bedType'] })}
                fullWidth
                required
                SelectProps={{ native: true }}
              >
                {bedTypes.map((type) => (
                  <option key={type} value={type}>
                    {bedTypeLabels[type]}
                  </option>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <TextField
                label="คำอธิบาย"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                required
                multiline
                rows={3}
                placeholder="อธิบายลักษณะและคุณสมบัติของประเภทห้อง"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                type="number"
                label="ราคาพื้นฐาน (บาท)"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
                inputProps={{ min: 0, step: 100 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                type="number"
                label="จำนวนผู้เข้าพัก"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                fullWidth
                required
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <Autocomplete
                multiple
                options={availableAmenities}
                value={formData.amenities}
                onChange={(_, newValue) => setFormData({ ...formData, amenities: newValue })}
                getOptionLabel={(option) => amenityLabels[option] || option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="สิ่งอำนวยความสะดวก"
                    placeholder="เลือกสิ่งอำนวยความสะดวก"
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={amenityLabels[option] || option}
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
              />
            </Grid2>
            <Grid2 size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="เปิดใช้งาน"
              />
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || !formData.description || formData.baseRate <= 0}
          >
            {editingRoomType ? 'อัปเดต' : 'สร้าง'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default RoomTypesView;