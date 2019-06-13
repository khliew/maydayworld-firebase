import Line from './Line';

export default interface Song {
  songId: string;
  title: {
    chinese: {
      zht: string;
      zhp: string;
      eng: string;
    };
    english: string;
  };
  lyricist: string;
  composer: string;
  arranger: string;
  disabled: boolean;
  lyrics: Line[];
}
