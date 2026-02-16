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

export default function InvoicesPage() {
  const { data: invoices, isLoading } = useListInvoices();
  const { activePlan, isPro, isPaid } = usePlanAccess();
  const downloadPdf = useDownloadInvoicePdf();
  const downloadZip = useDownloadInvoicesZip();
  const downloadMonthZip = useDownloadMonthZip();
  const exportCsv = useExportCsv();
  const exportExcel = useExportExcel();
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const handleSelectAll = (checked: boolean) => {
    if (checked && invoices) {
      setSelectedIds(new Set(invoices.map(inv => inv.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectInvoice = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDownloadSinglePdf = async (invoiceId: string) => {
    if (!isPaid) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const pdfFile = await downloadPdf.mutateAsync(invoiceId);
      downloadFile(pdfFile.content, pdfFile.filename, 'application/pdf');
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF download error:', error);
      if (error instanceof Error && error.message.includes('requires Starter or Pro')) {
        setShowUpgradeModal(true);
      } else {
        toast.error('Failed to download PDF. Please try again.');
      }
    }
  };

  const handleBatchDownload = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    if (selectedIds.size === 0) {
      toast.error('Please select at least one invoice');
      return;
    }

    try {
      const zipFile = await downloadZip.mutateAsync(Array.from(selectedIds));
      downloadFile(zipFile.content, zipFile.filename, 'application/zip');
      toast.success('Batch ZIP downloaded successfully!');
    } catch (error) {
      console.error('Batch download error:', error);
      if (error instanceof Error && error.message.includes('requires Pro')) {
        setShowUpgradeModal(true);
      } else {
        toast.error('Failed to download batch ZIP. Please try again.');
      }
    }
  };

  const handleMonthDownload = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const zipFile = await downloadMonthZip.mutateAsync({ year: selectedYear, month: selectedMonth });
      downloadFile(zipFile.content, zipFile.filename, 'application/zip');
      toast.success('Month ZIP downloaded successfully!');
    } catch (error) {
      console.error('Month download error:', error);
      if (error instanceof Error && error.message.includes('requires Pro')) {
        setShowUpgradeModal(true);
      } else {
        toast.error('Failed to download month ZIP. Please try again.');
      }
    }
  };

  const handleExportCsv = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const csvFile = await exportCsv.mutateAsync();
      downloadFile(csvFile.content, csvFile.filename, 'text/csv');
      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('CSV export error:', error);
      if (error instanceof Error && error.message.includes('requires Pro')) {
        setShowUpgradeModal(true);
      } else {
        toast.error('Failed to export CSV. Please try again.');
      }
    }
  };

  const handleExportExcel = async () => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    try {
      const excelFile = await exportExcel.mutateAsync();
      downloadFile(excelFile.content, excelFile.filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      toast.success('Excel exported successfully!');
    } catch (error) {
      console.error('Excel export error:', error);
      if (error instanceof Error && error.message.includes('requires Pro')) {
        setShowUpgradeModal(true);
      } else {
        toast.error('Failed to export Excel. Please try again.');
      }
    }
  };

  const formatVatAmount = (invoice: any): string => {
    if (invoice.vatAmount === undefined || invoice.vatAmount === null) return '—';
    const currency = invoice.currency || 'EUR';
    return formatCurrency(invoice.vatAmount, currency);
  };

  const formatVatRate = (rate: number | undefined): string => {
    if (rate === undefined || rate === null) return '—';
    return `${rate.toFixed(0)}%`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading invoices...</div>
      </div>
    );
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Invoices</h1>
            <p className="text-muted-foreground">
              Manage and export your saved invoices
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {activePlan.charAt(0).toUpperCase() + activePlan.slice(1)} Plan
          </Badge>
        </div>

        {/* Export Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Export Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pro-only batch exports */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Batch Download {!isPro && <Badge variant="secondary">Pro</Badge>}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Download multiple invoices as ZIP
                </p>
                <Button
                  onClick={handleBatchDownload}
                  disabled={!isPro || selectedIds.size === 0 || downloadZip.isPending}
                  className="w-full"
                  size="sm"
                >
                  {downloadZip.isPending ? 'Downloading...' : `Download Selected (${selectedIds.size})`}
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Month-wise ZIP {!isPro && <Badge variant="secondary">Pro</Badge>}
                </h3>
                <div className="flex gap-2">
                  <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(m => (
                        <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleMonthDownload}
                  disabled={!isPro || downloadMonthZip.isPending}
                  className="w-full"
                  size="sm"
                >
                  {downloadMonthZip.isPending ? 'Downloading...' : 'Download Month'}
                </Button>
              </div>
            </div>

            {/* Pro-only CSV/Excel exports */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV Export {!isPro && <Badge variant="secondary">Pro</Badge>}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Export all invoices as CSV
                </p>
                <Button
                  onClick={handleExportCsv}
                  disabled={!isPro || exportCsv.isPending}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  {exportCsv.isPending ? 'Exporting...' : 'Export CSV'}
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Export {!isPro && <Badge variant="secondary">Pro</Badge>}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Export all invoices as Excel (DATEV-ready)
                </p>
                <Button
                  onClick={handleExportExcel}
                  disabled={!isPro || exportExcel.isPending}
                  className="w-full"
                  size="sm"
                  variant="outline"
                >
                  {exportExcel.isPending ? 'Exporting...' : 'Export Excel'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Saved Invoices</CardTitle>
              {invoices && invoices.length > 0 && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedIds.size === invoices.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">Select All</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!invoices || invoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No invoices saved yet</p>
                <p className="text-sm mt-2">Create your first invoice to see it here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Select</th>
                      <th className="text-left p-3 font-semibold">Invoice #</th>
                      <th className="text-left p-3 font-semibold">Date</th>
                      <th className="text-left p-3 font-semibold">VAT Rate</th>
                      <th className="text-left p-3 font-semibold">VAT Amount</th>
                      <th className="text-left p-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <Checkbox
                            checked={selectedIds.has(invoice.id)}
                            onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                          />
                        </td>
                        <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                        <td className="p-3">{invoice.invoiceDate}</td>
                        <td className="p-3">{formatVatRate(invoice.vatRate)}</td>
                        <td className="p-3">{formatVatAmount(invoice)}</td>
                        <td className="p-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadSinglePdf(invoice.id)}
                            disabled={!isPaid}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon Section */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• XML Export (XRechnung format)</p>
              <p>• ZUGFeRD hybrid PDF/XML invoices</p>
              <p>• Direct DATEV integration</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
