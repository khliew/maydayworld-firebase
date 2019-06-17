import Title from './Title';

export default interface AlbumMetadata {
  id: string;
  title: Title;
  releaseDate: string;
  disabled?: boolean;
}
