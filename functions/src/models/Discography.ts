import Album from './Album';

export default interface Discography {
  artistId: string;
  sections: [
    {
      type: 'studio' | 'compilation' | 'ep' | 'other';
      label: string;
      albums: Album[];
    }
  ];
}
