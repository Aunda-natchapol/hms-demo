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
    Warning,
} from '@mui/icons-material';
import type { IDamageItemsMaster, IDamageReport } from '../../../types';

interface DamageChecklistProps {
    damageItems: IDamageItemsMaster[];
    damageReports: IDamageReport[];
    onAddDamage: (damageItemId: string, quantity: number, notes?: string) => void;
    onRemoveDamage: (damageReportId: string) => void;
    totalAmount: number;
}

const DamageChecklist: React.FC<DamageChecklistProps> = ({
    damageItems,
    damageReports,
    onAddDamage,
    onRemoveDamage,
    totalAmount
}) => {
    const [selectedDamageItemId, setSelectedDamageItemId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    const handleAddDamage = () => {
        if (selectedDamageItemId && quantity > 0) {
            onAddDamage(selectedDamageItemId, quantity, notes);
            setSelectedDamageItemId('');
            setQuantity(1);
            setNotes('');
        }
    };

    const getDamageItemById = (damageItemId: string) => {
        return damageItems.find(d => d.id === damageItemId);
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Warning sx={{ mr: 1, color: 'error.main' }} />
                    <Typography variant="h6">
                        รายการความเสียหาย
                    </Typography>
                </Box>

                {/* Add new damage */}
                <Box sx={{ mb: 3, p: 2, bgcolor: 'error.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        เพิ่มรายการความเสียหาย
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl sx={{ minWidth: 200 }}>
                                <InputLabel>ประเภทความเสียหาย</InputLabel>
                                <Select
                                    value={selectedDamageItemId}
                                    onChange={(e) => setSelectedDamageItemId(e.target.value)}
                                    label="ประเภทความเสียหาย"
                                >
                                    {damageItems.map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.name} (฿{item.default_charge_price})
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
                        </Box>

                        <TextField
                            label="หมายเหตุ (ไม่บังคับ)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            multiline
                            rows={2}
                            placeholder="อธิบายรายละเอียดความเสียหาย..."
                        />

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Add />}
                            onClick={handleAddDamage}
                            disabled={!selectedDamageItemId}
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            เพิ่มรายการ
                        </Button>
                    </Box>
                </Box>

                {/* Damage list */}
                {damageReports.length > 0 ? (
                    <>
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>ประเภทความเสียหาย</TableCell>
                                        <TableCell>คำอธิบาย</TableCell>
                                        <TableCell align="right">ค่าใช้จ่าย</TableCell>
                                        <TableCell align="center">สถานะ</TableCell>
                                        <TableCell align="center">จัดการ</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {damageReports.map((damage) => {
                                        const damageItem = getDamageItemById(damage.damage_item_id);
                                        return (
                                            <TableRow key={damage.id}>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {damageItem?.name || 'ไม่ทราบ'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {damageItem?.code}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2">
                                                        {damage.description}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography fontWeight="medium" color="error.main">
                                                        ฿{damage.final_charge_amount.toLocaleString()}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip
                                                        size="small"
                                                        label={damage.status === 'pending' ? 'รอดำเนินการ' : damage.status}
                                                        color={damage.status === 'pending' ? 'warning' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell align="center">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onRemoveDamage(damage.id)}
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
                                รายการทั้งหมด: {damageReports.length} รายการ
                            </Typography>
                            <Typography variant="h6" color="error.main" fontWeight="bold">
                                รวม: ฿{totalAmount.toLocaleString()}
                            </Typography>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                            ไม่พบความเสียหาย
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default DamageChecklist;