import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import postRoutes from './routes/posts.routes.js'
import userRoutes from './routes/user.routes.js'

dotenv.config()

const app = express();

app.use(cors())
app.use(express.json())
app.use(express.static("uploads"))

//routes use
app.use(userRoutes)
app.use(postRoutes)

const start = async () => {
    mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Database Connected!'))
  .catch((err) => console.log(err))

  app.listen(8080, () => {
     console.log("Server is listining to the port 8080}")
  })
}

start()