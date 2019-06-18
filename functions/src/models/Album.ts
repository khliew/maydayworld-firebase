import Title from './Title';
import SongMetadata from './SongMetadata';
import { AlbumType } from './AlbumType';

export default interface Album {
  id: string;
  type: AlbumType;
  title: Title;
  releaseDate: string;
  disabled: boolean;
  songs: { [track: number]: SongMetadata };
}
