import request from 'request'
import express from "express"
import bodyParser from "body-parser"

import router from './routes/main.routes'


const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(router);

app.listen(process.env.PORT || 8000, () => {
    console.log("server Listening at", process.env.PORT || 8000)
})