
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface PayrollData {
  attendance_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  jobsite_id: string;
  jobsite_name: string;
  date: string;
  shift_hours: number;
  regular_hours: number;
  overtime_hours: number;
  regular_pay_rate: number;
  overtime_pay_rate: number;
  regular_pay: number;
  overtime_pay: number;
  total_pay: number;
}

const PayrollReport = () => {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totals, setTotals] = useState({
    totalHours: 0,
    totalRegularPay: 0,
    totalOvertimePay: 0,
    totalPay: 0,
  });

  const fetchPayrollData = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Date Range Required',
        description: 'Please select both start and end dates.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pay_report_view')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })
        .order('last_name');

      if (error) throw error;

      setPayrollData(data || []);
      
      // Calculate totals
      const totalHours = data?.reduce((sum, record) => sum + (record.shift_hours || 0), 0) || 0;
      const totalRegularPay = data?.reduce((sum, record) => sum + (record.regular_pay || 0), 0) || 0;
      const totalOvertimePay = data?.reduce((sum, record) => sum + (record.overtime_pay || 0), 0) || 0;
      const totalPay = data?.reduce((sum, record) => sum + (record.total_pay || 0), 0) || 0;

      setTotals({
        totalHours,
        totalRegularPay,
        totalOvertimePay,
        totalPay,
      });
    } catch (error: any) {
      toast({
        title: 'Error fetching payroll data',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      payrollData.map(record => ({
        'Employee': `${record.first_name} ${record.last_name}`,
        'Job Site': record.jobsite_name,
        'Date': format(new Date(record.date), 'MMM dd, yyyy'),
        'Hours': record.shift_hours,
        'Regular Hours': record.regular_hours,
        'Overtime Hours': record.overtime_hours,
        'Regular Rate': `$${record.regular_pay_rate?.toFixed(2) || '0.00'}`,
        'Overtime Rate': `$${record.overtime_pay_rate?.toFixed(2) || '0.00'}`,
        'Regular Pay': `$${record.regular_pay?.toFixed(2) || '0.00'}`,
        'Overtime Pay': `$${record.overtime_pay?.toFixed(2) || '0.00'}`,
        'Total Pay': `$${record.total_pay?.toFixed(2) || '0.00'}`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payroll Report');
    
    const fileName = `payroll_report_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({ title: 'Excel file downloaded successfully' });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Payroll Report', 14, 22);
    doc.setFontSize(12);
    doc.text(`Period: ${format(new Date(startDate), 'MMM dd, yyyy')} - ${format(new Date(endDate), 'MMM dd, yyyy')}`, 14, 32);
    
    const tableData = payrollData.map(record => [
      `${record.first_name} ${record.last_name}`,
      record.jobsite_name,
      format(new Date(record.date), 'MMM dd'),
      record.shift_hours?.toString() || '0',
      `$${record.regular_pay?.toFixed(2) || '0.00'}`,
      `$${record.overtime_pay?.toFixed(2) || '0.00'}`,
      `$${record.total_pay?.toFixed(2) || '0.00'}`,
    ]);

    (doc as any).autoTable({
      head: [['Employee', 'Job Site', 'Date', 'Hours', 'Regular Pay', 'Overtime Pay', 'Total Pay']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    // Add totals
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Total Hours: ${totals.totalHours.toFixed(2)}`, 14, finalY);
    doc.text(`Total Pay: $${totals.totalPay.toFixed(2)}`, 14, finalY + 10);
    
    const fileName = `payroll_report_${startDate}_to_${endDate}.pdf`;
    doc.save(fileName);
    
    toast({ title: 'PDF file downloaded successfully' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="start-date">Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="end-date">End Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={fetchPayrollData} disabled={loading} className="w-full">
              {loading ? 'Loading...' : 'Generate Report'}
            </Button>
          </div>
        </div>

        {payrollData.length > 0 && (
          <>
            <div className="flex gap-4 mb-6">
              <Button onClick={exportToExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              <Button onClick={exportToPDF} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{totals.totalHours.toFixed(2)}</div>
                  <p className="text-sm text-gray-600">Total Hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">${totals.totalRegularPay.toFixed(2)}</div>
                  <p className="text-sm text-gray-600">Regular Pay</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">${totals.totalOvertimePay.toFixed(2)}</div>
                  <p className="text-sm text-gray-600">Overtime Pay</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">${totals.totalPay.toFixed(2)}</div>
                  <p className="text-sm text-gray-600">Total Pay</p>
                </CardContent>
              </Card>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Job Site</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Regular Pay</TableHead>
                    <TableHead>Overtime Pay</TableHead>
                    <TableHead>Total Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((record) => (
                    <TableRow key={record.attendance_id}>
                      <TableCell>
                        {record.first_name} {record.last_name}
                      </TableCell>
                      <TableCell>{record.jobsite_name}</TableCell>
                      <TableCell>
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{record.shift_hours?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${record.regular_pay?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>${record.overtime_pay?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="font-semibold">
                        ${record.total_pay?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {payrollData.length === 0 && !loading && startDate && endDate && (
          <div className="text-center py-8 text-gray-500">
            No payroll data found for the selected date range.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayrollReport;
