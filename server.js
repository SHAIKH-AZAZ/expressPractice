import app from "./src/app.js"
import { configDotenv } from "dotenv"
import connectDB from "./src/config/db.js"


configDotenv()

connectDB()
app.listen(3000, () => {
    console.log(`Making connection to DB`)
    console.log(`Server is running on PORT : ${3000}`)
})
