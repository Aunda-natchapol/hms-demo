import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    FormControlLabel,
    TextField,
} from '@mui/material';
import { CheckCircle, ErrorOutline } from '@mui/icons-material';
import type { IDamageReport } from '../../../types';

// Define IDamageItem locally if not exported from types
interface IDamageItem {
    id: string;
    hotel_id: string;
    code: string;
    name: string;
    default_charge_price: number;
}

interface ItemCondition {
    itemId: string;
    itemName: string;
    defaultPrice: number;
    isGood: boolean;
    notes: string;
}

interface ItemConditionChecklistProps {
    damageItems: IDamageItem[];
    damageReports: IDamageReport[];
    onUpdateDamageReports: (reports: IDamageReport[]) => void;
}

const ItemConditionChecklist: React.FC<ItemConditionChecklistProps> = ({
    damageItems,
    damageReports,
    onUpdateDamageReports
}) => {
    const [itemConditions, setItemConditions] = useState<ItemCondition[]>([]);

    // Initialize item conditions from damage items master
    useEffect(() => {
        const conditions: ItemCondition[] = damageItems.map(item => {
            const existingDamageReport = damageReports.find(report => report.damage_item_id === item.id);

            return {
                itemId: item.id,
                itemName: item.name,
                defaultPrice: item.default_charge_price,
                isGood: !existingDamageReport, // ถ้าไม่มี damage report แสดงว่าของดี
                notes: existingDamageReport?.description || '',
            };
        });

        setItemConditions(conditions);
    }, [damageItems, damageReports]);

    const handleConditionChange = (itemId: string, isGood: boolean) => {
        const updatedConditions = itemConditions.map(condition =>
            condition.itemId === itemId
                ? { ...condition, isGood }
                : condition
        );
        setItemConditions(updatedConditions);
        updateDamageReports(updatedConditions);
    };

    const handleNotesChange = (itemId: string, notes: string) => {
        const updatedConditions = itemConditions.map(condition =>
            condition.itemId === itemId
                ? { ...condition, notes }
                : condition
        );
        setItemConditions(updatedConditions);
        updateDamageReports(updatedConditions);
    };

    const updateDamageReports = (conditions: ItemCondition[]) => {
        const newDamageReports: IDamageReport[] = conditions
            .filter(condition => !condition.isGood) // เฉพาะของที่เสียหาย
            .map(condition => {
                const existingReport = damageReports.find(report => report.damage_item_id === condition.itemId);

                return {
                    id: existingReport?.id || `damage-${Date.now()}-${condition.itemId}`,
                    room_id: existingReport?.room_id || '',
                    damage_item_id: condition.itemId,
                    reported_by_user_id: existingReport?.reported_by_user_id || 'inspector-001',
                    description: condition.notes || `${condition.itemName} - เสียหาย`,
                    photos: existingReport?.photos || [],
                    estimated_cost: condition.defaultPrice,
                    final_charge_amount: condition.defaultPrice, // เสียหายเต็มราคา
                    status: 'pending' as const,
                    reported_at: existingReport?.reported_at || new Date().toISOString()
                };
            });

        onUpdateDamageReports(newDamageReports);
    };

    const damagedItems = itemConditions.filter(item => !item.isGood);
    const goodItems = itemConditions.filter(item => item.isGood);

    return (
        <Card sx={{ boxShadow: 'none', border: 'none', bgcolor: '#FFFFFF' }}>
            <CardContent sx={{ background: 'transparent' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
                    <Typography variant="h6" fontWeight="bold">
                        ตรวจสอบสภาพของในห้อง
                    </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    โปรดตรวจสอบสภาพของแต่ละชิ้นในห้อง หากของชิ้นใดอยู่ในสภาพดีให้ติ๊กถูก หากเสียหายจะคิดค่าเสียหายเต็มราคา
                </Typography>

                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ '& .MuiTableCell-head': { backgroundColor: 'grey.100', fontWeight: 'bold' } }}>
                                <TableCell>รายการของ</TableCell>
                                <TableCell align="center" width="120">สภาพ</TableCell>
                                <TableCell align="right" width="120">ค่าเสียหาย</TableCell>
                                <TableCell width="250">หมายเหตุ</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {itemConditions.map((condition) => (
                                <TableRow key={condition.itemId}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {condition.itemName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ราคา: ฿{condition.defaultPrice.toLocaleString()}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={condition.isGood}
                                                    onChange={(e) => handleConditionChange(condition.itemId, e.target.checked)}
                                                    color="success"
                                                />
                                            }
                                            label={condition.isGood ? "ปกติ" : "เสียหาย"}
                                        />
                                    </TableCell>

                                    <TableCell align="right">
                                        <Typography
                                            variant="body2"
                                            fontWeight="medium"
                                            color={!condition.isGood ? 'error.main' : 'text.secondary'}
                                        >
                                            ฿{!condition.isGood ? condition.defaultPrice.toLocaleString() : '0'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <TextField
                                            value={condition.notes}
                                            onChange={(e) => handleNotesChange(condition.itemId, e.target.value)}
                                            placeholder="หมายเหตุเพิ่มเติม"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                            multiline
                                            rows={1}
                                            disabled={condition.isGood}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Summary */}
                <Box sx={{ mt: 3, p: 2, bgcolor: '#F5F6FA', borderRadius: 1, border: '1px solid #E0E0E0' }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                        สรุปผลการตรวจสอบ:
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                            <Typography variant="body2">
                                ของดี: <strong>{goodItems.length} รายการ</strong>
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ErrorOutline sx={{ color: 'error.main', fontSize: 20 }} />
                            <Typography variant="body2">
                                ของเสียหาย: <strong>{damagedItems.length} รายการ</strong>
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="error.main" fontWeight="bold">
                                ค่าเสียหายรวม: ฿{damagedItems.reduce((sum, item) => sum + item.defaultPrice, 0).toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default ItemConditionChecklist;