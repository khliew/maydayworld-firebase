import { AlbumType } from './AlbumType';
import Title from './Title';
import Track from './Track';

export default interface Album {
  id: string;
  type: AlbumType;
  title: Title;
  releaseDate: string;
  disabled: boolean;
  songs: { [track: number]: Track };
}
