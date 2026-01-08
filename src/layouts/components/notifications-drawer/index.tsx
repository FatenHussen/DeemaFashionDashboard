import type { NotificationItemProps } from './notification-item';

import { m } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import { Box, Tab, Badge, Drawer, Button, Tooltip, Typography, IconButton } from 'src/shared/ui';

import { Label } from 'src/shared/components/label';
import { Iconify } from 'src/shared/components/iconify';
import { Scrollbar } from 'src/shared/components/scrollbar';
import { CustomTabs } from 'src/shared/components/custom-tabs';
import { varTap, varHover, transitionTap } from 'src/shared/components/animate';

import { NotificationItem } from './notification-item';

// ----------------------------------------------------------------------

const TABS = [
  { value: 'all', label: 'All', count: 22 },
  { value: 'unread', label: 'Unread', count: 12 },
  { value: 'archived', label: 'Archived', count: 10 },
];

// ----------------------------------------------------------------------

export type NotificationsDrawerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  data?: NotificationItemProps['notification'][];
};

export function NotificationsDrawer({ data = [], className, ...other }: NotificationsDrawerProps) {
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const [currentTab, setCurrentTab] = useState('all');

  const handleChangeTab = useCallback((_event: React.SyntheticEvent, newValue: string | number) => {
    setCurrentTab(newValue as string);
  }, []);

  const [notifications, setNotifications] = useState(data);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notification) => ({ ...notification, isUnRead: false })));
  };

  const renderHead = () => (
    <Box
      className="py-2 pr-1 pl-2.5 min-h-[68px] flex items-center"
    >
      <Typography variant="h6" className="flex-grow">
        Notifications
      </Typography>

      {!!totalUnRead && (
        <Tooltip title="Mark all as read">
          <IconButton color="primary" onClick={handleMarkAllAsRead}>
            <Iconify icon="eva:done-all-fill" />
          </IconButton>
        </Tooltip>
      )}

      <IconButton onClick={onClose} className="inline-flex sm:hidden">
        <Iconify icon="mingcute:close-line" />
      </IconButton>

      <IconButton>
        <Iconify icon="solar:settings-bold-duotone" />
      </IconButton>
    </Box>
  );

  const renderTabs = () => (
    <CustomTabs variant="fullWidth" value={currentTab} onChange={handleChangeTab}>
      {TABS.map((tab) => (
        <Tab
          key={tab.value}
          iconPosition="end"
          value={tab.value}
          label={tab.label}
          icon={
            <Label
              variant={((tab.value === 'all' || tab.value === currentTab) && 'filled') || 'soft'}
              color={
                (tab.value === 'unread' && 'info') ||
                (tab.value === 'archived' && 'success') ||
                'default'
              }
            >
              {tab.count}
            </Label>
          }
        />
      ))}
    </CustomTabs>
  );

  const renderList = () => (
    <Scrollbar>
      <Box component="ul">
        {notifications?.map((notification) => (
          <Box component="li" key={notification.id} className="flex">
            <NotificationItem notification={notification} />
          </Box>
        ))}
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <m.button
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label="Notifications button"
        onClick={onOpen}
        className={`inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 w-9 text-foreground hover:bg-muted active:bg-muted ${className || ''}`}
        {...(other as any)}
      >
        <Badge badgeContent={totalUnRead} color="error">
          <Iconify width={24} icon="solar:bell-bing-bold-duotone" />
        </Badge>
      </m.button>

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{
          backdrop: { invisible: true },
        }}
        className="w-full max-w-[420px]"
      >
        {renderHead()}
        {renderTabs()}
        {renderList()}

        <Box className="p-1">
          <Button fullWidth size="large">
            View all
          </Button>
        </Box>
      </Drawer>
    </>
  );
}
