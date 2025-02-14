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
    if(isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel ID is not valid")
    }
    
    const isSub = await Subscription.findOne({ 
        subscriber : req.user?._id,
        channel : channelId 
    })
    
    if(isSub) {
        const toggleStatus = await Subscription.findByIdAndDelete(channelId)
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