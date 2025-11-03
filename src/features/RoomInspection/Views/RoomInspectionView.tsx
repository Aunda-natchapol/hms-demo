import React from 'react';
import { observer } from 'mobx-react-lite';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Alert,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
    Save,
    Hotel,
    ShoppingCart,
    Refresh,
} from '@mui/icons-material';

import roomInspectionService from '../Services/RoomInspectionService';
import ItemConditionChecklist from '../Components/ItemConditionChecklist.tsx';
import ConsumptionList from '../Components/ConsumptionList';
import type { IDamageReport } from '../../../types';

const RoomInspectionView: React.FC = observer(() => {
    const {
        availableRooms,
        products,
        damageItems,
        selectedRoom,
        selectedReservation,
        currentInspection,
        totalConsumptionAmount,
        totalDamageAmount,
        totalInspectionAmount,
    } = roomInspectionService;

    // แสดงเฉพาะห้องที่รอตรวจสอบ (pending_inspection)
    const roomsToInspect = availableRooms.filter(room => room.status === 'pending_inspection');

    const handleRoomSelect = async (roomId: string) => {
        await roomInspectionService.selectRoom(roomId);
    };

    const handleAddProduct = (productId: string) => {
        // เช็คว่ามีรายการเดิมหรือไม่
        const existingConsumption = currentInspection?.consumptions.find(c => c.product_id === productId);
        if (existingConsumption) {
            // ถ้ามี เพิ่มจำนวนในรายการเดิม
            roomInspectionService.addConsumption(productId, 1);
        } else {
            // ถ้าไม่มี สร้างรายการใหม่
            roomInspectionService.addConsumption(productId, 1);
        }
    };

    const handleRemoveProduct = (productId: string) => {
        const existingConsumption = currentInspection?.consumptions.find(c => c.product_id === productId);
        if (existingConsumption) {
            if (existingConsumption.quantity > 1) {
                // ถ้ามีมากกว่า 1 ลดจำนวน
                roomInspectionService.removeConsumption(existingConsumption.id);
                roomInspectionService.addConsumption(productId, existingConsumption.quantity - 1);
            } else {
                // ถ้าเหลือ 1 ลบรายการ
                roomInspectionService.removeConsumption(existingConsumption.id);
            }
        }
    };



    const handleSubmitInspection = async () => {
        const success = await roomInspectionService.submitInspection();
        if (success) {
            alert('บันทึกผลการตรวจสอบเรียบร้อยแล้ว');
        } else {
            alert('เกิดข้อผิดพลาดในการบันทึก กรุณาลองอีกครั้ง');
        }
    };

    const handleReset = () => {
        roomInspectionService.resetInspection();
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                ตรวจสอบห้องพัก
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                บันทึกการใช้สินค้าและตรวจสอบความเสียหายหลังแขกเช็คเอาต์
            </Typography>

            {!selectedRoom && (
                <Card sx={{ mb: 3, boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                    <CardContent sx={{ background: 'transparent' }}>
                        <Typography variant="h6" gutterBottom>
                            เลือกห้องที่ต้องการตรวจสอบ
                        </Typography>

                        <FormControl fullWidth>
                            <InputLabel>ห้องที่ต้องตรวจสอบ</InputLabel>
                            <Select
                                value=""
                                label="ห้องที่ต้องตรวจสอบ"
                                onChange={(e) => e.target.value && handleRoomSelect(e.target.value)}
                            >
                                {roomsToInspect.map((room) => (
                                    <MenuItem key={room.id} value={room.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                            <Hotel sx={{ mr: 2, color: 'primary.main' }} />
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography variant="body1">
                                                    ห้อง {room.number}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    ชั้น {room.floor} • สถานะ: รอตรวจสอบ
                                                </Typography>
                                            </Box>
                                            <Chip
                                                size="small"
                                                label="รอตรวจสอบ"
                                                color="error"
                                                sx={{ ml: 1 }}
                                            />
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {roomsToInspect.length === 0 && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                ไม่มีห้องที่ต้องตรวจสอบในขณะนี้
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            )}

            {!selectedRoom && (
                <Alert severity="info" sx={{ textAlign: 'center' }}>
                    <Typography variant="body1">
                        เลือกห้องเพื่อเริ่มการตรวจสอบ
                    </Typography>
                </Alert>
            )}

            {selectedRoom && (
                <>
                    {/* Header with Room Info */}
                    <Card sx={{ mb: 3, bgcolor: 'primary.50', boxShadow: 'none', border: 'none' }}>
                        <CardContent sx={{ background: 'transparent' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Hotel sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                                            ห้อง {selectedRoom.number}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            ชั้น {selectedRoom.floor} • {selectedReservation ? `จองล่วงหน้า (#${selectedReservation.id})` : 'Walk-in'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<Refresh />}
                                    onClick={handleReset}
                                    size="small"
                                >
                                    เปลี่ยนห้อง
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    <Grid container spacing={3}>
                        {/* Product Consumption */}
                        <Grid size={{ xs: 12, md: 12 }}>
                            <Card sx={{ height: 'fit-content', boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
                                <CardContent sx={{ background: 'transparent' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                                        <ShoppingCart sx={{ color: 'success.main' }} />
                                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                                            สินค้าที่ใช้
                                        </Typography>
                                        {currentInspection?.consumptions && products.filter(product => {
                                            const consumptions = currentInspection.consumptions.filter(c => c.product_id === product.id);
                                            return consumptions.reduce((sum, c) => sum + c.quantity, 0) > 0;
                                        }).length > 0 && (
                                                <Chip
                                                    label={`${products.filter(product => {
                                                        const consumptions = currentInspection.consumptions.filter(c => c.product_id === product.id);
                                                        return consumptions.reduce((sum, c) => sum + c.quantity, 0) > 0;
                                                    }).length} รายการ`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                    </Box>

                                    {/* Product Selection - แบบเรียบง่าย */}
                                    <FormControl fullWidth sx={{ mb: 3 }}>
                                        <InputLabel>เลือกสินค้าที่ใช้</InputLabel>
                                        <Select
                                            value=""
                                            label="เลือกสินค้าที่ใช้"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAddProduct(e.target.value);
                                                }
                                            }}
                                        >
                                            {products.map((product) => (
                                                <MenuItem
                                                    key={product.id}
                                                    value={product.id}
                                                >
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                                        <Typography variant="body2">
                                                            {product.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="success.main" fontWeight="600">
                                                            ฿{product.price?.toLocaleString()}
                                                        </Typography>
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* รายการสินค้าที่เลือก - แบบรายการแนวตั้ง */}
                                    {currentInspection?.consumptions && currentInspection.consumptions.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <ConsumptionList
                                                products={products}
                                                consumptions={currentInspection.consumptions}
                                                onAdd={(productId) => handleAddProduct(productId)}
                                                onRemove={(productId) => handleRemoveProduct(productId)}
                                            />
                                        </Box>
                                    )}

                                    {/* Total Summary */}
                                    {currentInspection?.consumptions && currentInspection.consumptions.length > 0 && (
                                        <Card sx={{ mt: 3, bgcolor: 'success.50', boxShadow: 'none', border: 'none' }}>
                                            <CardContent sx={{ py: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <ShoppingCart sx={{ color: 'success.dark' }} />
                                                        <Typography variant="h6" color="success.dark" fontWeight="bold">
                                                            รวมค่าสินค้าทั้งหมด
                                                        </Typography>
                                                    </Box>
                                                    <Typography variant="h5" color="success.dark" fontWeight="bold">
                                                        ฿{totalConsumptionAmount.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Item Condition Checklist */}
                        <Grid size={{ xs: 12 }}>
                            <ItemConditionChecklist
                                damageItems={damageItems}
                                damageReports={currentInspection?.damageReports || []}
                                onUpdateDamageReports={(reports: IDamageReport[]) => {
                                    if (currentInspection) {
                                        roomInspectionService.updateDamageReports(reports);
                                    }
                                }}
                            />
                        </Grid>

                        {/* Summary and Submit */}
                        <Grid size={{ xs: 12 }}>
                            <Card sx={{ bgcolor: 'background.paper', boxShadow: 'none', border: 'none' }}>
                                <CardContent sx={{ background: 'transparent' }}>
                                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 3, textAlign: 'center' }}>
                                        สรุปผลการตรวจสอบ
                                    </Typography>

                                    <Grid container spacing={3} sx={{ mb: 4 }}>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
                                                <Typography variant="body2" color="text.secondary">ค่าสินค้า</Typography>
                                                <Typography variant="h5" color="success.main" fontWeight="bold">
                                                    ฿{totalConsumptionAmount.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'error.50', borderRadius: 2 }}>
                                                <Typography variant="body2" color="text.secondary">ค่าเสียหาย</Typography>
                                                <Typography variant="h5" color="error.main" fontWeight="bold">
                                                    ฿{totalDamageAmount.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 4 }}>
                                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 2 }}>
                                                <Typography variant="body2" color="text.secondary">รวมทั้งหมด</Typography>
                                                <Typography variant="h4" color="primary.main" fontWeight="bold">
                                                    ฿{totalInspectionAmount.toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleReset}
                                            size="large"
                                        >
                                            เริ่มใหม่
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={<Save />}
                                            onClick={handleSubmitInspection}
                                            size="large"
                                            sx={{ minWidth: 200 }}
                                        >
                                            บันทึกผลการตรวจสอบ
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </>
            )}
        </Box>
    );
});

export default RoomInspectionView;
