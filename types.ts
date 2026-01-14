
export interface PlaceResult {
  title: string;
  uri: string;
  description?: string;
  snippets?: string[];
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export enum Category {
  RESTAURANT = "စားသောက်ဆိုင်",
  HOTEL = "ဟိုတယ်/တည်းခိုခန်း",
  HOSPITAL = "ဆေးရုံ/ဆေးခန်း",
  LANDMARK = "အထင်ကရနေရာ",
  ATM = "ATM/ဘဏ်"
}
