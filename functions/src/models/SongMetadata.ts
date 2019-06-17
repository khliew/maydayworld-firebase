import Title from './Title';

export default interface SongMetadata {
  id: string;
  title: Title;
  disabled?: boolean;
}
