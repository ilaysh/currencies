
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { currencyConversion } from './conversion/conversion';

@Injectable({
  providedIn: 'root'
})
export class ConversionService {
  // private http = Inject(HttpClient);
  private baseUrl: string = '';
  private exchangeRates: { [key: string]: number } = {};
  private currencyList: string[] = [];
  private apiVersion = 'v4';// todo: move to environment;
  private cacheKey = '';
  private lastUpdated: Date | null = null;

  constructor(private http: HttpClient) {
    this.baseUrl = `${environment.apiBaseUrl}/latest`;
    this.cacheKey = 'currencyList_' + this.apiVersion;
  }

  // todo: make async?
  /**
   * this will change the expression to object for better management
   * @param expression 
   * @returns {currencyConversion[]} 
   */
  getConversions(expression: string): currencyConversion[] {
    const regex = /([+-]?\s*\d+[A-Z]{3})/g;
    const matches = Array.from(expression.matchAll(regex));

    return matches.map((match, index) => {
      const amount = parseFloat(match[0].replace(/[^\d.-]/g, ''));
      const currency = match[0].replace(/[^A-Z]/g, '');
      const operation = index > 0 ? expression.match(/[+\-*/]/g)?.[index - 1] : '';
      return {
        amount,
        currency,
        amountConverted: 0,
        operation
      };
    });
  }

  public getLastUpdatedRates(): string {
    return this.lastUpdated ? this.lastUpdated.toString() : '';

  }
  private getCachedCurrencies(): ratesDetails | null {
    var list = localStorage.getItem(this.cacheKey);
    if (list)
      return JSON.parse(list);

    return null;
  }


  validateExpression(input: string): boolean {
    const regex = /^(\d+[A-Z]{3})(\s*[+\-*/]\s*\d+[A-Z]{3})*$/;
    return regex.test(input);
  }

  // get real list of currencies
  getCurrencies(): Observable<string[]> {
    // cache to prevent exceed api rate limit
    if (!this.currencyList.length) {
      const rates = this.getCachedCurrencies();
      if (rates && rates.lastUpdated > 0)
        if (new Date(rates.nextUpdate * 1000) >= new Date()) {
          this.exchangeRates = rates.exchangeRates;
          this.currencyList = Object.keys(rates);
          this.lastUpdated = new Date(rates.lastUpdated*1000);
        }
    }

    if (this.currencyList.length)
      return of(this.currencyList);

    return this.http.get<any>(`${this.baseUrl}`)
      .pipe(
        map(res => {

          const rateData: ratesDetails = {
            exchangeRates: res.rates,
            nextUpdate: res.time_next_update_unix,
            lastUpdated: res.time_last_update_unix
          }
          localStorage.setItem(this.cacheKey, JSON.stringify(rateData));
          this.lastUpdated = new Date(rateData.lastUpdated*1000);
          this.exchangeRates = rateData.exchangeRates;
          this.currencyList = Object.keys(this.exchangeRates);
          return this.currencyList;
        }))
  }


  convertCurrencies(conversionList: currencyConversion[], targetCurrency: string): Observable<number> {
    return this.getCurrencies().pipe(map(data => {
      const conversions = this.convert(conversionList, targetCurrency);
      const result = conversions.reduce((acc, conv) => acc + conv.amountConverted, 0);
      // base conversion is in usd
      if (targetCurrency == 'USD')
        return result;

      return this.converAmount(result, targetCurrency);
    }))
  }

  private convert(conversionList: currencyConversion[], targetCurrency: string): currencyConversion[] {
    return conversionList.map((cl, index) => {
      const convertedAmount = cl.currency == targetCurrency ? cl.amount : this.converAmount(cl.amount, cl.currency);
      cl.amountConverted = convertedAmount;
      return cl;
    });
  }


  private converAmount(amount: number, currency: string): number {
    const rate = this.exchangeRates[currency] || 0;
    const convertedAmount = !currency ? amount : parseFloat((amount / rate).toFixed(2));
    return convertedAmount;
  }


  // tomer likes batch process i guess
  // this was my initial thought : to make api call for each rate in destionation rate
  // and concate the results but i didn't want the rate limit to hit 

  //   private getExchangeRate(from: string, to: string): Observable < number > {
  //   return this.http.get<any>(`${this.baseUrl}/${from}`).pipe(
  //     map(response => response.rates[to])
  //   );
  // }

  //   private convertCurrencies(expression: string, targetCurrency: string): Observable < number > {
  //   const regex = /(\d+)([A-Z]{3})/g;
  //   const matches = expression.matchAll(regex);

  //   const observables: Observable<number>[] = [];

  //   for(const match of matches) {
  //     const amount = parseFloat(match[1]);
  //     const currency = match[2];
  //     observables.push(this.getExchangeRate(currency, targetCurrency).pipe(
  //       map(rate => {
  //         if (expression.includes(`-${match[0]}`)) {
  //           return -amount * rate;
  //         }
  //         return amount * rate;
  //       })
  //     ));
  //   }

  //     return new Observable<number>(observer => {
  //     let total = 0;
  //     let completedRequests = 0;

  //     for (const observable of observables) {
  //       observable.subscribe({
  //         next: value => total += value,
  //         complete: () => {
  //           completedRequests++;
  //           if (completedRequests === observables.length) {
  //             observer.next(total);
  //             observer.complete();
  //           }
  //         },
  //         error: err => observer.error(err)
  //       });
  //     }
  //   });
  // }
}


export interface ratesDetails {
  lastUpdated: number;
  nextUpdate: number;
  exchangeRates: { [key: string]: number };
}