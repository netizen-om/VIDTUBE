// id string pk
//   owner ObjectId users
//   videos ObjectId[] videos
//   name string
//   description string
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";

const PlaylistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
    ],
  },
  { timestamps: true }
);

export const Playlist = mongoose.model("Playlist" , PlaylistSchema)