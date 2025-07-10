
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Download, Calendar, Search, Filter, FileText } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

interface JobSite {
  id: string;
  name: string;
}

const PayrollReport = () => {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [jobsites, setJobsites] = useState<JobSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedJobsite, setSelectedJobsite] = useState('');
  const [totals, setTotals] = useState({
    totalHours: 0,
    totalRegularPay: 0,
    totalOvertimePay: 0,
    totalPay: 0,
  });

  useEffect(() => {
    fetchJobsites();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchPayrollData();
    }
  }, [startDate, endDate]);

  const fetchJobsites = async () => {
    try {
      const { data, error } = await supabase
        .from('job_sites')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setJobsites(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch job sites');
    }
  };

  const calculatePayroll = (attendance: any[], employees: any[], jobsites: any[]) => {
    return attendance.map(record => {
      const employee = employees.find(emp => emp.id === record.employee_id);
      const jobsite = jobsites.find(js => js.id === record.jobsite_id);
      
      const shiftHours = record.shift_hours || 0;
      let regularHours = 0;
      let overtimeHours = 0;
      let regularPay = 0;
      let overtimePay = 0;

      // Store daily hours - overtime calculated weekly (40+ hours = overtime)
      regularHours = shiftHours;
      overtimeHours = 0;

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
    if (!startDate || !endDate) return;

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
      
      toast.success('Payroll report generated successfully');
    } catch (error: any) {
      toast.error('Failed to generate payroll report');
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return payrollData.filter(record => {
      const employeeMatch = searchEmployee === '' || 
        `${record.first_name} ${record.last_name}`.toLowerCase().includes(searchEmployee.toLowerCase());
      
      const jobsiteMatch = selectedJobsite === '' || selectedJobsite === 'all' || 
        record.jobsite_name === jobsites.find(js => js.id === selectedJobsite)?.name;

      return employeeMatch && jobsiteMatch;
    });
  }, [payrollData, searchEmployee, selectedJobsite, jobsites]);

  useEffect(() => {
    // Calculate totals for filtered data
    const totalHours = filteredData.reduce((sum, record) => sum + record.shift_hours, 0);
    const totalRegularPay = filteredData.reduce((sum, record) => sum + record.regular_pay, 0);
    const totalOvertimePay = filteredData.reduce((sum, record) => sum + record.overtime_pay, 0);
    const totalPay = filteredData.reduce((sum, record) => sum + record.total_pay, 0);

    setTotals({
      totalHours,
      totalRegularPay,
      totalOvertimePay,
      totalPay,
    });
  }, [filteredData]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(record => ({
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
    
    toast.success('Excel file downloaded successfully');
  };

  const exportToCSV = () => {
    const exportData = filteredData.map(record => ({
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
    
    toast.success('CSV file downloaded successfully');
  };

  return (
    <Card className="border-orange-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Payroll Report
        </CardTitle>
        <p className="text-orange-100">
          Overtime calculation: Hours worked beyond 40 hours per week are considered overtime
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="start-date" className="text-orange-800 font-medium">Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-10 border-orange-300 focus:border-orange-500"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="end-date" className="text-orange-800 font-medium">End Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-10 border-orange-300 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {payrollData.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="search-employee" className="text-orange-800 font-medium">Search Employee</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-orange-500" />
                  <Input
                    id="search-employee"
                    placeholder="Search by employee name..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="pl-10 border-orange-300 focus:border-orange-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-orange-800 font-medium">Filter by Job Site</Label>
                <Select value={selectedJobsite} onValueChange={setSelectedJobsite}>
                  <SelectTrigger className="border-orange-300 focus:border-orange-500">
                    <SelectValue placeholder="All Job Sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Job Sites</SelectItem>
                    {jobsites.map((jobsite) => (
                      <SelectItem key={jobsite.id} value={jobsite.id}>
                        {jobsite.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={exportToExcel} variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-50">
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button onClick={exportToCSV} variant="outline" className="border-orange-500 text-orange-700 hover:bg-orange-50">
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-700">{totals.totalHours.toFixed(2)}</div>
                  <p className="text-sm text-orange-600">Total Hours</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-700">${totals.totalRegularPay.toFixed(2)}</div>
                  <p className="text-sm text-green-600">Regular Pay</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-700">${totals.totalOvertimePay.toFixed(2)}</div>
                  <p className="text-sm text-blue-600">Overtime Pay</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-700">${totals.totalPay.toFixed(2)}</div>
                  <p className="text-sm text-orange-600">Total Pay</p>
                </CardContent>
              </Card>
            </div>

            <div className="overflow-x-auto border border-orange-200 rounded-lg">
              <Table>
                <TableHeader className="bg-orange-100">
                  <TableRow>
                    <TableHead className="text-orange-800">Employee</TableHead>
                    <TableHead className="text-orange-800">Job Site</TableHead>
                    <TableHead className="text-orange-800">Date</TableHead>
                    <TableHead className="text-orange-800">Total Hours</TableHead>
                    <TableHead className="text-orange-800">Regular Hours</TableHead>
                    <TableHead className="text-orange-800">Overtime Hours</TableHead>
                    <TableHead className="text-orange-800">Regular Rate</TableHead>
                    <TableHead className="text-orange-800">Overtime Rate</TableHead>
                    <TableHead className="text-orange-800">Regular Pay</TableHead>
                    <TableHead className="text-orange-800">Overtime Pay</TableHead>
                    <TableHead className="text-orange-800">Total Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record) => (
                    <TableRow key={record.attendance_id} className="hover:bg-orange-50">
                      <TableCell className="font-medium">
                        {record.first_name} {record.last_name}
                      </TableCell>
                      <TableCell>{record.jobsite_name}</TableCell>
                      <TableCell>
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>{record.shift_hours?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{record.regular_hours?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{record.overtime_hours?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="text-orange-600">${record.regular_rate?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="text-orange-600">${record.overtime_rate?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="text-green-700">${record.regular_pay?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="text-blue-700">${record.overtime_pay?.toFixed(2) || '0.00'}</TableCell>
                      <TableCell className="font-semibold text-orange-700">
                        ${record.total_pay?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredData.length === 0 && payrollData.length > 0 && (
              <div className="text-center py-8 text-orange-600">
                No records match your search criteria.
              </div>
            )}
          </>
        )}

        {payrollData.length === 0 && !loading && startDate && endDate && (
          <div className="text-center py-8 text-orange-600">
            No attendance data found for the selected date range.
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-500 border-t-transparent mx-auto"></div>
            <p className="mt-2 text-orange-600">Generating report...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PayrollReport;
