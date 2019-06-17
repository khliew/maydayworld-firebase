import Album from './Album';
import AlbumType from './AlbumType';

export default interface Discography {
  id: string;
  sections: [
    {
      type: AlbumType;
      label: string;
      albums: Album[];
    }
  ];
}
