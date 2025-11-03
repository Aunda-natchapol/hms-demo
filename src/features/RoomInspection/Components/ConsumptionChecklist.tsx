import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    Chip,
    Divider,
} from '@mui/material';
import {
    Add,
    Delete,
    ShoppingCart,
} from '@mui/icons-material';
import type { IProduct, IConsumption } from '../../../types';

interface ConsumptionChecklistProps {
    products: IProduct[];
    consumptions: IConsumption[];
    onAddConsumption: (productId: string, quantity: number) => void;
    onRemoveConsumption: (consumptionId: string) => void;
    totalAmount: number;
}

const ConsumptionChecklist: React.FC<ConsumptionChecklistProps> = ({
    products,
    consumptions,
    onAddConsumption,
    onRemoveConsumption,
    totalAmount
}) => {
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);

    const handleAddConsumption = () => {
        if (selectedProductId && quantity > 0) {
            onAddConsumption(selectedProductId, quantity);
            setSelectedProductId('');
            setQuantity(1);
        }
    };

    const getProductById = (productId: string) => {
        return products.find(p => p.id === productId);
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                        รายการสินค้าที่ใช้
                    </Typography>
                </Box>

                {/* Add new consumption */}
                <Box sx={{ mb: 3, p: 2, bgcolor: '#F5F6FA', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        เพิ่มรายการสินค้าที่ใช้
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>เลือกสินค้า</InputLabel>
                            <Select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(e.target.value)}
                                label="เลือกสินค้า"
                            >
                                {products.map((product) => (
                                    <MenuItem key={product.id} value={product.id}>
                                        {product.name} (฿{product.price})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="จำนวน"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            inputProps={{ min: 1 }}
                            sx={{ width: 100 }}
                        />

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleAddConsumption}
                            disabled={!selectedProductId}
                        >
                            เพิ่ม
                        </Button>
                    </Box>
                </Box>

                {/* Consumption list */}
                {consumptions.length > 0 ? (
                    <>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>สินค้า</TableCell>
                                        <TableCell align="center">จำนวน</TableCell>
                                        <TableCell align="right">ราคา/หน่วย</TableCell>
                                        <TableCell align="right">รวม</TableCell>
                                        <TableCell align="center">จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {consumptions.map((consumption) => {
                                        const product = getProductById(consumption.product_id);
                                        return (
                                            <TableRow key={consumption.id}>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {product?.name || 'ไม่ทราบ'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {product?.code}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip size="small" label={consumption.quantity} />
                                                </TableCell>
                                                <TableCell align="right">
                                                    ฿{consumption.price.toLocaleString()}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight="medium">
                                                        ฿{(consumption.price * consumption.quantity).toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onRemoveConsumption(consumption.id)}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                รายการทั้งหมด: {consumptions.length} รายการ
                            </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                                รวม: ฿{totalAmount.toLocaleString()}
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            ยังไม่มีรายการสินค้าที่ใช้
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default ConsumptionChecklist;