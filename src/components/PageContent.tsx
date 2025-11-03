import { Box, Card, IconButton, Breadcrumbs, Typography } from "@mui/material";
import type { FC, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { navigation } from "../constants/navigation";
import ArrowCircleLeftIcon from '@mui/icons-material/ArrowCircleLeft';

interface NavigationItem {
  segment: string;
  title: string;
  children?: Array<{ segment: string; title: string; }>;
}

const PageContent: FC<{ children: ReactNode; }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const segments = location.pathname.split('/').filter(Boolean);

  const parentItem = navigation.find(
    (item: unknown): item is NavigationItem =>
      typeof item === 'object' && item !== null && 'segment' in item && (item as NavigationItem).segment === segments[0]
  );

  let childItem;
  if (parentItem?.children && segments.length > 1) {
    childItem = parentItem.children.find((child: { segment: string; title: string; }) => {
      return child.segment === segments[1] || child.segment.includes(segments[1]);
    });
  }

  // Handle special action segments
  if (!childItem) {
    const actionSegment = segments[segments.length - 1];
    const isActionPage = ['create', 'edit'].includes(actionSegment);

    if (isActionPage) {
      childItem = {
        segment: actionSegment,
        title: actionSegment === 'create' ? 'New' : 'Edit'
      };
    }
  }

  const shouldShowBackButton = childItem &&
    (['create', 'edit'].includes(childItem.segment) ||
      ['checkin', 'checkout'].includes(childItem.segment));

  const handleBackClick = () => {
    if (segments.length > 1) {
      navigate(`/${parentItem?.segment}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <Box sx={{
      p: 4,
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      flexGrow: 1,
      minWidth: 0,
      minHeight: '100vh',
    }}>
      {segments[0] !== 'dashboard' && (
        <Card sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          boxShadow: 'none',
          border: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF'
        }}>
          {shouldShowBackButton && (
            <IconButton
              aria-label="back"
              onClick={handleBackClick}
              sx={{ mr: 2, p: 0 }}
            >
              <ArrowCircleLeftIcon />
            </IconButton>
          )}

          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <Typography fontWeight="bold" color="text.primary">
              {parentItem?.title || 'HMS'}
            </Typography>
            {childItem && (
              <Typography color="text.secondary">
                {childItem.title}
              </Typography>
            )}
          </Breadcrumbs>
        </Card>
      )}

      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>
    </Box>
  );
};

export default PageContent;