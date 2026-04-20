import type { WithdrawStatus, WithdrawRequest } from '../types';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable } from '@/shared/ui/table-data/table-data';
import { withdrawRequestColumns } from '@/columns/one/vendor-accounting/withdraw-requests';

import { CONFIG } from 'src/global-config';

import { useFetchWithdrawRequests } from '../hooks';
import { ProcessWithdrawRequestModal } from '../components/process-withdraw-request-modal';

// ----------------------------------------------------------------------

export default function WithdrawRequestsPage() {
  const { t } = useTranslation('table');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<WithdrawStatus | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [processingRequest, setProcessingRequest] = useState<WithdrawRequest | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const { data, isLoading } = useFetchWithdrawRequests({
    page: currentPage,
    per_page: pageSize,
    status: statusFilter,
    search: search.trim() || undefined,
  });

  const items: WithdrawRequest[] = data?.data?.items ?? [];
  const apiPagination = data?.data?.pagination;
  const pagination = apiPagination
    ? {
        current_page: apiPagination.current_page,
        last_page: apiPagination.last_page,
        per_page: apiPagination.per_page,
        total: apiPagination.total,
        from: (apiPagination.current_page - 1) * apiPagination.per_page + 1,
        to: Math.min(apiPagination.current_page * apiPagination.per_page, apiPagination.total),
      }
    : { current_page: 1, last_page: 1, per_page: 10, total: 0, from: 0, to: 0 };

  const handleProcess = (id: number) => {
    const req = items.find((r) => r.id === id);
    if (req) setProcessingRequest(req);
  };

  const handleModalClose = () => setProcessingRequest(null);

  const handleModalSuccess = () => {
    setProcessingRequest(null);
  };

  return (
    <>
      <title>{t('form.withdrawRequestsDocumentTitle', { appName: CONFIG.appName })}</title>

      {processingRequest && (
        <ProcessWithdrawRequestModal
          request={processingRequest}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      <DataTable
        tableName={t('tableNames.vendorWithdrawRequest')}
        columns={withdrawRequestColumns(t, handleProcess)}
        data={items}
        isLoading={isLoading}
        columnTranslations={{
          id: t('columns.id'),
          vendor: t('columns.vendor'),
          amount: t('vendorAccounting.amount'),
          status: t('columns.status'),
          payment_method: t('vendorAccounting.paymentMethod'),
          requested_at: t('vendorAccounting.requestedAt'),
          actions: t('columns.action'),
        }}
        pagination={pagination}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        onSearchChange={setSearch}
        toolbarFilter={
          <select
            value={statusFilter ?? ''}
            onChange={(e) => {
              const val = e.target.value as WithdrawStatus | '';
              setStatusFilter(val || undefined);
              setCurrentPage(1);
            }}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="pending">{t('statusPending')}</option>
            <option value="paid">{t('vendorAccounting.statusPaid')}</option>
            <option value="rejected">{t('statusRejected')}</option>
          </select>
        }
      />
    </>
  );
}
