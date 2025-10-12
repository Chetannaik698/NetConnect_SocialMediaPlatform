import { Router } from "express";
import { activeCheck, commentlPost, createPost, delete_comment_of_user, deletelPost, get_comment_by_post, getAllPosts, increment_likes } from "../controllers/post.controller.js";
import multer from "multer";

const router = Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({ storage: storage })

router.get("/", activeCheck)
router.post("/post", upload.single('file'), createPost)
router.get("/posts", getAllPosts)
router.delete("/delete_post", deletelPost)
router.post("/comment", commentlPost)
router.get("/get_comments", get_comment_by_post)
router.delete("/delete_comment", delete_comment_of_user)
router.post("/increment_post_like", increment_likes)


export default router