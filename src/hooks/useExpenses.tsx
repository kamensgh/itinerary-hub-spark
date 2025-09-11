import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  created_at: string;
  itinerary_id: string;
}

export interface CreateExpenseData {
  name: string;
  amount: number;
}

export const useExpenses = (itineraryId: string) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itineraryId) {
      fetchExpenses();
    }
  }, [itineraryId]);

  const fetchExpenses = async () => {
    if (!itineraryId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('itinerary_id', itineraryId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData: CreateExpenseData) => {
    if (!itineraryId) return;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          ...expenseData,
          itinerary_id: itineraryId,
        })
        .select()
        .single();

      if (error) throw error;

      setExpenses([data, ...expenses]);
      toast({
        title: 'Success',
        description: 'Expense added successfully',
      });

      return data;
    } catch (error) {
      console.error('Error creating expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to add expense',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      setExpenses(expenses.filter(expense => expense.id !== expenseId));
      toast({
        title: 'Success',
        description: 'Expense deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete expense',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getTotalCost = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return {
    expenses,
    loading,
    createExpense,
    deleteExpense,
    getTotalCost,
    fetchExpenses,
  };
};