
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';

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
        .select('*')
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

  const calculateTotalPay = (regularRate: number, overtimeRate: number, hoursWorked: number = 8) => {
    if (hoursWorked <= 4) {
      return hoursWorked * regularRate;
    } else {
      const regularHours = 4;
      const overtimeHours = hoursWorked - 4;
      return (regularHours * regularRate) + (overtimeHours * overtimeRate);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading employee rates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Employee Rate Cards</CardTitle>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee Rate
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Valid From</TableHead>
                <TableHead>Valid To</TableHead>
                <TableHead>Regular Rate</TableHead>
                <TableHead>Overtime Rate</TableHead>
                <TableHead>Total Pay (8hrs)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                      <p className="text-sm text-gray-500">{employee.type}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    Ongoing
                  </TableCell>
                  <TableCell>${(employee.regular_rate || 0).toFixed(2)}/hr</TableCell>
                  <TableCell>${(employee.overtime_rate || 0).toFixed(2)}/hr</TableCell>
                  <TableCell className="font-semibold">
                    ${calculateTotalPay(employee.regular_rate || 0, employee.overtime_rate || 0, 8).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {employees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No employees found.
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
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
