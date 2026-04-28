import type { NotificationItemProps } from './notification-item';

import { m } from 'framer-motion';
import { queryKeys } from '@/api';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { Label } from 'src/shared/components/label';
import { Iconify } from 'src/shared/components/iconify';
import { Scrollbar } from 'src/shared/components/scrollbar';
import { CustomTabs } from 'src/shared/components/custom-tabs';
import { varTap, varHover, transitionTap } from 'src/shared/components/animate';
import { Box, Tab, Badge, Drawer, Button, Tooltip, Typography, IconButton } from 'src/shared/ui';

import { NotificationItem } from './notification-item';
import { _NotificationApi, type NotificationApiItem } from './api/notification.services';

// ----------------------------------------------------------------------

function mapApiToNotification(
  item: NotificationApiItem
): NotificationItemProps['notification'] {
  return {
    id: item.id,
    type: 'mail',
    title: item.title,
    category: item.body || '',
    isUnRead: item.read_at === null,
    avatarUrl: null,
    createdAt: item.created_at,
  };
}

// ----------------------------------------------------------------------

export type NotificationsDrawerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  data?: NotificationItemProps['notification'][];
};

export function NotificationsDrawer({ data = [], className, ...other }: NotificationsDrawerProps) {
  const { t } = useTranslation('common');
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const [currentTab, setCurrentTab] = useState('all');
  const [localNotifications, setLocalNotifications] = useState<NotificationItemProps['notification'][] | null>(null);

  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: queryKeys.auth.notifications(),
    queryFn: () => _NotificationApi.getList(),
  });

  // Refetch notifications when drawer opens to get latest data
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const notifications = useMemo(() => {
    if (localNotifications !== null) return localNotifications;
    const items = apiResponse?.data ?? [];
    return items.length > 0 ? items.map(mapApiToNotification) : data;
  }, [apiResponse?.data, localNotifications, data]);

  const totalUnRead = notifications.filter((item) => item.isUnRead === true).length;
  const totalArchived = notifications.filter((item) => !item.isUnRead).length;

  const tabs = useMemo(
    () => [
      { value: 'all', label: t('notificationsTabAll'), count: notifications.length },
      { value: 'unread', label: t('notificationsTabUnread'), count: totalUnRead },
      { value: 'archived', label: t('notificationsTabArchived'), count: totalArchived },
    ],
    [notifications.length, totalUnRead, totalArchived, t]
  );

  const filteredNotifications = useMemo(() => {
    if (currentTab === 'unread') return notifications.filter((n) => n.isUnRead);
    if (currentTab === 'archived') return notifications.filter((n) => !n.isUnRead);
    return notifications;
  }, [notifications, currentTab]);

  const handleChangeTab = useCallback((_event: React.SyntheticEvent, newValue: string | number) => {
    setCurrentTab(newValue as string);
  }, []);

  const handleMarkAllAsRead = () => {
    setLocalNotifications(
      notifications.map((notification) => ({ ...notification, isUnRead: false }))
    );
  };

  const renderHead = () => (
    <Box className="py-2 pe-1 ps-2.5 min-h-[68px] flex items-center">
      <Typography variant="h6" className="flex-grow">
        {t('notificationsDrawerTitle')}
      </Typography>

      {!!totalUnRead && (
        <Tooltip title={t('markAllRead')}>
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
      {tabs.map((tab) => (
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
        {isLoading ? (
          <Box className="flex justify-center py-8">
            <Iconify icon="svg-spinners:ring-resize" width={32} className="text-muted-foreground" />
          </Box>
        ) : filteredNotifications.length === 0 ? (
          <Box className="flex justify-center py-8 text-sm text-muted-foreground">
            {t('notificationsEmpty')}
          </Box>
        ) : (
          filteredNotifications.map((notification) => (
            <Box component="li" key={notification.id} className="flex">
              <NotificationItem notification={notification} />
            </Box>
          ))
        )}
      </Box>
    </Scrollbar>
  );

  return (
    <>
      <m.button
        whileTap={varTap(0.96)}
        whileHover={varHover(1.04)}
        transition={transitionTap()}
        aria-label={t('notificationsButton')}
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
