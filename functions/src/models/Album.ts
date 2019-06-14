import Song from './Song';
import Title from './Title';
import AlbumType from './AlbumType';

export default interface Album {
  albumId: string;
  type: AlbumType;
  title: Title;
  releaseDate: string;
  disabled: boolean;
  songs: { [track: number]: Song };
}
