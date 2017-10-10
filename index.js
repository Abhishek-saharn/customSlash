"use strict"
const request = require('request')
const express = require("express")
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.json)
app.use(bodyParser.urlencoded({
    extended: true
}))




app.post('/', (req, res) => {
    let text = req.body.text;

    if (/^\d+$/.test(q.text)) {
        res.send('U R DOIN IT WRONG. Enter a text not a number.');
        return;
    }
    let data = {
        response_type: 'in_channel', // public to the channel 
        text: 'You have entered correct information',
        attachments: [{
            image_url: 'https://http.cat/302.jpg'
        }]
    };

    res.json(data);

});


const server = app.listen(process.env.PORT || 3000, () => {
    console.log("server Listening")
})