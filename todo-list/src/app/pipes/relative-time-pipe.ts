import { Pipe, PipeTransform } from '@angular/core';

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_536_000],
  ['month', 2_592_000],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** Affiche une date ISO sous forme relative : « il y a 5 minutes », « hier »… */
@Pipe({
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {
  private readonly formatter = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' });

  transform(value: string | undefined): string {
    if (!value) return '';
    const seconds = (new Date(value).getTime() - Date.now()) / 1000;
    if (Number.isNaN(seconds)) return '';

    for (const [unit, size] of UNITS) {
      if (Math.abs(seconds) >= size) {
        return this.formatter.format(Math.round(seconds / size), unit);
      }
    }
    return "à l'instant";
  }
}
