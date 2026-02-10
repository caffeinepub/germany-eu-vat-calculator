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
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month.value} value={month.value.toString()}>{month.label}</SelectItem>
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

            {/* Pro-only data exports */}
            <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV Export (DATEV-friendly) {!isPro && <Badge variant="secondary">Pro</Badge>}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Import into accounting software
                </p>
                <Button
                  onClick={handleExportCsv}
                  disabled={!isPro || exportCsv.isPending}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {exportCsv.isPending ? 'Exporting...' : 'Export CSV'}
                </Button>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Export (DATEV-friendly) {!isPro && <Badge variant="secondary">Pro</Badge>}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tax consultant–friendly format
                </p>
                <Button
                  onClick={handleExportExcel}
                  disabled={!isPro || exportExcel.isPending}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  {exportExcel.isPending ? 'Exporting...' : 'Export Excel'}
                </Button>
              </div>
            </div>

            {/* XML/ZUGFeRD - Coming Soon */}
            <div className="pt-4 border-t">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  XML / ZUGFeRD Export <Badge variant="secondary">Coming Soon</Badge>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Official German e-invoice standard for enterprises & public sector
                </p>
                <Button disabled variant="outline" className="w-full" size="sm">
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Saved Invoices ({invoices?.length || 0})</CardTitle>
              {isPro && invoices && invoices.length > 0 && (
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
                <p className="text-sm mt-2">Create and save invoices from the calculator</p>
              </div>
            ) : (
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    {isPro && (
                      <Checkbox
                        checked={selectedIds.has(invoice.id)}
                        onCheckedChange={(checked) => handleSelectInvoice(invoice.id, checked as boolean)}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(Number(invoice.createdAt) / 1000000).toLocaleDateString()} • Invoice Date: {invoice.invoiceDate}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleDownloadSinglePdf(invoice.id)}
                      disabled={!isPaid || downloadPdf.isPending}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isPaid ? 'PDF' : 'Upgrade for PDF'}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </div>
  );
}
