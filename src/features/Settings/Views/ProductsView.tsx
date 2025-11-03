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

  Warning as WarningIcon,
} from '@mui/icons-material';
import { observer } from 'mobx-react-lite';
import { settingsService, type Product } from '../Services/SettingsService';

const ProductsView: React.FC = observer(() => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    category: 'Food' as Product['category'],
    price: 0,
    cost: 0,
    unit: '',
    supplier: '',
    stockQuantity: 0,
    minStockLevel: 0,
    isActive: true,
  });

  const categories: Product['category'][] = ['Food', 'Beverage', 'Amenity', 'Service'];
  const categoryLabels: Record<Product['category'], string> = {
    'Food': 'อาหาร',
    'Beverage': 'เครื่องดื่ม',
    'Amenity': 'สิ่งอำนวยความสะดวก',
    'Service': 'บริการ'
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        price: product.price,
        cost: product.cost,
        unit: product.unit,
        supplier: product.supplier || '',
        stockQuantity: product.stockQuantity,
        minStockLevel: product.minStockLevel,
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Food',
        price: 0,
        cost: 0,
        unit: '',
        supplier: '',
        stockQuantity: 0,
        minStockLevel: 0,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.unit || formData.price <= 0) {
      return;
    }

    const productData = {
      ...formData,
      supplier: formData.supplier || undefined,
    };

    if (editingProduct) {
      settingsService.updateProduct(editingProduct.id, productData);
      setSuccessMessage('อัปเดตสินค้าเรียบร้อยแล้ว!');
    } else {
      settingsService.addProduct(productData);
      setSuccessMessage('สร้างสินค้าเรียบร้อยแล้ว!');
    }

    handleCloseDialog();
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDelete = (product: Product) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ที่จะลบสินค้า "${product.name}"?`)) {
      settingsService.deleteProduct(product.id);
      setSuccessMessage('ลบสินค้าเรียบร้อยแล้ว!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Food': return 'primary';
      case 'Beverage': return 'info';
      case 'Amenity': return 'secondary';
      case 'Service': return 'warning';
      default: return 'default';
    }
  };

  const isLowStock = (product: Product) => {
    return product.stockQuantity <= product.minStockLevel && product.category !== 'Service';
  };

  const lowStockProducts = settingsService.getLowStockProducts();

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
          <Typography variant="h4" sx={{ mb: 1 }}>จัดการสินค้า</Typography>
          <Typography variant="subtitle2" color="text.secondary">
            จัดการข้อมูลสินค้า คลังสินค้า และราคา
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          เพิ่มสินค้า
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1 }} />
            <Typography>
              มีสินค้า {lowStockProducts.length} รายการที่สต็อกเหลือน้อย: {' '}
              {lowStockProducts.map(p => p.name).join(', ')}
            </Typography>
          </Box>
        </Alert>
      )}

      <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อสินค้า</TableCell>
                  <TableCell>หมวดหมู่</TableCell>
                  <TableCell>ราคาขาย</TableCell>
                  <TableCell>ต้นทุน</TableCell>
                  <TableCell>กำไร</TableCell>
                  <TableCell>คลังสินค้า</TableCell>
                  <TableCell>หน่วย</TableCell>
                  <TableCell>ผู้จำหน่าย</TableCell>
                  <TableCell>สถานะ</TableCell>
                  <TableCell>การดำเนินการ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settingsService.products.map((product) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      bgcolor: isLowStock(product) ? 'warning.light' : 'inherit',
                      opacity: product.isActive ? 1 : 0.6
                    }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {product.name}
                        {isLowStock(product) && (
                          <Chip
                            label="สต็อกต่ำ"
                            color="warning"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categoryLabels[product.category]}
                        color={getCategoryColor(product.category) as 'primary' | 'info' | 'secondary' | 'warning' | 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ฿{product.price.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        ฿{product.cost.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={product.price - product.cost > 0 ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        ฿{(product.price - product.cost).toLocaleString()}
                        {product.cost > 0 && (
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            ({(((product.price - product.cost) / product.cost) * 100).toFixed(1)}%)
                          </Typography>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {product.category === 'Service' ? (
                        <Typography variant="body2" color="text.secondary">N/A</Typography>
                      ) : (
                        <Typography
                          variant="body2"
                          color={isLowStock(product) ? 'error.main' : 'text.primary'}
                          fontWeight={isLowStock(product) ? 'bold' : 'normal'}
                        >
                          {product.stockQuantity}
                          <Typography variant="caption" color="text.secondary">
                            {' '}(min: {product.minStockLevel})
                          </Typography>
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.supplier || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        color={getStatusColor(product.isActive)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(product)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(product)}
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
          {editingProduct ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
        </DialogTitle>
        <DialogContent>
          <Grid2 container spacing={3} sx={{ mt: 1 }}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="ชื่อสินค้า"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
                placeholder="เช่น โคล่า, ชุดผ้าขนหนู"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label="หมวดหมู่"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
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
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                type="number"
                label="ราคาขาย (บาท)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                type="number"
                label="ราคาต้นทุน (บาท)"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                label="หน่วย"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                fullWidth
                required
                placeholder="เช่น ชิ้น, ขวด, ชุด"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                label="ผู้จำหน่าย (ไม่บังคับ)"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                fullWidth
                placeholder="ชื่อผู้จำหน่ายหรือบริษัท"
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
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

            {/* Stock Management - Only for non-service items */}
            {formData.category !== 'Service' && (
              <>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    label="จำนวนสินค้าคงคลัง"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <TextField
                    type="number"
                    label="จำนวนสินค้าขั้นต่ำ"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                    fullWidth
                    inputProps={{ min: 0 }}
                    helperText="แจ้งเตือนเมื่อสินค้าเหลือน้อยกว่าระดับนี้"
                  />
                </Grid2>
              </>
            )}

            {/* Profit Calculation Display */}
            {formData.price > 0 && formData.cost > 0 && (
              <Grid2 size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" gutterBottom>การวิเคราะห์กำไร</Typography>
                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 4 }}>
                      <Typography variant="body2">
                        <strong>กำไรต่อหน่วย:</strong> ฿{(formData.price - formData.cost).toLocaleString()}
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 4 }}>
                      <Typography variant="body2">
                        <strong>อัตรากำไร:</strong> {(((formData.price - formData.cost) / formData.cost) * 100).toFixed(1)}%
                      </Typography>
                    </Grid2>
                    <Grid2 size={{ xs: 4 }}>
                      <Typography variant="body2">
                        <strong>อัตราขึ้นราคา:</strong> {(((formData.price - formData.cost) / formData.price) * 100).toFixed(1)}%
                      </Typography>
                    </Grid2>
                  </Grid2>
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
            disabled={!formData.name || !formData.unit || formData.price <= 0}
          >
            {editingProduct ? 'อัปเดต' : 'สร้าง'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default ProductsView;