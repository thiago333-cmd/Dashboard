import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { CashFlowData, InsertCashFlowData } from "@shared/schema";

export function useCashFlowData() {
  return useQuery({
    queryKey: ['/api/cash-flow-data'],
    queryFn: async () => {
      const response = await fetch('/api/cash-flow-data');
      if (!response.ok) {
        throw new Error('Failed to fetch cash flow data');
      }
      return response.json() as Promise<CashFlowData>;
    }
  });
}

export function useUpdateCashFlowData() {
  return useMutation({
    mutationFn: async (data: Partial<InsertCashFlowData>) => {
      const response = await fetch('/api/cash-flow-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update cash flow data');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/cash-flow-data']
      });
    }
  });
}

export function calculateTotalExpensesCosts(expensesData: string, costsData: string): number {
  try {
    const expenses = JSON.parse(expensesData || '{}');
    const costs = JSON.parse(costsData || '{}');
    
    const expensesTotal = Object.values(expenses).reduce((sum: number, value: any) => {
      return sum + (parseFloat(value) || 0);
    }, 0);
    
    const costsTotal = Object.values(costs).reduce((sum: number, value: any) => {
      return sum + (parseFloat(value) || 0);
    }, 0);
    
    return expensesTotal + costsTotal;
  } catch {
    return 0;
  }
}

export function formatCashFlowCurrency(amount: string | number, currency: string = 'USD'): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) return '0';
  
  const currencyConfig = {
    'USD Dollar': { code: 'USD', symbol: '$' },
    'EUR Euro': { code: 'EUR', symbol: '€' },
    'BRL Real': { code: 'BRL', symbol: 'R$' },
    'GBP Pound': { code: 'GBP', symbol: '£' },
    'JPY Yen': { code: 'JPY', symbol: '¥' }
  };
  
  const config = currencyConfig[currency as keyof typeof currencyConfig] || currencyConfig['USD Dollar'];
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
}