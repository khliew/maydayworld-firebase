import Album from './Album';
import AlbumType from './AlbumType';

export default interface Discography {
  artistId: string;
  sections: [
    {
      type: AlbumType;
      label: string;
      albums: Album[];
    }
  ];
}
