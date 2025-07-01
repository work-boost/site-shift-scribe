
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const rateCardSchema = z.object({
  employee_id: z.string().min(1, 'Employee is required'),
  valid_from: z.date(),
  valid_to: z.date().optional(),
  regular_pay_rate: z.number().min(0, 'Regular pay rate must be positive'),
  overtime_pay_rate: z.number().min(0, 'Overtime pay rate must be positive'),
});

type RateCardFormData = z.infer<typeof rateCardSchema>;

interface RateCardFormProps {
  rateCard?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const RateCardForm = ({ rateCard, onSuccess, onCancel }: RateCardFormProps) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RateCardFormData>({
    resolver: zodResolver(rateCardSchema),
    defaultValues: rateCard ? {
      ...rateCard,
      valid_from: rateCard.valid_from ? new Date(rateCard.valid_from) : new Date(),
      valid_to: rateCard.valid_to ? new Date(rateCard.valid_to) : undefined,
    } : {
      valid_from: new Date(),
      regular_pay_rate: 0,
      overtime_pay_rate: 0,
    },
  });

  const watchedValidFrom = watch('valid_from');
  const watchedValidTo = watch('valid_to');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name')
        .order('last_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: 'Error fetching employees',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: RateCardFormData) => {
    setLoading(true);
    try {
      const rateCardData = {
        employee_id: data.employee_id,
        valid_from: format(data.valid_from, 'yyyy-MM-dd'),
        valid_to: data.valid_to ? format(data.valid_to, 'yyyy-MM-dd') : null,
        regular_pay_rate: data.regular_pay_rate,
        overtime_pay_rate: data.overtime_pay_rate,
      };

      if (rateCard) {
        const { error } = await supabase
          .from('rate_cards')
          .update(rateCardData)
          .eq('id', rateCard.id);

        if (error) throw error;
        toast({ title: 'Rate card updated successfully' });
      } else {
        const { error } = await supabase
          .from('rate_cards')
          .insert([rateCardData]);

        if (error) throw error;
        toast({ title: 'Rate card created successfully' });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{rateCard ? 'Edit Rate Card' : 'Create Rate Card'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="employee_id">Employee</Label>
            <Select
              onValueChange={(value) => setValue('employee_id', value)}
              defaultValue={rateCard?.employee_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.first_name} {employee.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee_id && (
              <p className="text-sm text-red-500">{errors.employee_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Valid From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedValidFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedValidFrom ? format(watchedValidFrom, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedValidFrom}
                    onSelect={(date) => setValue('valid_from', date || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Valid To (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedValidTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedValidTo ? format(watchedValidTo, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedValidTo}
                    onSelect={(date) => setValue('valid_to', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="regular_pay_rate">Regular Pay Rate ($)</Label>
              <Input
                id="regular_pay_rate"
                type="number"
                step="0.01"
                min="0"
                {...register('regular_pay_rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.regular_pay_rate && (
                <p className="text-sm text-red-500">{errors.regular_pay_rate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="overtime_pay_rate">Overtime Pay Rate ($)</Label>
              <Input
                id="overtime_pay_rate"
                type="number"
                step="0.01"
                min="0"
                {...register('overtime_pay_rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.overtime_pay_rate && (
                <p className="text-sm text-red-500">{errors.overtime_pay_rate.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : rateCard ? 'Update Rate Card' : 'Create Rate Card'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RateCardForm;
