import { Pipe, PipeTransform } from '@angular/core';

// Artist names pipe
@Pipe({name: 'artistNames'})
export class ArtistNamesPipe implements PipeTransform {
  transform(artists: any[]): string {
    return artists.map(a => a.name).join(', ');
  }
}
