// id string pk
//   owner ObjectId users
//   videoFile string
//   thumbnail string
//   title string
//   description string
//   duration number
//   views number
//   isPublished boolean
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
mongooseAggregatePaginate


const VideoSchema = new Schema({
        videoFile : {
            type : String, // cloudnary URL
            required : true
        },
        thumbnail : {
            type : String, // cloudnary URL
            required : true
        },
        title : {
            type : String,
            required : true
        },
        description : {
            type : String,
            required : true
        },
        views : {
            type : Number,
            default : 0
        },
        isPublished : {
            type : Boolean,
            default : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    }, 
    { timestamps : true}
)

VideoSchema.plugin(mongooseAggregatePaginate)


export const Video = mongoose.model("Video", VideoSchema)