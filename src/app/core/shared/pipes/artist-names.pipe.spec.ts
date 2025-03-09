import { ArtistNamesPipe } from './artist-names.pipe';

describe('ArtistNamesPipe', () => {
  it('create an instance', () => {
    const pipe = new ArtistNamesPipe();
    expect(pipe).toBeTruthy();
  });
});
