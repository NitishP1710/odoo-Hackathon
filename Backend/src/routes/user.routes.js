import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// router.post("/register", registerUser);
router.route("/register").post(
  upload.fields([
    {
      name: "avatar", // ✅ corrected spelling
      maxCount: 1,
    },
    {
      name: "coverImage", // ✅ lowercase "c"
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

  

//secured routes
router.route("/logout").post(verifyJWT,logoutUser);

export default router;
