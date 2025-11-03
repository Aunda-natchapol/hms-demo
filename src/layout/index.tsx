import { createTheme } from '@mui/material';

const darkText = '#2c3e50';
const primary = '#6d9c70';
const secondary = '#e74c3c';

const Theme = createTheme({
    cssVariables: {
        colorSchemeSelector: 'data-toolpad-color-scheme',
    },
    colorSchemes: { light: true },
    palette: {
        mode: 'light',
        primary: {
            main: primary,
            light: '#8fb392',
            dark: '#527a55',
            contrastText: '#ffffff',
        },
        secondary: {
            main: secondary,
            light: '#ec7063',
            dark: '#c0392b',
            contrastText: '#ffffff',
        },
        success: {
            main: '#27ae60',
            light: '#58d68d',
            dark: '#1e8449',
        },
        warning: {
            main: '#f39c12',
            light: '#f7dc6f',
            dark: '#d68910',
        },
        error: {
            main: secondary,
            light: '#ec7063',
        },
        background: {
            default: '#F5F6FA',
            paper: '#FFFFFF',
        },
        text: {
            primary: darkText,
            secondary: '#7f8c8d',
        },
    },
    components: {
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#ffffff',
                    color: darkText,
                    borderRight: '1px solid #ecf0f1',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    '&.Mui-selected': {
                        backgroundColor: primary,
                        color: '#ffffff',
                        borderLeft: `4px solid ${primary}`,
                        '& .MuiListItemIcon-root': {
                            color: '#ffffff !important',
                        },
                        '& .MuiListItemIcon-root svg': {
                            color: '#ffffff !important',
                        },
                        '& .MuiListItemText-root, & .MuiTypography-root': {
                            color: '#ffffff !important',
                            fontWeight: 600,
                        },
                        '& .MuiListItemText-primary': {
                            color: '#ffffff !important',
                        },
                        '& .MuiListItemText-secondary': {
                            color: '#ffffff !important',
                        },
                        '&:hover': {
                            backgroundColor: primary, // ไม่เปลี่ยนสีเมื่อ hover
                            '& .MuiListItemIcon-root': {
                                color: '#ffffff !important',
                            },
                            '& .MuiListItemIcon-root svg': {
                                color: '#ffffff !important',
                            },
                        },
                    },
                    '&:not(.Mui-selected)': {
                        backgroundColor: '#ffffff',
                        color: darkText,
                        '& .MuiListItemIcon-root': {
                            color: primary,
                        },
                        '& .MuiListItemText-root, & .MuiTypography-root': {
                            color: darkText,
                        },
                        '&:hover': {
                            backgroundColor: '#e8f0e9',
                        },
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: primary,
                    color: '#ffffff',
                    boxShadow: 'none',
                    borderBottom: '1px solid rgba(109, 156, 112, 0.1)',

                    '& .MuiToolbar-root': {
                        background: 'transparent',
                    },
                    '& .MuiIconButton-root': {
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    },
                    '& .MuiTypography-root': {
                        color: '#ffffff',
                        fontWeight: 600,
                    },
                },
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: {
                    color: darkText,
                    fontWeight: 500,
                    '&.active-logo': {
                        color: '#ffffff',
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: primary,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    textTransform: 'none',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                    '&.MuiButton-containedPrimary': {
                        '&:hover': {
                            backgroundColor: '#527a55',
                        },
                    },
                    '&.MuiButton-containedSecondary': {
                        '&:hover': {
                            backgroundColor: '#c0392b',
                        },
                    },
                },
                outlined: {
                    borderColor: primary,
                    color: primary,
                    '&:hover': {
                        backgroundColor: 'rgba(109, 156, 112, 0.1)',
                        borderColor: primary,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    border: '1px solid #E0E0E0',
                    borderRadius: '12px',
                    backgroundColor: '#FFFFFF',
                    '&:hover': {
                        boxShadow: 'none',
                        borderColor: '#D0D0D0',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
    },
    shape: {
        borderRadius: 8,
    },
});

export default Theme;
export { Theme };