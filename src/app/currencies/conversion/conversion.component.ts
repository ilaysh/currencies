import { Component, OnInit, inject } from '@angular/core';
import { ConversionService } from '../conversion.service';
import { currencyConversion } from './conversion';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AbsNumPipe } from '../../abs-num.pipe';

@Component({
  selector: 'app-conversion',
  standalone: true,
  imports: [CommonModule, FormsModule, AbsNumPipe],
  templateUrl: './conversion.component.html',
  styleUrl: './conversion.component.less'
})
export class ConversionComponent implements OnInit {
  private service = inject(ConversionService);

  inputExpression: string = '';
  targetCurrency: string = '';
  result: string = '';
  availableCurrencies: string[] = ['USD', 'EUR', 'ILS', 'GBP', 'AUD', 'CAD'];
  updatedTo: string = '';
  conversions: currencyConversion[] = [];
  errorMessage = '';
  isConverting: boolean = false;
  rateDate: string = '';

  ngOnInit(): void {
    // this.service.getCurrencies().subscribe({
    //   next: (list) => this.availableCurrencies = list, error: (err) => {
    //     console.log('err', err);
    //     alert('Failed to get currencies');
    //   }
    // });
  }

  private validateTargetCurrency(currency: string): boolean {
    return !!currency && this.availableCurrencies.includes(currency.toUpperCase());
  }


  show() {
    // basic input validation
    this.errorMessage = '';
    if (!this.service.validateExpression(this.inputExpression))
      this.errorMessage = 'This expression is invalid';

    const list = this.service.getConversions(this.inputExpression);
    const invalidCurrencies = list.filter((x) => this.validateTargetCurrency(x.currency) == false)
    if (invalidCurrencies.length)
      this.errorMessage = "Some currencies are not supported";

    if (this.errorMessage)
      return;

    this.conversions = list;
  }


  convert() {
    this.errorMessage = '';
    if (!this.validateTargetCurrency(this.targetCurrency.toUpperCase())) {
      this.errorMessage = 'This currency is currently not supported';
      return;
    }

    this.isConverting = true;
    this.service.convertCurrencies(this.conversions, this.targetCurrency).subscribe({
      next: (res) => {
        this.result = res.toFixed(2);
        this.isConverting = false;
        this.rateDate = this.service.getLastUpdatedRates();
      }, error: (err) => {
        this.errorMessage = err;
        this.isConverting = false;
      }
    })
    // this.conversions = this.convertCurrencies(this.inputExpression, this.targetCurrency, this.exchangeRates);
    // this.result = this.conversions.reduce((acc, conv) => acc + conv.convertedAmount, 0);
  }


  generateRandom() {
    const randomOperations = ['+', '-',];
    const maxCurrencies = this.availableCurrencies.length <= 5 ? this.availableCurrencies.length : 5;
    const randomCurrencies = this.availableCurrencies.slice(0, maxCurrencies);

    let expression = '';
    for (let i = 0; i < 3; i++) {
      const randomAmount = (Math.random() * 100).toFixed();
      const randomCurrency = randomCurrencies[Math.floor(Math.random() * randomCurrencies.length)];
      const randomOperation = randomOperations[Math.floor(Math.random() * randomOperations.length)];

      expression += `${randomAmount}${randomCurrency} `;
      if (i < 2) {
        expression += `${randomOperation} `;
      }
    }
    this.resetDisplay();
    this.inputExpression = expression.trim();
  }

  private resetDisplay(): void {
    this.errorMessage = '';
    this.conversions = [];
    this.result = '';
  }
  //   private getExchangeRates(base: string): Observable<{ [key: string]: number }> {
  //     const apiKey = 'YOUR_API_KEY';
  //     const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;
  //     return this.http.get<any>(url).pipe(
  //       map(response => response.conversion_rates)
  //     );
  //   }

  //   private extractBaseCurrency(): string {
  //     const regex = /([A-Z]{3})/g;
  //     const matches = this.inputExpression.match(regex);
  //     return matches ? matches[0] : 'USD';
  //   }

  //   private parseExpression(expression: string): CurrencyConversion[] {
  //     const regex = /([+-]?\s*\d+[A-Z]{3})/g;
  //     const matches = Array.from(expression.matchAll(regex));

  //     return matches.map((match, index) => {
  //       const amount = parseFloat(match[0].replace(/[^\d.-]/g, ''));
  //       const currency = match[0].replace(/[^A-Z]/g, '');
  //       const operation = index > 0 ? expression.match(/[+\-*/]/g)?.[index - 1] : '';

  //       return {
  //         amount,
  //         currency,
  //         convertedAmount: 0,
  //         operation
  //       };
  //     });
  //   }





}