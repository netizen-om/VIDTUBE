import { Router } from "express";
import { 
  registerUser,
  logOutUser,
  loginUser,
  refreshAccessToken, 
  changeCurrentPassword,
  getCurentUser,
  getUserChannelProfile,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getWatchHistory
  } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser)
router.route("/refresh-token").post(refreshAccessToken)

//User secured routes
router.route("/logout").post(verifyJWT ,logOutUser )
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT ,getCurentUser )
router.route("/c/:username").get(verifyJWT ,getUserChannelProfile )
router.route("/update-account").patch(verifyJWT ,updateAccountDetails )
router.route("/history").get(verifyJWT , getWatchHistory)

router.route("/avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)
router.route("/coverImage").patch(verifyJWT , upload.single("coverImage") , updateUserCoverImage)

export default router;
