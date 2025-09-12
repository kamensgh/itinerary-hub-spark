import { useState, useEffect } from 'react';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  region: 'african' | 'non-african';
}

export const currencies: Currency[] = [
  // Top 5 African currencies
  { code: 'GHS', name: 'Ghana Cedi', symbol: '₵', region: 'african' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', region: 'african' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', region: 'african' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: '£', region: 'african' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', region: 'african' },
  
  // Top 5 non-African currencies
  { code: 'USD', name: 'US Dollar', symbol: '$', region: 'non-african' },
  { code: 'EUR', name: 'Euro', symbol: '€', region: 'non-african' },
  { code: 'GBP', name: 'British Pound', symbol: '£', region: 'non-african' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'non-african' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', region: 'non-african' },
];

export const useCurrency = () => {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(currencies[5]); // Default to USD

  useEffect(() => {
    const stored = localStorage.getItem('selectedCurrency');
    if (stored) {
      const currency = currencies.find(c => c.code === stored);
      if (currency) {
        setSelectedCurrency(currency);
      }
    }
  }, []);

  const updateCurrency = (currencyCode: string) => {
    const currency = currencies.find(c => c.code === currencyCode);
    if (currency) {
      setSelectedCurrency(currency);
      localStorage.setItem('selectedCurrency', currencyCode);
    }
  };

  const formatAmount = (amount: number) => {
    return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
  };

  const getAfricanCurrencies = () => currencies.filter(c => c.region === 'african');
  const getNonAfricanCurrencies = () => currencies.filter(c => c.region === 'non-african');

  return {
    selectedCurrency,
    updateCurrency,
    formatAmount,
    currencies,
    getAfricanCurrencies,
    getNonAfricanCurrencies,
  };
};