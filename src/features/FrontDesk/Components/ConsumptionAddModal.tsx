import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Card,
    CardContent,
    Grid,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Add,
    Remove,
    ShoppingCart,
    LocalDrink,
    Fastfood,
    MiscellaneousServices,
    Delete,
} from '@mui/icons-material';
import type { IProduct } from '../../../types';

interface ConsumptionItem {
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    total: number;
    category: string;
}

interface ConsumptionAddModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (items: ConsumptionItem[]) => void;
}

const ConsumptionAddModal: React.FC<ConsumptionAddModalProps> = ({
    open,
    onClose,
    onConfirm,
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);
    const [consumptionItems, setConsumptionItems] = useState<ConsumptionItem[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Mock products data - in real app this would come from a service
    const mockProducts: IProduct[] = [
        {
            id: 'drink-001',
            hotel_id: 'hotel-1',
            name: 'น้ำดื่ม',
            category: 'beverages',
            price: 20,
            stock_quantity: 100,
            unit: 'ขวด',
            is_active: true,
        },
        {
            id: 'drink-002',
            hotel_id: 'hotel-1',
            name: 'โค้ก',
            category: 'beverages',
            price: 35,
            stock_quantity: 50,
            unit: 'กระป๋อง',
            is_active: true,
        },
        {
            id: 'snack-001',
            hotel_id: 'hotel-1',
            name: 'มาม่า',
            category: 'snacks',
            price: 15,
            stock_quantity: 30,
            unit: 'ซอง',
            is_active: true,
        },
        {
            id: 'snack-002',
            hotel_id: 'hotel-1',
            name: 'ลูกอม',
            category: 'snacks',
            price: 10,
            stock_quantity: 25,
            unit: 'ถุง',
            is_active: true,
        },
        {
            id: 'service-001',
            hotel_id: 'hotel-1',
            name: 'บริการซักผ้า',
            category: 'services',
            price: 100,
            stock_quantity: 999,
            unit: 'ครั้ง',
            is_active: true,
        },
        {
            id: 'service-002',
            hotel_id: 'hotel-1',
            name: 'อาหารเช้าเพิ่ม',
            category: 'services',
            price: 250,
            stock_quantity: 999,
            unit: 'มื้อ',
            is_active: true,
        },
    ];

    const categories = [
        { value: 'all', label: 'ทั้งหมด', icon: ShoppingCart },
        { value: 'beverages', label: 'เครื่องดื่ม', icon: LocalDrink },
        { value: 'snacks', label: 'ขนม/อาหาร', icon: Fastfood },
        { value: 'services', label: 'บริการ', icon: MiscellaneousServices },
    ];

    const filteredProducts = mockProducts.filter(product => {
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch && product.is_active;
    });

    const getCategoryIcon = (category: string) => {
        const categoryData = categories.find(cat => cat.value === category);
        const IconComponent = categoryData?.icon || ShoppingCart;
        return <IconComponent sx={{ fontSize: 20 }} />;
    };

    const handleAddItem = () => {
        if (!selectedProduct || quantity <= 0) return;

        const product = mockProducts.find(p => p.id === selectedProduct);
        if (!product) return;

        const existingItemIndex = consumptionItems.findIndex(
            item => item.product_id === selectedProduct
        );

        if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...consumptionItems];
            updatedItems[existingItemIndex].quantity += quantity;
            updatedItems[existingItemIndex].total =
                updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].price;
            setConsumptionItems(updatedItems);
        } else {
            // Add new item
            const newItem: ConsumptionItem = {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity: quantity,
                total: product.price * quantity,
                category: product.category || 'other',
            };
            setConsumptionItems([...consumptionItems, newItem]);
        }

        // Reset form
        setSelectedProduct('');
        setQuantity(1);
    };

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            handleRemoveItem(productId);
            return;
        }

        const updatedItems = consumptionItems.map(item => {
            if (item.product_id === productId) {
                return {
                    ...item,
                    quantity: newQuantity,
                    total: newQuantity * item.price,
                };
            }
            return item;
        });
        setConsumptionItems(updatedItems);
    };

    const handleRemoveItem = (productId: string) => {
        setConsumptionItems(consumptionItems.filter(item => item.product_id !== productId));
    };

    const getTotalAmount = () => {
        return consumptionItems.reduce((sum, item) => sum + item.total, 0);
    };

    const handleConfirm = () => {
        if (consumptionItems.length === 0) return;
        onConfirm(consumptionItems);
        handleClose();
    };

    const handleClose = () => {
        setConsumptionItems([]);
        setSelectedProduct('');
        setQuantity(1);
        setSelectedCategory('all');
        setSearchTerm('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ShoppingCart sx={{ mr: 1, color: 'primary.main' }} />
                    เพิ่มการใช้สินค้าและบริการ
                </Box>
            </DialogTitle>

            <DialogContent>
                <Grid container spacing={3}>
                    {/* Product Selection */}
                    <Grid item xs={12} md={7}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    เลือกสินค้า
                                </Typography>

                                {/* Category Filter */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        หมวดหมู่
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {categories.map(category => {
                                            const IconComponent = category.icon;
                                            return (
                                                <Chip
                                                    key={category.value}
                                                    icon={<IconComponent />}
                                                    label={category.label}
                                                    onClick={() => setSelectedCategory(category.value)}
                                                    variant={selectedCategory === category.value ? 'filled' : 'outlined'}
                                                    color={selectedCategory === category.value ? 'primary' : 'default'}
                                                    size="small"
                                                />
                                            );
                                        })}
                                    </Box>
                                </Box>

                                {/* Search */}
                                <TextField
                                    fullWidth
                                    placeholder="ค้นหาสินค้า..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="small"
                                    sx={{ mb: 2 }}
                                />

                                {/* Product Selection */}
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>เลือกสินค้า</InputLabel>
                                    <Select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        label="เลือกสินค้า"
                                    >
                                        {filteredProducts.map(product => (
                                            <MenuItem key={product.id} value={product.id}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                    {getCategoryIcon(product.category || 'other')}
                                                    <Box sx={{ ml: 1, flexGrow: 1 }}>
                                                        <Typography variant="body2">
                                                            {product.name}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            ฿{product.price} / {product.unit}
                                                        </Typography>
                                                    </Box>
                                                    <Chip
                                                        size="small"
                                                        label={`คงเหลือ ${product.stock_quantity}`}
                                                        color={(product.stock_quantity || 0) > 10 ? 'success' : 'warning'}
                                                    />
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Quantity */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <TextField
                                        label="จำนวน"
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                        inputProps={{ min: 1 }}
                                        size="small"
                                        sx={{ width: 120 }}
                                    />
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={handleAddItem}
                                        disabled={!selectedProduct}
                                    >
                                        เพิ่ม
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Shopping Cart */}
                    <Grid item xs={12} md={5}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    รายการที่เลือก ({consumptionItems.length})
                                </Typography>

                                {consumptionItems.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 3 }}>
                                        <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                            ยังไม่มีรายการ
                                        </Typography>
                                    </Box>
                                ) : (
                                    <>
                                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                            {consumptionItems.map((item) => (
                                                <Card key={item.product_id} variant="outlined" sx={{ mb: 1 }}>
                                                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography variant="body2" fontWeight="medium">
                                                                    {item.product_name}
                                                                </Typography>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    ฿{item.price} × {item.quantity} = ฿{item.total}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                                                                >
                                                                    <Remove fontSize="small" />
                                                                </IconButton>
                                                                <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'center' }}>
                                                                    {item.quantity}
                                                                </Typography>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                                                                >
                                                                    <Add fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleRemoveItem(item.product_id)}
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>

                                        <Divider sx={{ my: 2 }} />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                รวมทั้งหมด
                                            </Typography>
                                            <Typography variant="h6" fontWeight="bold" color="primary">
                                                ฿{getTotalAmount().toLocaleString()}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {consumptionItems.length > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                            รายการเหล่านี้จะถูกเพิ่มเข้าในบิลของแขก และจะถูกรวมในการคำนวณค่าใช้จ่ายทั้งหมด
                        </Typography>
                    </Alert>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>
                    ยกเลิก
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={consumptionItems.length === 0}
                    startIcon={<Add />}
                >
                    เพิ่มรายการ ({consumptionItems.length})
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConsumptionAddModal;