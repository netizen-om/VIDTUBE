import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.models.js"
import {ApiError} from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!channelId) {
        throw new ApiError(404, "Channel ID not found")
    }
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel ID is not valid")
    }
    
    const isSub = await Subscription.findOne({ 
        subscriber : req.user?._id,
        channel : channelId 
    })
    
    if(isSub) {
        const toggleStatus = await Subscription.findOneAndDelete({ subscriber: req.user?._id, channel: channelId });

        if(!toggleStatus) {
            throw new ApiError(400, "unable to toggle Subscription")
        }
        return res
                .status(200)
                .json(new ApiResponse(200, toggleStatus, "Subscription toggled"))
    } else {
        const toggleStatus = await Subscription.create({
            subscriber : req.user?._id,
            channel : channelId 
        })

        if(!toggleStatus) {
            throw new ApiError(400, "unable to toggle Subscription")
        }

        return res
                .status(200)
                .json(new ApiResponse(200, toggleStatus, "Subscription toggled"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!channelId) {
        throw new ApiError(404, "Channel ID not found")
    }
    if(!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel ID is not valid")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) } // Match channel ID correctly
        },
        {
            $lookup: {
                from: "users", // Collection name of referenced users
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberInfo"
            }
        },
        {
            $group: {
                _id: "$channel", // Group by channelId
                totalSubscribers: { $sum: 1 }, // Count number of subscribers
                subscribers: { $push: "$subscriberInfo" } // Collect subscriber details
            }
        },
        {
            $project: {
                _id: 0,
                channelId: "$_id",
                totalSubscribers: 1,
                subscribers: {
                    _id: 1,
                    name: 1,
                    email: 1
                }
            }
        }
    ]);
    
    return res
            .status(200)
            .json(new ApiResponse(200, subscribers[0] || { channelId, totalSubscribers: 0, subscribers: [] }, "Subscriber list fetched"));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}