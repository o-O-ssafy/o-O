export type MediaType = "image" | "youtube" | null;

export interface MediaData {
  type: MediaType;
  imageUrl?: string;
  imageFile?: File;
  youtubeUrl?: string;
}
