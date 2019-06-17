import Title from './Title';
import AlbumType from './AlbumType';
import SongMetadata from './SongMetadata';

export default interface Album {
  id: string;
  type: AlbumType;
  title: Title;
  releaseDate: string;
  disabled: boolean;
  songs: { [track: number]: SongMetadata };
}
