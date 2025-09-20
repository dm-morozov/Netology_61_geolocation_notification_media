// src/ts/Post.ts

export type PostType = "text" | "audio" | "video";

export interface Coords {
  latitude: number;
  longitude: number;
}

export default class Post {
  constructor(
    public type: PostType,
    public content: string,
    public coords: Coords | null,
    public timestamp: number = Date.now(),
  ) {}
}
