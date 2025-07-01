
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

interface RateCard {
  id: string;
  employee_id: string;
  valid_from: string;
  valid_to: string | null;
  regular_pay_rate: number;
  overtime_pay_rate: number;
  employee: {
    first_name: string;
    last_name: string;
  };
}

interface RateCardListProps {
  onEdit: (rateCard: RateCard) => void;
  onAdd: () => void;
  refreshTrigger: number;
}

const RateCardList = ({ onEdit, onAdd, refreshTrigger }: RateCardListProps) => {
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRateCards();
  }, [refreshTrigger, searchTerm, currentPage]);

  const fetchRateCards = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('rate_cards')
        .select(`
          *,
          employee:employees(first_name, last_name)
        `)
        .order('valid_from', { ascending: false });

      if (searchTerm) {
        query = query.or(`employee.first_name.ilike.%${searchTerm}%,employee.last_name.ilike.%${searchTerm}%`);
      }

      const { data, error, count } = await query
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;

      setRateCards(data || []);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    } catch (error: any) {
      toast({
        title: 'Error fetching rate cards',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate card?')) return;

    try {
      const { error } = await supabase
        .from('rate_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Rate card deleted successfully' });
      fetchRateCards();
    } catch (error: any) {
      toast({
        title: 'Error deleting rate card',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const isActive = (rateCard: RateCard) => {
    const today = new Date();
    const validFrom = new Date(rateCard.valid_from);
    const validTo = rateCard.valid_to ? new Date(rateCard.valid_to) : null;
    
    return today >= validFrom && (!validTo || today <= validTo);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">Loading rate cards...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Rate Cards</CardTitle>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Create Rate Card
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
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rateCards.map((rateCard) => (
                <TableRow key={rateCard.id}>
                  <TableCell>
                    {rateCard.employee.first_name} {rateCard.employee.last_name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(rateCard.valid_from), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    {rateCard.valid_to 
                      ? format(new Date(rateCard.valid_to), 'MMM dd, yyyy')
                      : 'Ongoing'
                    }
                  </TableCell>
                  <TableCell>${rateCard.regular_pay_rate.toFixed(2)}</TableCell>
                  <TableCell>${rateCard.overtime_pay_rate.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={isActive(rateCard) ? "default" : "secondary"}>
                      {isActive(rateCard) ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(rateCard)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rateCard.id)}
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

        {rateCards.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No rate cards found.
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
