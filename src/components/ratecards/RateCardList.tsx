
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Search, Download, Upload, FileText } from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  regular_rate: number;
  overtime_rate: number;
  type: string;
}

interface RateCardListProps {
  onEdit: (rateCard: any) => void;
  onAdd: () => void;
  refreshTrigger: number;
}

const RateCardList = ({ onEdit, onAdd, refreshTrigger }: RateCardListProps) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger, searchTerm, currentPage]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .order('last_name', { ascending: true });

      if (searchTerm) {
        query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      setEmployees(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: any) {
      toast({
        title: 'Error fetching employees',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    onEdit(employee);
  };

  const exportToExcel = () => {
    const exportData = employees.map(employee => ({
      'Employee': `${employee.first_name} ${employee.last_name}`,
      'Type': employee.type,
      'Valid From': format(new Date(), 'MMM dd, yyyy'),
      'Valid To': 'Ongoing',
      'Regular Rate': `$${(employee.regular_rate || 0).toFixed(2)}/hr`,
      'Overtime Rate': `$${(employee.overtime_rate || 0).toFixed(2)}/hr`,
      'Status': 'Active'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rate Cards');
    
    const fileName = `rate_cards_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({ title: 'Excel file downloaded successfully' });
  };

  const exportToCSV = () => {
    const exportData = employees.map(employee => ({
      'Employee': `${employee.first_name} ${employee.last_name}`,
      'Type': employee.type,
      'Valid From': format(new Date(), 'MMM dd, yyyy'),
      'Valid To': 'Ongoing',
      'Regular Rate': `$${(employee.regular_rate || 0).toFixed(2)}/hr`,
      'Overtime Rate': `$${(employee.overtime_rate || 0).toFixed(2)}/hr`,
      'Status': 'Active'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `rate_cards_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({ title: 'CSV file downloaded successfully' });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PM': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Foreman': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  if (loading) {
    return (
      <Card className="border-2 border-purple-300 shadow-xl">
        <CardContent className="p-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-purple-700">Loading employee rates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-purple-300 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <CardTitle className="text-2xl font-bold">EMPLOYEE RATE CARDS</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="secondary" onClick={exportToExcel} className="bg-white text-purple-600 hover:bg-purple-50">
              <Upload className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="secondary" onClick={exportToCSV} className="bg-white text-purple-600 hover:bg-purple-50">
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={onAdd} className="bg-purple-700 hover:bg-purple-800">
              <Plus className="h-4 w-4 mr-2" />
              Add Employee Rate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 border-2 border-purple-200 focus:border-purple-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto border-2 border-purple-200 rounded-xl shadow-lg">
          <Table>
            <TableHeader className="bg-gradient-to-r from-purple-100 to-pink-100">
              <TableRow>
                <TableHead className="text-purple-800 font-bold">Employee</TableHead>
                <TableHead className="text-purple-800 font-bold hidden sm:table-cell">Valid From</TableHead>
                <TableHead className="text-purple-800 font-bold hidden sm:table-cell">Valid To</TableHead>
                <TableHead className="text-purple-800 font-bold">Regular Rate</TableHead>
                <TableHead className="text-purple-800 font-bold">Overtime Rate</TableHead>
                <TableHead className="text-purple-800 font-bold hidden lg:table-cell">Status</TableHead>
                <TableHead className="text-purple-800 font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-purple-50 transition-colors">
                  <TableCell className="font-semibold text-purple-900">
                    <div>
                      <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                      <Badge className={`${getTypeColor(employee.type)} text-xs mt-1`}>
                        {employee.type}
                      </Badge>
                      <div className="sm:hidden text-sm text-gray-600 mt-1">
                        {format(new Date(), 'MMM dd, yyyy')} - Ongoing
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-purple-700 hidden sm:table-cell">
                    {format(new Date(), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-purple-700 hidden sm:table-cell">
                    <span className="text-green-600 font-medium">Ongoing</span>
                  </TableCell>
                  <TableCell className="text-purple-700 font-semibold">${(employee.regular_rate || 0).toFixed(2)}/hr</TableCell>
                  <TableCell className="text-purple-700 font-semibold">${(employee.overtime_rate || 0).toFixed(2)}/hr</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(employee)}
                      className="text-purple-600 hover:bg-purple-100 border border-purple-200"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden sm:inline ml-1">Edit</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-8 text-purple-600">
            No employees found matching your criteria.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Previous
            </Button>
            <span className="flex items-center px-4 text-purple-700 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RateCardList;
