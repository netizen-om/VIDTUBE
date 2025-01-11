import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    console.log(content);
    
    console.log(req.user._id)
    const tweet = await Tweet.create({
        content,
        owner : req.user._id
    })

    return res
            .status(201)
            .json(new ApiResponse("Tweet created successfully", tweet))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const user = req.user._id

    const tweets = await Tweet.find({owner: user._id})

    return res
            .status(200)
            .json(new ApiResponse("Tweets fetched successfully", tweets))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {id} = req.params
    const {content} = req.body

    if(!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(id)

    if(!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    tweet.content = content
    await tweet.save()

    return res
            .status(200)
            .json(new ApiResponse("Tweet updated successfully", tweet))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {id} = req.params

    const deletedTweet = await Tweet.findByIdAndDelete(id)

    return res
            .status(200)
            .json(new ApiResponse("Tweet deleted successfully", deletedTweet))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}