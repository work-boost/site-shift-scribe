
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Download, Calendar, BarChart3 } from 'lucide-react';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import * as XLSX from 'xlsx';

interface WeeklyData {
  employee_id: string;
  first_name: string;
  last_name: string;
  total_hours: number;
  total_days: number;
  total_pay: number;
  week_start: string;
  week_end: string;
}

const WeeklyReport = () => {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    return format(startOfWeek(today), 'yyyy-MM-dd');
  });

  useEffect(() => {
    if (selectedWeek) {
      fetchWeeklyData();
    }
  }, [selectedWeek]);

  const fetchWeeklyData = async () => {
    setLoading(true);
    try {
      const weekStart = new Date(selectedWeek);
      const weekEnd = endOfWeek(weekStart);

      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          employees!inner(id, first_name, last_name, regular_rate, overtime_rate)
        `)
        .gte('date', format(weekStart, 'yyyy-MM-dd'))
        .lte('date', format(weekEnd, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Group by employee and calculate weekly totals
      const weeklyTotals = (attendance || []).reduce((acc: any, record: any) => {
        const employeeId = record.employee_id;
        const employee = record.employees;
        
        if (!acc[employeeId]) {
          acc[employeeId] = {
            employee_id: employeeId,
            first_name: employee.first_name,
            last_name: employee.last_name,
            total_hours: 0,
            total_days: 0,
            total_pay: 0,
            week_start: format(weekStart, 'yyyy-MM-dd'),
            week_end: format(weekEnd, 'yyyy-MM-dd'),
            days: new Set(),
          };
        }

        const shiftHours = record.shift_hours || 0;
        acc[employeeId].total_hours += shiftHours;
        acc[employeeId].days.add(record.date);

        // Calculate pay
        const regularRate = employee.regular_rate || 0;
        const overtimeRate = employee.overtime_rate || 0;
        
        let regularHours = Math.min(shiftHours, 4);
        let overtimeHours = Math.max(0, shiftHours - 4);
        
        acc[employeeId].total_pay += (regularHours * regularRate) + (overtimeHours * overtimeRate);

        return acc;
      }, {});

      // Convert to array and add total days
      const weeklyArray = Object.values(weeklyTotals).map((employee: any) => ({
        ...employee,
        total_days: employee.days.size,
      }));

      setWeeklyData(weeklyArray);
      toast.success('Weekly report generated successfully');
    } catch (error: any) {
      toast.error('Failed to generate weekly report');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      weeklyData.map(record => ({
        'Employee': `${record.first_name} ${record.last_name}`,
        'Week': `${format(new Date(record.week_start), 'MMM dd')} - ${format(new Date(record.week_end), 'MMM dd, yyyy')}`,
        'Total Hours': record.total_hours?.toFixed(2) || '0.00',
        'Days Worked': record.total_days,
        'Total Pay': `$${record.total_pay?.toFixed(2) || '0.00'}`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Weekly Report');
    
    const fileName = `weekly_report_${selectedWeek}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Excel file downloaded successfully');
  };

  const totals = useMemo(() => {
    return weeklyData.reduce((acc, record) => ({
      totalHours: acc.totalHours + record.total_hours,
      totalPay: acc.totalPay + record.total_pay,
    }), { totalHours: 0, totalPay: 0 });
  }, [weeklyData]);

  return (
    <Card className="border-2 border-orange-300 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7" />
          Weekly Report
        </CardTitle>
        <p className="text-orange-100">
          Weekly summary of employee hours and payroll
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="week-select" className="text-orange-800 font-semibold">Select Week</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                id="week-select"
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="pl-12 border-2 border-orange-300 focus:border-orange-500 rounded-lg"
              />
            </div>
            <p className="text-sm text-orange-600 mt-1">
              Week: {format(new Date(selectedWeek), 'MMM dd')} - {format(endOfWeek(new Date(selectedWeek)), 'MMM dd, yyyy')}
            </p>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={exportToExcel} 
              variant="outline" 
              className="border-2 border-orange-500 text-orange-700 hover:bg-orange-50 rounded-lg font-semibold"
            >
              <Download className="h-5 w-5 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {weeklyData.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-700">{weeklyData.length}</div>
                  <p className="text-sm text-orange-600 font-medium">Employees</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-orange-700">{totals.totalHours.toFixed(2)}</div>
                  <p className="text-sm text-orange-600 font-medium">Total Hours</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-700">${totals.totalPay.toFixed(2)}</div>
                  <p className="text-sm text-green-600 font-medium">Total Payroll</p>
                </CardContent>
              </Card>
            </div>

            <div className="overflow-x-auto border-2 border-orange-200 rounded-xl shadow-lg">
              <Table>
                <TableHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                  <TableRow>
                    <TableHead className="text-orange-800 font-bold">Employee</TableHead>
                    <TableHead className="text-orange-800 font-bold">Total Hours</TableHead>
                    <TableHead className="text-orange-800 font-bold">Days Worked</TableHead>
                    <TableHead className="text-orange-800 font-bold">Total Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weeklyData.map((record) => (
                    <TableRow key={record.employee_id} className="hover:bg-orange-50 transition-colors">
                      <TableCell className="font-semibold text-orange-900">
                        {record.first_name} {record.last_name}
                      </TableCell>
                      <TableCell className="text-orange-700 font-medium">
                        {record.total_hours?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-orange-700 font-medium">
                        {record.total_days}
                      </TableCell>
                      <TableCell className="font-bold text-green-700">
                        ${record.total_pay?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {weeklyData.length === 0 && !loading && (
          <div className="text-center py-12 text-orange-600">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-orange-400" />
            <p className="text-lg font-medium">No data found for the selected week.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-orange-600 font-medium">Generating weekly report...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyReport;
