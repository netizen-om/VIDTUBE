import { Router } from "express";
import { createTweet } from "../controllers/tweet.controller.js";


const router = Router()

router.route("/create").post(createTweet)


export default router