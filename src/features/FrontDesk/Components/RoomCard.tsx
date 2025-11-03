import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    IconButton,
    Menu,
    MenuItem,
    Tooltip,
    alpha,
} from '@mui/material';
import {
    Hotel,
    Person,
    MoreVert as MoreVertIcon,
    Login as LoginIcon,
    Logout as LogoutIcon,
    CalendarToday as CalendarTodayIcon,
    CleaningServices as CleaningServicesIcon,
    Build as BuildIcon,
    SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { getStatusColor, getStatusText } from '../constants/roomStatus';
import type { RoomWithDetails, GridSize, QuickActionType } from '../Services/RoomManagementService';
interface RoomCardProps {
    room: RoomWithDetails;
    gridSize: GridSize;
    quickActions: QuickActionType[];
    onRoomClick: (room: RoomWithDetails) => void;
    onActionClick: (action: QuickActionType, room: RoomWithDetails) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
    room,
    gridSize,
    quickActions,
    onRoomClick,
    onActionClick
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (event?: React.MouseEvent) => {
        if (event) {
            event.stopPropagation();
        }
        setAnchorEl(null);
    };

    const handleActionClick = (action: QuickActionType, event: React.MouseEvent) => {
        event.stopPropagation();
        handleMenuClose();
        onActionClick(action, room);
    };

    const getActionIcon = (iconName: string) => {
        switch (iconName) {
            case 'Login': return <LoginIcon fontSize="small" />;
            case 'Logout': return <LogoutIcon fontSize="small" />;
            case 'CalendarToday': return <CalendarTodayIcon fontSize="small" />;
            case 'CleaningServices': return <CleaningServicesIcon fontSize="small" />;
            case 'Build': return <BuildIcon fontSize="small" />;
            case 'SwapHoriz': return <SwapHorizIcon fontSize="small" />;
            default: return <MoreVertIcon fontSize="small" />;
        }
    };

    const statusColor = room.hasCustomStatus && room.customStatusColor
        ? room.customStatusColor
        : getStatusColor(room.status);

    const statusText = room.hasCustomStatus && room.customStatusName
        ? room.customStatusName
        : getStatusText(room.status);

    const availableActions = quickActions.filter(action => action.condition(room));

    // Card dimensions based on grid size
    const getCardDimensions = () => {
        switch (gridSize) {
            case 'xsmall':
                return {
                    minHeight: '100px',
                    padding: '8px',
                    avatarSize: 28,
                    titleSize: 'h6',
                    subtitleSize: 'body2',
                    showDetails: false,
                    showStatusChip: true
                };
            case 'small':
                return {
                    minHeight: '150px',  // ขนาดปานกลาง ไม่ใหญ่ไม่เล็ก
                    padding: '14px',     // padding พอเหมาะ
                    avatarSize: 32,      // avatar ขนาดกลาง
                    titleSize: 'h6',
                    subtitleSize: 'body2',
                    showDetails: false,
                    showStatusChip: true
                };
            case 'large':
                return {
                    minHeight: '220px',
                    padding: '20px',
                    avatarSize: 48,
                    titleSize: 'h5',
                    subtitleSize: 'body2',
                    showDetails: true,
                    showStatusChip: true
                };
            default: // medium
                return {
                    minHeight: '175px',
                    padding: '16px',
                    avatarSize: 38,
                    titleSize: 'h6',
                    subtitleSize: 'body2',
                    showDetails: true,
                    showStatusChip: true
                };
        }
    };

    const cardStyle = getCardDimensions();
    const isXSmall = gridSize === 'xsmall';
    const isSmall = gridSize === 'small';
    const isXSmallOrSmall = isXSmall || isSmall;

    // Status display implemented as a minimal colored dot + label (or dot-only on small)

    return (
        <Card
            sx={{
                position: 'relative',
                height: cardStyle.minHeight, // ใช้ height แทน minHeight เพื่อให้ความสูงเท่ากัน
                cursor: 'pointer',
                bgcolor: 'white',
                // Use a neutral base border; keep status color inside the chip/dot
                border: '1.5px solid',
                borderColor: 'grey.200',
                borderRadius: '12px',
                transition: 'border-color 0.12s ease-in-out',
                // hide overflow so rounded corners and border render without internal children covering them
                overflow: 'hidden',
                // Make the card flat
                boxShadow: 'none',
                '&:hover': {
                    // subtle hover using neutral shade
                    borderColor: 'grey.300'
                }
            }}
            onClick={() => onRoomClick(room)}
        >
            <CardContent sx={{
                p: cardStyle.padding,
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: isXSmall ? 'center' : 'flex-start', // center vertically for xsmall
                // make inner background transparent so it doesn't paint over the card border corners
                background: 'transparent',
                overflow: 'visible' // ให้เมนูสามารถแสดงออกมาได้ (Menu uses portal so it won't be clipped)
            }}>

                {/* Status indicator: dot-only for xsmall, full chip for others */}
                <Box sx={{
                    position: 'absolute',
                    // inset a little so the status indicator doesn't overlap the outer border
                    top: isXSmallOrSmall ? 10 : 12,
                    right: isXSmallOrSmall ? 10 : 12,
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    {isXSmall ? (
                        <Tooltip title={statusText} arrow>
                            <Box sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: statusColor,
                                // reduce halo so it doesn't visually cut the card border
                                boxShadow: `0 0 0 2px ${alpha(statusColor, 0.12)}`,
                                border: `1px solid ${alpha(statusColor, 0.18)}`
                            }} />
                        </Tooltip>
                    ) : (
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: isSmall ? 0.75 : 1,
                            bgcolor: alpha(statusColor, 0.06),
                            px: isSmall ? 0.9 : 1,
                            py: isSmall ? 0.2 : 0.25,
                            borderRadius: 1,
                            border: `1px solid ${alpha(statusColor, 0.18)}`
                        }}>
                            <Box sx={{
                                width: isSmall ? 11 : 12,
                                height: isSmall ? 11 : 12,
                                borderRadius: '50%',
                                bgcolor: statusColor,
                                // smaller halo for the same reason
                                boxShadow: `0 0 0 ${isSmall ? 1.5 : 2}px ${alpha(statusColor, 0.08)}`
                            }} />
                            <Typography variant="caption" sx={{ color: statusColor, fontWeight: 600, fontSize: isSmall ? '0.72rem' : undefined }}>{statusText}</Typography>
                        </Box>
                    )}
                </Box>

                {/* Main Content - avatar visible except on xsmall */}
                <Box sx={{
                    display: 'flex',
                    alignItems: isXSmall ? 'center' : 'flex-start',
                    justifyContent: isXSmall ? 'center' : 'flex-start',
                    mb: 1,
                    mt: isXSmallOrSmall ? 1.5 : 1,
                    pr: isXSmallOrSmall ? 4 : gridSize === 'large' ? 2 : 8,
                    pt: isXSmallOrSmall ? 0.5 : 0,
                    textAlign: isXSmall ? 'center' : 'left'
                }}>
                    {gridSize !== 'xsmall' && (
                        <Avatar
                            sx={{
                                bgcolor: alpha(statusColor, 0.1),
                                color: statusColor,
                                width: cardStyle.avatarSize,
                                height: cardStyle.avatarSize,
                                mr: isXSmallOrSmall ? 1 : 1.5
                            }}
                        >
                            <Hotel fontSize={isXSmallOrSmall ? 'small' : 'medium'} />
                        </Avatar>
                    )}

                    <Box sx={{
                        flex: 1,
                        minWidth: 0,
                        // For xsmall use full width to avoid collapsing when card is very narrow.
                        // For small keep a reserved area for potential status/action icons.
                        maxWidth: isXSmall ? '100%' : isSmall ? 'calc(100% - 60px)' : gridSize === 'large' ? 'calc(100% - 40px)' : 'calc(100% - 88px)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: isXSmall ? 'center' : 'flex-start', justifyContent: isXSmall ? 'center' : 'flex-start', gap: 1 }}>
                            <Typography
                                variant={cardStyle.titleSize === 'h5' ? 'h5' : 'h6'}
                                fontWeight="bold"
                                color="text.primary"
                                noWrap
                                sx={{
                                    fontSize: isXSmallOrSmall ? '0.95rem' : undefined,
                                    textAlign: isXSmall ? 'center' : undefined,
                                }}
                            >
                                {room.number}
                            </Typography>
                        </Box>
                        {/* Subtitle: show for small/medium/large, hide entirely for xsmall */}
                        {!isXSmall && (
                            isSmall ? (
                                <Box sx={{ mt: 0.25 }}>
                                    <Typography
                                        variant={cardStyle.subtitleSize as "body2"}
                                        color="text.secondary"
                                        noWrap
                                        sx={{ fontSize: '0.75rem' }}
                                    >
                                        ชั้น {room.floor}
                                    </Typography>
                                    <Typography
                                        variant={cardStyle.subtitleSize as "body2"}
                                        color="text.secondary"
                                        sx={{ fontSize: '0.75rem', mt: 0.25 }}
                                    >
                                        {room.roomType?.name || 'ไม่ทราบประเภท'}
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography
                                    variant={cardStyle.subtitleSize as "body2"}
                                    color="text.secondary"
                                    noWrap
                                    sx={{
                                        mt: 0.25,
                                        fontSize: isXSmallOrSmall ? '0.75rem' : undefined,
                                        lineHeight: isXSmallOrSmall ? 1.2 : undefined
                                    }}
                                >
                                    {`ชั้น ${room.floor} • ${room.roomType?.name || 'ไม่ทราบประเภท'}`}
                                </Typography>
                            )
                        )}
                    </Box>
                </Box>

                {/* Guest Info - Only show in medium/large */}
                {cardStyle.showDetails && room.currentGuest && (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        p: gridSize === 'medium' ? 0.75 : 1.5,
                        bgcolor: 'grey.50',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.100',
                        // constrain size on medium to avoid colliding with actions
                        maxHeight: gridSize === 'medium' ? 34 : 'auto',
                        overflow: 'hidden'
                    }}>
                        <Person fontSize="small" sx={{ color: statusColor, mr: 1 }} />
                        <Typography
                            variant="body2"
                            color="text.primary"
                            fontWeight="500"
                            noWrap
                            sx={{ flex: 1, fontSize: gridSize === 'medium' ? '0.82rem' : undefined }}
                        >
                            {room.currentGuest.name}
                        </Typography>
                    </Box>
                )}

                {/* Check-in/Check-out Dates - Only show in large */}
                {gridSize === 'large' && room.currentReservation && (
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                            เช็คอิน: {new Date(room.currentReservation.arrival_date).toLocaleDateString('th-TH')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            เช็คเอาท์: {new Date(room.currentReservation.departure_date).toLocaleDateString('th-TH')}
                        </Typography>
                    </Box>
                )}

                {/* Actions Menu Button */}
                {availableActions.length > 0 && (
                    <Box
                        className="room-actions"
                        sx={{
                            position: 'absolute',
                            bottom: isXSmallOrSmall ? 8 : 12,
                            right: isXSmallOrSmall ? 8 : 12,
                            // Always visible (no hover required)
                            opacity: 1,
                            transform: 'translateY(0)',
                            transition: 'opacity 0.18s ease-in-out'
                        }}>
                        <Tooltip title="ตัวเลือก">
                            <IconButton
                                size="small"
                                onClick={handleMenuOpen}
                                sx={{
                                    bgcolor: 'transparent',
                                    color: 'text.primary',
                                    boxShadow: 'none',
                                    border: 'none',
                                    width: isXSmallOrSmall ? 34 : 36,
                                    height: isXSmallOrSmall ? 34 : 36,
                                    p: 0.5,
                                    borderRadius: 1.5,
                                    '&:hover': {
                                        bgcolor: (theme) => theme.palette.action.hover,
                                        transform: 'translateY(-1px)'
                                    },
                                    '& .MuiSvgIcon-root': {
                                        fontSize: isXSmallOrSmall ? '1rem' : '1.05rem'
                                    }
                                }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}

                {/* Actions Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => handleMenuClose()}
                    onClick={(e) => e.stopPropagation()}
                    PaperProps={{
                        sx: {
                            mt: 1,
                            minWidth: 180,
                            borderRadius: 2,
                            boxShadow: '0 6px 18px rgba(15, 23, 42, 0.08)',
                            border: '1px solid rgba(15,23,42,0.06)',
                            zIndex: 1200,
                            '& .MuiMenuItem-root': {
                                fontSize: '0.875rem',
                                py: 1.5,
                                px: 2,
                                borderRadius: 1,
                                mx: 0.5,
                                my: 0.25,
                                '&:hover': {
                                    bgcolor: 'action.hover'
                                }
                            }
                        }
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                >
                    {availableActions.map((action) => (
                        <MenuItem
                            key={action.id}
                            onClick={(e) => handleActionClick(action, e)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                color: action.color === 'error' ? 'error.main' :
                                    action.color === 'success' ? 'success.main' :
                                        action.color === 'warning' ? 'warning.main' :
                                            action.color === 'primary' ? 'primary.main' : 'text.primary'
                            }}
                        >
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: 'inherit'
                            }}>
                                {getActionIcon(action.icon)}
                            </Box>
                            {action.label}
                        </MenuItem>
                    ))}
                </Menu>
            </CardContent>
        </Card>
    );
};

export default RoomCard;