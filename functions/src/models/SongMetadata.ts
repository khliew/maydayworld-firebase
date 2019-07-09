import Title from './Title';

export default interface SongMetadata {
  id: string;
  title: Title;
  lyricist: string;
  composer: string;
  arranger: string;
  disabled?: boolean;
}
