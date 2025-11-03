import React from 'react';
import {
    Box,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Typography,
    Divider,
    Chip,
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import type { IConsumption, IProduct } from '../../../types';

interface ConsumptionListProps {
    products: IProduct[];
    consumptions: IConsumption[];
    onAdd: (productId: string) => void;
    onRemove: (productId: string) => void;
}

const ConsumptionList: React.FC<ConsumptionListProps> = ({ products, consumptions, onAdd, onRemove }) => {
    // Aggregate consumptions by product_id
    const aggregated = products
        .map(p => {
            const itemConsumptions = consumptions.filter(c => c.product_id === p.id);
            const quantity = itemConsumptions.reduce((s, c) => s + (c.quantity || 0), 0);
            const subtotal = (p.price || 0) * quantity;
            return { product: p, quantity, subtotal };
        })
        .filter(x => x.quantity > 0);

    if (aggregated.length === 0) {
        return (
            <Box sx={{ py: 2 }}>
                <Typography variant="body2" color="text.secondary">ยังไม่มีรายการสินค้า</Typography>
            </Box>
        );
    }

    return (
        <List disablePadding>
            {aggregated.map(({ product, quantity, subtotal }) => (
                <React.Fragment key={product.id}>
                    <ListItem sx={{ alignItems: 'center', py: 1 }}>
                        <ListItemText
                            primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1" fontWeight="600">{product.name}</Typography>
                                    <Chip label={`฿${(product.price || 0).toLocaleString()}`} size="small" color="secondary" />
                                </Box>
                            }
                            secondary={<Typography variant="caption" color="text.secondary">ราคารวม: ฿{subtotal.toLocaleString()}</Typography>}
                        />

                        <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton size="small" onClick={() => onRemove(product.id)} aria-label={`ลด ${product.name}`}>
                                    <Remove />
                                </IconButton>
                                <Typography variant="body2" sx={{ minWidth: 28, textAlign: 'center' }}>{quantity}</Typography>
                                <IconButton size="small" onClick={() => onAdd(product.id)} aria-label={`เพิ่ม ${product.name}`}>
                                    <Add />
                                </IconButton>
                            </Box>
                        </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                </React.Fragment>
            ))}
        </List>
    );
};

export default ConsumptionList;
