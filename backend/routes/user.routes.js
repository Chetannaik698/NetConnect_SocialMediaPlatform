import { Router } from "express";
import {
  acceptConnectionRequest,
  downloadProfile,
  getAllUserProfile,
  getMyConnectionsRequests,
  getUserAndProfile,
  getUserProfileAndUserBasedOnUsername,
  login,
  register,
  sendConnectionRequest,
  updateProfileData,
  updateUserProfile,
  uploadProfilPicture,
  whatAreMyConnections,
} from "../controllers/user.controller.js";
import multer from "multer";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/update_profile_picture",
  upload.single("profile_picture"),
  uploadProfilPicture
);

router.post("/register", register);
router.post("/login", login);
router.post("/user_update", updateUserProfile);
router.get("/get_user_and_profile", getUserAndProfile);
router.post("/update_profile_data", updateProfileData);

router.get("/get_all_users", getAllUserProfile);

router.get("/user/download_resume", downloadProfile);

//connections part
router.post("/user/send_connection_request", sendConnectionRequest);
router.get("/user/getConnectionRequests", getMyConnectionsRequests);
router.get("/user/user_connection_request", whatAreMyConnections);
router.get("/user/accept_connection_request", acceptConnectionRequest);
router.get(
  "/user/get_profile_based_on_username",
  getUserProfileAndUserBasedOnUsername
);

export default router;
