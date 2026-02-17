import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { InvoiceRecord } from '../backend';

export function useListInvoices() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<InvoiceRecord[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.listInvoices();
      } catch (error) {
        console.error('Failed to list invoices:', error);
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: 1,
  });
}

export function useDownloadInvoicePdf() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.downloadInvoiceAsPdf(invoiceId);
      } catch (error) {
        console.error('Failed to download invoice PDF:', error);
        throw error;
      }
    },
  });
}

export function useDownloadInvoicesZip() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.downloadInvoicesAsZip(invoiceIds);
      } catch (error) {
        console.error('Failed to download invoices ZIP:', error);
        throw error;
      }
    },
  });
}

export function useDownloadMonthZip() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.downloadMonthInvoicesAsZip(BigInt(year), BigInt(month));
      } catch (error) {
        console.error('Failed to download month ZIP:', error);
        throw error;
      }
    },
  });
}

export function useExportCsv() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.exportInvoicesAsCsv();
      } catch (error) {
        console.error('Failed to export CSV:', error);
        throw error;
      }
    },
  });
}

export function useExportExcel() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.exportInvoicesAsExcel();
      } catch (error) {
        console.error('Failed to export Excel:', error);
        throw error;
      }
    },
  });
}
