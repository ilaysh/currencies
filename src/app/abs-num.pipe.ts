import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'absNum',
  standalone: true
})
export class AbsNumPipe implements PipeTransform {
  transform(value: number): number { 
    return Math.abs(value);
  }
}
