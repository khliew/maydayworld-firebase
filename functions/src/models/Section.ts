import AlbumType from './AlbumType';
import AlbumMetadata from './AlbumMetadata';

export default interface Section {
  type: AlbumType;
  albums: AlbumMetadata[];
}
