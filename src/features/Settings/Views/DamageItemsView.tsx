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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,

} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { settingsService, type DamageItem } from '../Services/SettingsService';

const DamageItemsView: React.FC = observer(() => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<DamageItem | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Furniture' as DamageItem['category'],
    replacementCost: 0,
    supplier: '',
    warranty: 0,
    isActive: true,
  });

  const categories: DamageItem['category'][] = ['Furniture', 'Electronics', 'Bathroom', 'Bedding', 'Other'];
  const categoryLabels: Record<DamageItem['category'], string> = {
    'Furniture': 'เฟอร์นิเจอร์',
    'Electronics': 'อุปกรณ์อิเล็กทรอนิกส์',
    'Bathroom': 'ห้องน้ำ',
    'Bedding': 'เครื่องนอน',
    'Other': 'อื่นๆ'
  };

  const handleOpenDialog = (item?: DamageItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        replacementCost: item.replacementCost,
        supplier: item.supplier || '',
        warranty: item.warranty || 0,
        isActive: item.isActive,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'Furniture',
        replacementCost: 0,
        supplier: '',
        warranty: 0,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
  };

  const handleSave = () => {
    if (!formData.name || formData.replacementCost <= 0) {
      return;
    }

    const itemData = {
      ...formData,
      supplier: formData.supplier || undefined,
      warranty: formData.warranty || undefined,
    };

    if (editingItem) {
      settingsService.updateDamageItem(editingItem.id, itemData);
      setSuccessMessage('อัปเดตรายการของชำรุดเรียบร้อยแล้ว!');
    } else {
      settingsService.addDamageItem(itemData);
      setSuccessMessage('สร้างรายการของชำรุดเรียบร้อยแล้ว!');
    }

    handleCloseDialog();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (item: DamageItem) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบรายการ "${item.name}"?`)) {
      settingsService.deleteDamageItem(item.id);
      setSuccessMessage('ลบรายการของชำรุดเรียบร้อยแล้ว!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Furniture': return 'primary';
      case 'Electronics': return 'info';
      case 'Bathroom': return 'secondary';
      case 'Bedding': return 'warning';
      case 'Other': return 'default';
      default: return 'default';
    }
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
          <Typography variant="h4" sx={{ mb: 1 }}>จัดการของชำรุด</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            จัดการรายการของที่อาจได้รับความเสียหาย และต้นทุนในการเปลี่ยน
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          เพิ่มรายการของชำรุด
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
                  <TableCell>ชื่อรายการ</TableCell>
                  <TableCell>หมวดหมู่</TableCell>
                  <TableCell>ต้นทุนการเปลี่ยน</TableCell>
                  <TableCell>ผู้จำหน่าย</TableCell>
                  <TableCell>การรับประกัน</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settingsService.damageItems.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{ opacity: item.isActive ? 1 : 0.6 }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categoryLabels[item.category]}
                        color={getCategoryColor(item.category) as 'primary' | 'info' | 'secondary' | 'warning' | 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ฿{item.replacementCost.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.supplier || '-'}</TableCell>
                    <TableCell>
                      {item.warranty ? `${item.warranty} เดือน` : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        color={getStatusColor(item.isActive)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item)}
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'แก้ไขรายการของชำรุด' : 'เพิ่มรายการของชำรุดใหม่'}
        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={3} sx={{ mt: 1 }}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="ชื่อรายการ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="เช่น ผ้าปูที่นอน, รีโมททีวี"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="หมวดหมู่"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as DamageItem['category'] })}
                fullWidth
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {categoryLabels[category]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                type="number"
                label="ต้นทุนการเปลี่ยน (บาท)"
                value={formData.replacementCost}
                onChange={(e) => setFormData({ ...formData, replacementCost: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                type="number"
                label="การรับประกัน (เดือน)"
                value={formData.warranty}
                onChange={(e) => setFormData({ ...formData, warranty: parseInt(e.target.value) || 0 })}
                fullWidth
                inputProps={{ min: 0, max: 120 }}
                helperText="ใส่ 0 หากไม่มีการรับประกัน"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 8 }}>
              <TextField
                label="ผู้จำหน่าย (ไม่บังคับ)"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                fullWidth
                placeholder="ชื่อผู้จำหน่ายหรือบริษัท"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="เปิดใช้งาน"
                />
              </Box>
            </Grid2>
          </Grid2>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>ยกเลิก</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!formData.name || formData.replacementCost <= 0}
          >
            {editingItem ? 'อัปเดต' : 'สร้าง'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default DamageItemsView;