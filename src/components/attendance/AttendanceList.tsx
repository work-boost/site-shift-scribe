
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  employee_id: string;
  jobsite_id: string;
  date: string;
  start_time: string;
  end_time: string;
  minute_deduct: number;
  shift_hours: number;
  employee: {
    first_name: string;
    last_name: string;
  };
  job_site: {
    name: string;
  };
}

interface AttendanceListProps {
  onEdit: (attendance: AttendanceRecord) => void;
  onAdd: () => void;
  refreshTrigger: number;
}

const AttendanceList = ({ onEdit, onAdd, refreshTrigger }: AttendanceListProps) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAttendance();
  }, [refreshTrigger, searchTerm, dateFilter, currentPage]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          employee:employees(first_name, last_name),
          job_site:job_sites(name)
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`employee.first_name.ilike.%${searchTerm}%,employee.last_name.ilike.%${searchTerm}%,job_site.name.ilike.%${searchTerm}%`);
      }

      if (dateFilter) {
        query = query.eq('date', dateFilter);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      setAttendance(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: any) {
      toast({
        title: 'Error fetching attendance',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Attendance record deleted successfully' });
      fetchAttendance();
    } catch (error: any) {
      toast({
        title: 'Error deleting attendance record',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading attendance records...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Attendance Records</CardTitle>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Record Attendance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by employee or job site..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-8 w-40"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Job Site</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Deduct (min)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.employee.first_name} {record.employee.last_name}
                  </TableCell>
                  <TableCell>{record.job_site.name}</TableCell>
                  <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{record.start_time}</TableCell>
                  <TableCell>{record.end_time}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {record.shift_hours} hrs
                    </Badge>
                  </TableCell>
                  <TableCell>{record.minute_deduct}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {attendance.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No attendance records found.
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

export default AttendanceList;
