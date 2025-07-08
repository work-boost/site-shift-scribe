
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Download, Calendar, BarChart3, Users, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MasterReportData {
  employee_id: string;
  first_name: string;
  last_name: string;
  employee_type: string;
  jobsite_name: string;
  total_hours: number;
  total_days: number;
  regular_pay: number;
  overtime_pay: number;
  total_pay: number;
}

interface Summary {
  totalEmployees: number;
  totalJobsites: number;
  totalHours: number;
  totalPayroll: number;
}

const MasterReport = () => {
  const [masterData, setMasterData] = useState<MasterReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedJobsite, setSelectedJobsite] = useState('');
  const [selectedEmployeeType, setSelectedEmployeeType] = useState('');
  const [jobsites, setJobsites] = useState<any[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalEmployees: 0,
    totalJobsites: 0,
    totalHours: 0,
    totalPayroll: 0,
  });

  useEffect(() => {
    fetchJobsites();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchMasterData();
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

  const fetchMasterData = async () => {
    setLoading(true);
    try {
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select(`
          *,
          employees!inner(id, first_name, last_name, type, regular_rate, overtime_rate),
          job_sites!inner(id, name)
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (attendanceError) throw attendanceError;

      // Process data
      const processedData = (attendance || []).reduce((acc: any, record: any) => {
        const key = `${record.employee_id}-${record.jobsite_id}`;
        const employee = record.employees;
        const jobsite = record.job_sites;
        
        if (!acc[key]) {
          acc[key] = {
            employee_id: record.employee_id,
            first_name: employee.first_name,
            last_name: employee.last_name,
            employee_type: employee.type,
            jobsite_name: jobsite.name,
            total_hours: 0,
            total_days: 0,
            regular_pay: 0,
            overtime_pay: 0,
            total_pay: 0,
            days: new Set(),
          };
        }

        const shiftHours = record.shift_hours || 0;
        acc[key].total_hours += shiftHours;
        acc[key].days.add(record.date);

        // Calculate pay
        const regularRate = employee.regular_rate || 0;
        const overtimeRate = employee.overtime_rate || 0;
        
        // Store daily hours - overtime calculated weekly (40+ hours = overtime)
        let regularHours = shiftHours;
        let overtimeHours = 0;
        
        const regularPayAmount = regularHours * regularRate;
        const overtimePayAmount = overtimeHours * overtimeRate;
        
        acc[key].regular_pay += regularPayAmount;
        acc[key].overtime_pay += overtimePayAmount;
        acc[key].total_pay += regularPayAmount + overtimePayAmount;

        return acc;
      }, {});

      // Convert to array and add total days
      const masterArray = Object.values(processedData).map((item: any) => ({
        ...item,
        total_days: item.days.size,
      }));

      setMasterData(masterArray);
      
      // Calculate summary
      const uniqueEmployees = new Set(masterArray.map(item => item.employee_id));
      const uniqueJobsites = new Set(masterArray.map(item => item.jobsite_name));
      
      setSummary({
        totalEmployees: uniqueEmployees.size,
        totalJobsites: uniqueJobsites.size,
        totalHours: masterArray.reduce((sum, item) => sum + item.total_hours, 0),
        totalPayroll: masterArray.reduce((sum, item) => sum + item.total_pay, 0),
      });

      toast.success('Master report generated successfully');
    } catch (error: any) {
      toast.error('Failed to generate master report');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    return masterData.filter(record => {
      const jobsiteMatch = selectedJobsite === '' || selectedJobsite === 'all' || 
        record.jobsite_name === jobsites.find(js => js.id === selectedJobsite)?.name;
      
      const typeMatch = selectedEmployeeType === '' || selectedEmployeeType === 'all' || 
        record.employee_type === selectedEmployeeType;

      return jobsiteMatch && typeMatch;
    });
  }, [masterData, selectedJobsite, selectedEmployeeType, jobsites]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map(record => ({
        'Employee': `${record.first_name} ${record.last_name}`,
        'Type': record.employee_type,
        'Job Site': record.jobsite_name,
        'Total Hours': record.total_hours?.toFixed(2) || '0.00',
        'Days Worked': record.total_days,
        'Regular Pay': `$${record.regular_pay?.toFixed(2) || '0.00'}`,
        'Overtime Pay': `$${record.overtime_pay?.toFixed(2) || '0.00'}`,
        'Total Pay': `$${record.total_pay?.toFixed(2) || '0.00'}`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Master Report');
    
    const fileName = `master_report_${startDate}_to_${endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Excel file downloaded successfully');
  };

  const employeeTypes = ['Employee', 'Foreman', 'PM'];

  return (
    <Card className="border-2 border-orange-300 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7" />
          Master Report
        </CardTitle>
        <p className="text-orange-100">
          Complete overview of all employees across all job sites
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="start-date" className="text-orange-800 font-semibold">Start Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="pl-12 border-2 border-orange-300 focus:border-orange-500 rounded-lg"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="end-date" className="text-orange-800 font-semibold">End Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="pl-12 border-2 border-orange-300 focus:border-orange-500 rounded-lg"
              />
            </div>
          </div>
        </div>

        {masterData.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label className="text-orange-800 font-semibold">Filter by Job Site</Label>
                <Select value={selectedJobsite} onValueChange={setSelectedJobsite}>
                  <SelectTrigger className="border-2 border-orange-300 focus:border-orange-500 rounded-lg">
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
              
              <div>
                <Label className="text-orange-800 font-semibold">Filter by Employee Type</Label>
                <Select value={selectedEmployeeType} onValueChange={setSelectedEmployeeType}>
                  <SelectTrigger className="border-2 border-orange-300 focus:border-orange-500 rounded-lg">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {employeeTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={exportToExcel} 
                  variant="outline" 
                  className="border-2 border-orange-500 text-orange-700 hover:bg-orange-50 rounded-lg font-semibold w-full"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Export Excel
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold text-orange-700">{summary.totalEmployees}</div>
                      <p className="text-sm text-orange-600 font-medium">Employees</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-8 w-8 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold text-orange-700">{summary.totalJobsites}</div>
                      <p className="text-sm text-orange-600 font-medium">Job Sites</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-8 w-8 text-orange-500" />
                    <div>
                      <div className="text-2xl font-bold text-orange-700">{summary.totalHours.toFixed(2)}</div>
                      <p className="text-sm text-orange-600 font-medium">Total Hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-orange-200 bg-gradient-to-br from-green-50 to-green-100">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-green-700">${summary.totalPayroll.toFixed(2)}</div>
                      <p className="text-sm text-green-600 font-medium">Total Payroll</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="overflow-x-auto border-2 border-orange-200 rounded-xl shadow-lg">
              <Table>
                <TableHeader className="bg-gradient-to-r from-orange-100 to-yellow-100">
                  <TableRow>
                    <TableHead className="text-orange-800 font-bold">Employee</TableHead>
                    <TableHead className="text-orange-800 font-bold">Type</TableHead>
                    <TableHead className="text-orange-800 font-bold">Job Site</TableHead>
                    <TableHead className="text-orange-800 font-bold">Hours</TableHead>
                    <TableHead className="text-orange-800 font-bold">Days</TableHead>
                    <TableHead className="text-orange-800 font-bold">Regular Pay</TableHead>
                    <TableHead className="text-orange-800 font-bold">Overtime Pay</TableHead>
                    <TableHead className="text-orange-800 font-bold">Total Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record, index) => (
                    <TableRow key={`${record.employee_id}-${record.jobsite_name}-${index}`} className="hover:bg-orange-50 transition-colors">
                      <TableCell className="font-semibold text-orange-900">
                        {record.first_name} {record.last_name}
                      </TableCell>
                      <TableCell className="text-orange-700">
                        <span className="px-2 py-1 bg-orange-100 rounded-md text-xs font-medium">
                          {record.employee_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-orange-700 font-medium">
                        {record.jobsite_name}
                      </TableCell>
                      <TableCell className="text-orange-700 font-medium">
                        {record.total_hours?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-orange-700 font-medium">
                        {record.total_days}
                      </TableCell>
                      <TableCell className="text-blue-700 font-semibold">
                        ${record.regular_pay?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="text-purple-700 font-semibold">
                        ${record.overtime_pay?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell className="font-bold text-green-700">
                        ${record.total_pay?.toFixed(2) || '0.00'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredData.length === 0 && masterData.length > 0 && (
              <div className="text-center py-8 text-orange-600">
                No records match your filter criteria.
              </div>
            )}
          </>
        )}

        {masterData.length === 0 && !loading && startDate && endDate && (
          <div className="text-center py-12 text-orange-600">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-orange-400" />
            <p className="text-lg font-medium">No data found for the selected date range.</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-orange-600 font-medium">Generating master report...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MasterReport;
