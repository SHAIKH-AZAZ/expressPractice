import mongoose from "mongoose";
import { configDotenv } from "dotenv";
configDotenv()

const connectDB = () => {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log(`Server is connection to DB`)

    })
    .catch(err => {
      console.log(`Error ${err}`)
      process.exit(1)
    })
}
export default connectDB;
