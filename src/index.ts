import express from "express"
import dotenv from "dotenv"
const app = express()
app.use(express.json())

const PORT = 8000 || process.env.PORT

app.listen(PORT , () => {
    console.log(`Server is running on port ${PORT}`)
})

