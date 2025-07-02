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

interface PayrollData {
  attendance_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  jobsite_name: string;
  date: string;
  shift_hours: number;
  regular_hours: number;
  overtime_hours: number;
  regular_rate: number;
  overtime_rate: number;
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

  const calculatePayroll = (attendance: any[], employees: any[], jobsites: any[]) => {
    return attendance.map(record => {
      const employee = employees.find(emp => emp.id === record.employee_id);
      const jobsite = jobsites.find(js => js.id === record.jobsite_id);
      
      const shiftHours = record.shift_hours || 0;
      let regularHours = 0;
      let overtimeHours = 0;
      let regularPay = 0;
      let overtimePay = 0;

      // Calculate regular and overtime hours (4+ hours = overtime)
      if (shiftHours <= 4) {
        regularHours = shiftHours;
        overtimeHours = 0;
      } else {
        regularHours = 4;
        overtimeHours = shiftHours - 4;
      }

      // Calculate pay
      const regularRate = employee?.regular_rate || 0;
      const overtimeRate = employee?.overtime_rate || 0;
      
      regularPay = regularHours * regularRate;
      overtimePay = overtimeHours * overtimeRate;

      return {
        attendance_id: record.id,
        employee_id: record.employee_id,
        first_name: employee?.first_name || '',
        last_name: employee?.last_name || '',
        jobsite_name: jobsite?.name || '',
        date: record.date,
        shift_hours: shiftHours,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        regular_rate: regularRate,
        overtime_rate: overtimeRate,
        regular_pay: regularPay,
        overtime_pay: overtimePay,
        total_pay: regularPay + overtimePay,
      };
    });
  };

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
      // Fetch attendance records
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Fetch employees
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*');

      if (employeesError) throw employeesError;

      // Fetch jobsites
      const { data: jobsites, error: jobsitesError } = await supabase
        .from('job_sites')
        .select('*');

      if (jobsitesError) throw jobsitesError;

      // Calculate payroll data
      const calculatedPayroll = calculatePayroll(attendance || [], employees || [], jobsites || []);
      setPayrollData(calculatedPayroll);
      
      // Calculate totals
      const totalHours = calculatedPayroll.reduce((sum, record) => sum + record.shift_hours, 0);
      const totalRegularPay = calculatedPayroll.reduce((sum, record) => sum + record.regular_pay, 0);
      const totalOvertimePay = calculatedPayroll.reduce((sum, record) => sum + record.overtime_pay, 0);
      const totalPay = calculatedPayroll.reduce((sum, record) => sum + record.total_pay, 0);

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
        'Total Hours': record.shift_hours,
        'Regular Hours': record.regular_hours,
        'Overtime Hours': record.overtime_hours,
        'Regular Rate': `$${record.regular_rate?.toFixed(2) || '0.00'}`,
        'Overtime Rate': `$${record.overtime_rate?.toFixed(2) || '0.00'}`,
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

  const exportToCSV = () => {
    const exportData = payrollData.map(record => ({
      'Employee': `${record.first_name} ${record.last_name}`,
      'Job Site': record.jobsite_name,
      'Date': format(new Date(record.date), 'MMM dd, yyyy'),
      'Total Hours': record.shift_hours,
      'Regular Hours': record.regular_hours,
      'Overtime Hours': record.overtime_hours,
      'Regular Rate': `$${record.regular_rate?.toFixed(2) || '0.00'}`,
      'Overtime Rate': `$${record.overtime_rate?.toFixed(2) || '0.00'}`,
      'Regular Pay': `$${record.regular_pay?.toFixed(2) || '0.00'}`,
      'Overtime Pay': `$${record.overtime_pay?.toFixed(2) || '0.00'}`,
      'Total Pay': `$${record.total_pay?.toFixed(2) || '0.00'}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_report_${startDate}_to_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'CSV file downloaded successfully' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payroll Report</CardTitle>
        <p className="text-sm text-gray-600">
          Overtime calculation: Hours worked beyond 4 hours are considered overtime
        </p>
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
              <Button onClick={exportToCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
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
                    <TableHead>Total Hours</TableHead>
                    <TableHead>Regular Hours</TableHead>
                    <TableHead>Overtime Hours</TableHead>
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
                      <TableCell>{record.regular_hours?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{record.overtime_hours?.toFixed(2) || '0.00'}</TableCell>
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
            No attendance data found for the selected date range.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayrollReport;
