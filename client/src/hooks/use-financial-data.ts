import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { FinancialData, InsertFinancialData, UserSettings, InsertUserSettings } from "@shared/schema";

export function useFinancialData() {
  return useQuery<FinancialData>({
    queryKey: ["/api/financial-data"],
  });
}

export function useUpdateFinancialData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<InsertFinancialData>) => {
      const response = await apiRequest("PUT", "/api/financial-data", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/financial-data"] });
    },
  });
}

export function useUserSettings() {
  return useQuery<UserSettings>({
    queryKey: ["/api/user-settings"],
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (settings: Partial<InsertUserSettings>) => {
      const response = await apiRequest("PUT", "/api/user-settings", settings);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-settings"] });
    },
  });
}

// Financial calculations
export function calculateNetWorth(assets: string, liabilities: string): number {
  return parseFloat(assets || "0") - parseFloat(liabilities || "0");
}

export function calculateFinancialDegree(netWorth: number) {
  const degrees = [
    { level: 0, min: 0, max: 500000, label: "DEGREE 0", range: "$0 to $500K" },
    { level: 1, min: 500000, max: 1000000, label: "DEGREE 1", range: "$500K to $1M" },
    { level: 2, min: 1000000, max: 5000000, label: "DEGREE 2", range: "$1M to $5M" },
    { level: 3, min: 5000000, max: 10000000, label: "DEGREE 3", range: "$5M to $10M" },
    { level: 4, min: 10000000, max: 20000000, label: "DEGREE 4", range: "$10M to $20M" },
    { level: 5, min: 20000000, max: 50000000, label: "DEGREE 5", range: "$20M to $50M" },
    { level: 6, min: 50000000, max: 100000000, label: "DEGREE 6", range: "$50M to $100M" },
    { level: 7, min: 100000000, max: 1000000000, label: "DEGREE 7", range: "$100M to $1B" }
  ];

  // Start from highest degree and work down to find the correct level
  for (let i = degrees.length - 1; i >= 0; i--) {
    if (netWorth >= degrees[i].min) {
      return degrees[i];
    }
  }
  
  // If somehow less than 0, return the first degree
  return degrees[0];
}

export function calculateProgress(netWorth: number, currentDegree: any): number {
  const range = currentDegree.max - currentDegree.min;
  const progress = netWorth - currentDegree.min;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

export function formatCurrency(amount: string | number, currency: string = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  const currencyMap: { [key: string]: { code: string; locale: string } } = {
    'USD Dollar': { code: 'USD', locale: 'en-US' },
    'EUR Euro': { code: 'EUR', locale: 'de-DE' },
    'GBP Pound': { code: 'GBP', locale: 'en-GB' },
    'BRL Real': { code: 'BRL', locale: 'pt-BR' },
    'JPY Yen': { code: 'JPY', locale: 'ja-JP' },
    'CAD Dollar': { code: 'CAD', locale: 'en-CA' },
    'AUD Dollar': { code: 'AUD', locale: 'en-AU' },
    'CHF Franc': { code: 'CHF', locale: 'de-CH' },
  };
  
  const currencyInfo = currencyMap[currency] || currencyMap['USD Dollar'];
  
  return new Intl.NumberFormat(currencyInfo.locale, {
    style: 'currency',
    currency: currencyInfo.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function getNextMilestone(currentDegree: any): string {
  return formatCurrency(currentDegree.max);
}

export function calculatePercentageChange(current: string | number, previous: string | number): string {
  const currentVal = typeof current === 'string' ? parseFloat(current) : current;
  const previousVal = typeof previous === 'string' ? parseFloat(previous) : previous;
  
  if (previousVal === 0) return "+0.0%";
  
  const change = ((currentVal - previousVal) / previousVal) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}
