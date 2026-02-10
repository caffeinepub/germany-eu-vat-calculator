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
      return actor.listInvoices();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useDownloadInvoicePdf() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.downloadInvoiceAsPdf(invoiceId);
    },
  });
}

export function useDownloadInvoicesZip() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      if (!actor) throw new Error('Actor not available');
      return actor.downloadInvoicesAsZip(invoiceIds);
    },
  });
}

export function useDownloadMonthZip() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({ year, month }: { year: number; month: number }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.downloadMonthInvoicesAsZip(BigInt(year), BigInt(month));
    },
  });
}

export function useExportCsv() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportInvoicesAsCsv();
    },
  });
}

export function useExportExcel() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.exportInvoicesAsExcel();
    },
  });
}
