export interface currencyConversion {
    amount: number;
    currency: string;
    amountConverted: number;
    operation?: string;
}

export type knownCurrencies = 'ILS|EUR|GBR|USD';

export interface rateList {
    lastUpdate: number;
    rateList: string[];
}