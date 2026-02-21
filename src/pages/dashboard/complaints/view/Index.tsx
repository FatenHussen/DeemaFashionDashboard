import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { usePermissions } from '@/auth/hooks/use-permissions';
import { complaintColumns, type ComplaintFormValues } from '@/columns/one/complaints/one';
import { useFetchComplaints } from '@/pages/dashboard/complaints/hooks/complaint';

import { CONFIG } from 'src/global-config';

const metadata = { title: `Complaints | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { t } = useTranslation('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const params = statusFilter ? { status: statusFilter } : undefined;
  const { data: complaintsResponse, isLoading, error } = useFetchComplaints(
    currentPage,
    pageSize,
    params
  );

  if (error) {
    console.error('Error fetching complaints:', error);
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const complaintData: ComplaintFormValues[] = complaintsResponse?.data?.items || [];
  const apiPagination = complaintsResponse?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(
          apiPagination.current_page * apiPagination.per_page,
          apiPagination.total
        ),
      }
    : {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0,
      };

  const { can } = usePermissions();
  const hasPermission = (action: string, resource: string) =>
    can(`${resource}.${action}`);

  return (
    <>
      <title>{metadata.title}</title>

      <div className="w-full flex flex-col gap-4">
        <div className="flex items-center gap-2 p-4 bg-linear-to-r from-muted/30 via-transparent to-muted/30 rounded-xl border border-border/30">
          <label className="text-sm font-medium text-foreground shrink-0">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 min-w-[120px] rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All</option>
            <option value="new">New</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <DataTable
        tableName="Complaint"
        columns={complaintColumns(
          { update: hasPermission('update', 'complaint') },
          t,
          '/complaints/details'
        )}
        data={complaintData}
        hasDetails={true}
        detailsLink="/complaints/details"
        permissions={{
          create: false,
          update: hasPermission('update', 'complaint'),
          delete: false,
        }}
        isLoading={isLoading}
        columnTranslations={{
          id: 'ID',
          order_id: 'Order',
          message: 'Message',
          type: 'Type',
          user: 'User',
          status: 'Status',
          created_at: 'Created',
          actions: 'Actions',
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
      </div>
    </>
  );
}
