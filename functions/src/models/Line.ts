export default interface Line {
  type: 'lyric' | 'break' | 'text';
  text?: string;
  zht?: string;
  zhp?: string;
  eng?: string;
}
