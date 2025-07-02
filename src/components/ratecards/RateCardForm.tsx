
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

const rateCardSchema = z.object({
  regular_rate: z.number().min(0, 'Regular rate must be positive'),
  overtime_rate: z.number().min(0, 'Overtime rate must be positive'),
});

type RateCardFormData = z.infer<typeof rateCardSchema>;

interface RateCardFormProps {
  rateCard?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

const RateCardForm = ({ rateCard, onSuccess, onCancel }: RateCardFormProps) => {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RateCardFormData>({
    resolver: zodResolver(rateCardSchema),
    defaultValues: rateCard ? {
      regular_rate: rateCard.regular_rate || 0,
      overtime_rate: rateCard.overtime_rate || 0,
    } : {
      regular_rate: 0,
      overtime_rate: 0,
    },
  });

  const onSubmit = async (data: RateCardFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          regular_rate: data.regular_rate,
          overtime_rate: data.overtime_rate,
        })
        .eq('id', rateCard.id);

      if (error) throw error;
      toast({ title: 'Employee rates updated successfully' });
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
        <CardTitle>
          Edit Rates - {rateCard?.first_name} {rateCard?.last_name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="regular_rate">Regular Rate ($/hour)</Label>
              <Input
                id="regular_rate"
                type="number"
                step="0.01"
                min="0"
                {...register('regular_rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.regular_rate && (
                <p className="text-sm text-red-500">{errors.regular_rate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="overtime_rate">Overtime Rate ($/hour)</Label>
              <Input
                id="overtime_rate"
                type="number"
                step="0.01"
                min="0"
                {...register('overtime_rate', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.overtime_rate && (
                <p className="text-sm text-red-500">{errors.overtime_rate.message}</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Pay Calculation (Based on 8 hours)</h4>
            <p className="text-sm text-gray-600">
              • First 4 hours: Regular rate
              • Hours 5-8: Overtime rate
              • Total for 8 hours: ${((4 * (rateCard?.regular_rate || 0)) + (4 * (rateCard?.overtime_rate || 0))).toFixed(2)}
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Rates'}
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
