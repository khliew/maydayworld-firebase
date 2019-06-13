import Song from './Song';

export default interface Album {
  albumId: string;
  type: 'studio' | 'compilation' | 'ep' | 'other';
  title: {
    chinese: {
      zht: string;
      zhp: string;
      eng: string;
    };
    english: string;
  };
  releaseDate?: string;
  disable: boolean;
  songIds: string[];
  songs: Song[];
}
