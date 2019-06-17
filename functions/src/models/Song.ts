import Line from './Line';
import Title from './Title';

export default interface Song {
  id: string;
  title: Title;
  lyricist: string;
  composer: string;
  arranger: string;
  disabled: boolean;
  lyrics: Line[];
}
