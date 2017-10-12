const request = require('request')
const express = require("express")
const bodyParser = require("body-parser")

const main = require('./routes/main.routes')


const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(main);

app.listen(process.env.PORT || 8000, () => {
    console.log("server Listening at", process.env.PORT || 8000)
})