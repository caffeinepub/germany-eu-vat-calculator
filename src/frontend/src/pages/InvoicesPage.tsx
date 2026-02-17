import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Package, FileSpreadsheet, FileCode } from 'lucide-react';
import { useListInvoices, useDownloadInvoicePdf, useDownloadInvoicesZip, useDownloadMonthZip, useExportCsv, useExportExcel } from '../hooks/useInvoiceOperations';
import { usePlanAccess } from '../hooks/usePlanAccess';
import { downloadFile } from '../utils/downloadFile';
import { formatCurrency } from '../lib/invoice/currency';
import UpgradeModal from '../components/usage/UpgradeModal';
import { toast } from 'sonner';
import type { InvoiceRecord } from '../backend';

export default function InvoicesPage() {
  const { data: invoices, isLoading, error } = useListInvoices();
  const { activePlan, isPro, isPaid } = usePlanAccess();
  const downloadPdf = useDownloadInvoicePdf();
  const downloadZip = useDownloadInvoicesZip();
  const downloadMonthZip = useDownloadMonthZip();
  const exportCsv = useExportCsv();
  const exportExcel = useExportExcel();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked && invoices) {
      setSelectedIds(invoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectInvoice = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDownloadPdf = async (invoiceId: string) => {
    try {
      const result = await downloadPdf.mutateAsync(invoiceId);
      downloadFile(result.content, result.filename, 'application/pdf');
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error('Download error:', error);
    }
  };

  const handleDownloadBatch = async () => {
    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }

    if (selectedIds.length === 0) {
      toast.error('Please select at least one invoice');
      return;
    }

    try {
      const result = await downloadZip.mutateAsync(selectedIds);
      downloadFile(result.content, result.filename, 'application/zip');
      toast.success(`Downloaded ${selectedIds.length} invoices as ZIP`);
    } catch (error) {
      toast.error('Failed to download batch');
      console.error('Batch download error:', error);
    }
  };

  const handleDownloadMonth = async () => {
    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }

    if (!selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    const [year, month] = selectedMonth.split('-').map(Number);
    try {
      const result = await downloadMonthZip.mutateAsync({ year, month });
      downloadFile(result.content, result.filename, 'application/zip');
      toast.success(`Downloaded invoices for ${selectedMonth}`);
    } catch (error) {
      toast.error('Failed to download month');
      console.error('Month download error:', error);
    }
  };

  const handleExportCsv = async () => {
    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const result = await exportCsv.mutateAsync();
      downloadFile(result.content, result.filename, 'text/csv');
      toast.success('Exported invoices as CSV');
    } catch (error) {
      toast.error('Failed to export CSV');
      console.error('CSV export error:', error);
    }
  };

  const handleExportExcel = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const result = await exportExcel.mutateAsync();
      downloadFile(result.content, result.filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      toast.success('Exported invoices as Excel (DATEV format)');
    } catch (error) {
      toast.error('Failed to export Excel');
      console.error('Excel export error:', error);
    }
  };

  const getMonthOptions = () => {
    if (!invoices || invoices.length === 0) return [];

    const months = new Set<string>();
    invoices.forEach((invoice) => {
      const date = new Date(Number(invoice.createdAt) / 1_000_000);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthKey);
    });

    return Array.from(months).sort().reverse();
  };

  // Backward-compatible display helpers with safe fallbacks
  const getInvoiceCurrency = (invoice: InvoiceRecord) => {
    return invoice.currency || 'EUR';
  };

  const getInvoiceVatLabel = (invoice: InvoiceRecord) => {
    return invoice.vatLabel || 'VAT';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading invoices...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-destructive">Failed to load invoices. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              No invoices yet. Create your first invoice using the calculator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Invoices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Batch Actions - with overflow visible wrapper */}
          <div className="flex flex-wrap gap-4 items-center border-b pb-4" style={{ overflow: 'visible' }}>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.length === invoices.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadBatch}
              disabled={selectedIds.length === 0 || downloadZip.isPending}
            >
              <Package className="w-4 h-4 mr-2" />
              {downloadZip.isPending ? 'Downloading...' : 'Download Selected (ZIP)'}
              {!isPaid && <Badge variant="secondary" className="ml-2">Starter+</Badge>}
            </Button>

            <div className="flex items-center gap-2" style={{ overflow: 'visible', position: 'relative', zIndex: 100 }}>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-[180px] select-trigger-safe">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent className="dropdown-safe">
                  {getMonthOptions().map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadMonth}
                disabled={!selectedMonth || downloadMonthZip.isPending}
              >
                <Package className="w-4 h-4 mr-2" />
                {downloadMonthZip.isPending ? 'Downloading...' : 'Download Month'}
                {!isPaid && <Badge variant="secondary" className="ml-2">Starter+</Badge>}
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={exportCsv.isPending}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              {exportCsv.isPending ? 'Exporting...' : 'Export CSV'}
              {!isPaid && <Badge variant="secondary" className="ml-2">Starter+</Badge>}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={exportExcel.isPending}
            >
              <FileCode className="w-4 h-4 mr-2" />
              {exportExcel.isPending ? 'Exporting...' : 'Export Excel (DATEV)'}
              {!isPro && <Badge variant="secondary" className="ml-2">Pro</Badge>}
            </Button>
          </div>

          {/* Invoice List */}
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Checkbox
                  checked={selectedIds.includes(invoice.id)}
                  onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                />

                <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{invoice.invoiceNumber}</span>
                    <Badge variant="outline">{invoice.invoiceDate}</Badge>
                    <Badge variant="secondary">{getInvoiceVatLabel(invoice)}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {invoice.vatRate}% VAT • {formatCurrency(invoice.vatAmount, getInvoiceCurrency(invoice))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPdf(invoice.id)}
                  disabled={downloadPdf.isPending}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloadPdf.isPending ? 'Downloading...' : 'PDF'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
