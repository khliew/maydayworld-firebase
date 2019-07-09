import Title from "./Title";

export default interface Track {
  id: string;
  title: Title;
  disabled?: boolean;
}
