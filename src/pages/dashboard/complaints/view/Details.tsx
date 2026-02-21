import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/shared/ui/button';
import { useParams, useNavigate } from 'react-router';
import { Iconify } from '@/shared/components/iconify';
import { useFetchComplaintById, useUpdateComplaint } from '@/pages/dashboard/complaints/hooks/complaint';
import {
  ComplaintUpdateSchema,
  type ComplaintUpdateFormValues,
} from '@/pages/dashboard/complaints/validation/complaint.validation';

import { CONFIG } from 'src/global-config';
import { Box, Typography } from 'src/shared/ui';
import { Separator } from 'src/shared/ui/separator';
import { LoadingScreen } from 'src/shared/components/loading-screen';

// ----------------------------------------------------------------------

const metadata = { title: `Complaint Details | Dashboard - ${CONFIG.appName}` };

export default function DetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: complaintResponse, isLoading, error } = useFetchComplaintById(id || '');
  const updateComplaintMutation = useUpdateComplaint();

  const complaint = complaintResponse?.data;

  const methods = useForm<ComplaintUpdateFormValues>({
    resolver: zodResolver(ComplaintUpdateSchema),
    defaultValues: {
      status: 'resolved',
      admin_response: '',
    },
  });

  const { handleSubmit, reset, control } = methods;

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !complaint) {
    return (
      <Box className="flex items-center justify-center min-h-[400px] p-6">
        <Box className="w-full max-w-md rounded-xl border border-border/50 shadow-lg bg-background p-6">
          <Box className="flex items-center gap-2 mb-2">
            <Iconify icon="solar:danger-bold" className="w-5 h-5 text-destructive" />
            <Typography variant="h6" className="text-destructive">
              Error Loading Complaint
            </Typography>
          </Box>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'Failed to load complaint'}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/complaints')}>
            Back to Complaints
          </Button>
        </Box>
      </Box>
    );
  }

  const isNew = complaint.status === 'new';

  const onSubmit = async (data: ComplaintUpdateFormValues) => {
    try {
      await updateComplaintMutation.mutateAsync({ id: id!, data });
      toast.success('Complaint updated successfully');
      reset();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update complaint');
    }
  };

  const statusVariant =
    complaint.status === 'new'
      ? 'bg-amber-500/20 text-amber-600'
      : complaint.status === 'resolved'
        ? 'bg-green-500/20 text-green-600'
        : 'bg-red-500/20 text-red-600';

  return (
    <>
      <title>{metadata.title}</title>
      <Box className="relative min-h-screen overflow-hidden bg-background p-6">
        <Box className="pointer-events-none fixed inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <Box className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <Box className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]" />
        </Box>

        <Box className="relative max-w-4xl mx-auto">
          <Box className="mb-6">
            <Button
              variant="text"
              onClick={() => navigate('/complaints')}
              className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
            >
              <Iconify icon="solar:arrow-left-bold" width={20} className="mr-2" />
              Back to Complaints
            </Button>

            <Box className="flex items-center gap-4 mb-2">
              <Box className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Iconify
                  icon="solar:chat-round-dots-bold"
                  className="text-primary"
                  width={32}
                  height={32}
                />
              </Box>
              <Box className="flex-1">
                <Typography variant="h4" className="font-bold text-foreground mb-1">
                  Complaint #{complaint.id}
                </Typography>
                <Typography variant="body2" className="text-muted-foreground">
                  Order #{complaint.order_id} · {complaint.type}
                </Typography>
              </Box>
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusVariant}`}
              >
                {complaint.status}
              </span>
            </Box>
          </Box>

          <Box className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-sm overflow-hidden">
            <Box className="p-6">
              <Typography variant="h6" className="font-semibold mb-4">
                Complaint Information
              </Typography>
              <Box className="grid gap-4 sm:grid-cols-2">
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Order ID
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    #{complaint.order_id}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Type
                  </Typography>
                  <Typography variant="body1" className="font-medium capitalize">
                    {complaint.type}
                  </Typography>
                </Box>
                <Box className="sm:col-span-2">
                  <Typography variant="caption" className="text-muted-foreground">
                    Message
                  </Typography>
                  <Typography variant="body1" className="font-medium mt-1">
                    {complaint.message || '-'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    User
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {complaint.user?.name ?? '-'}
                  </Typography>
                  <Typography variant="body2" className="text-muted-foreground">
                    {complaint.user?.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-muted-foreground">
                    Created At
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {new Date(complaint.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {complaint.admin_response && (
              <>
                <Separator />
                <Box className="p-6">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Admin Response
                  </Typography>
                  <Typography variant="body1" className="text-muted-foreground">
                    {complaint.admin_response}
                  </Typography>
                </Box>
              </>
            )}

            {complaint.images && complaint.images.length > 0 && (
              <>
                <Separator />
                <Box className="p-6">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Images
                  </Typography>
                  <Box className="flex flex-wrap gap-2">
                    {complaint.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={img}
                          alt={`Complaint ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                      </a>
                    ))}
                  </Box>
                </Box>
              </>
            )}

            {complaint.order && (
              <>
                <Separator />
                <Box className="p-6">
                  <Typography variant="subtitle2" className="font-semibold mb-2">
                    Order Details
                  </Typography>
                  <Box className="grid gap-2 sm:grid-cols-2 text-sm">
                    <Box>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      {complaint.order.status}
                    </Box>
                    <Box>
                      <span className="text-muted-foreground">Total:</span>{' '}
                      {complaint.order.total}
                    </Box>
                    <Box>
                      <span className="text-muted-foreground">Subtotal:</span>{' '}
                      {complaint.order.subtotal}
                    </Box>
                    <Box>
                      <span className="text-muted-foreground">Created:</span>{' '}
                      {new Date(complaint.order.created_at).toLocaleString()}
                    </Box>
                  </Box>
                </Box>
              </>
            )}

            {isNew && (
              <>
                <Separator />
                <Box className="p-6">
                  <Typography variant="h6" className="font-semibold mb-4">
                    Respond to Complaint
                  </Typography>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Box>
                      <label className="mb-2 block text-sm font-medium">Status</label>
                      <select
                        {...methods.register('status')}
                        className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </Box>
                    <Box>
                      <label className="mb-2 block text-sm font-medium">
                        Admin Response
                      </label>
                      <Controller
                        name="admin_response"
                        control={control}
                        render={({ field, fieldState: { error } }) => (
                          <div>
                            <textarea
                              {...field}
                              rows={4}
                              placeholder="Type your response..."
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px]"
                            />
                            {error?.message && (
                              <p className="mt-1 text-xs text-destructive">
                                {error.message}
                              </p>
                            )}
                          </div>
                        )}
                      />
                    </Box>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateComplaintMutation.isPending}
                    >
                      {updateComplaintMutation.isPending ? 'Submitting...' : 'Submit Response'}
                    </Button>
                  </form>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}
