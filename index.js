"use strict"
const request = require('request')
const express = require("express")
const bodyParser = require("body-parser")
const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))


app.get('/index', (req, res) => {
    res.sendFile(`${process.env.PWD}/index.html`);
    // res.json({"df":"sfsdf"});
})

app.post('/', (req, res) => {
    let status = "working from home";
    console.log("inside jdkfsjkdhkdshfkhdskfh")
    let text = req.body.text;

    if (/^\d+$/.test(text)) {
        res.send('U R DOIN IT WRONG. Enter a text not a number.');
        return;
    }
    let data = {
        response_type: 'in_channel', // public to the channel 
        text: `${text} is ${status}`,
        attachments: [{
            image_url: 'https://http.cat/302.jpg'
        }]
    };

    res.json(data);

});


app.get('/slack', function (req, res) {
    if (!req.query.code) { // access denied
        res.redirect('/index');
        return;
    }



    let data = {
        form: {
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            code: req.query.code
        }
    };

    console.log(">>>>>>><<<<<<<<<<<", data)
    request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Get an auth token
            let token = JSON.parse(body).access_token;

            // Get the team domain name to redirect to the team URL after auth
            request.post('https://slack.com/api/team.info', {
                form: {
                    token: token
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    if (JSON.parse(body).error == 'missing_scope') {
                        res.send('Bot added');
                    } else {
                        console.log(JSON.parse(body))
                        res.json({"status":"Success"})
                        // let team = JSON.parse(body).team.domain;
                        // res.redirect('http://' + team + '.slack.com');
                    }
                }
            });
        }
    })
});


app.listen(process.env.PORT || 8000, () => {
    console.log("server Listening at", process.env.PORT || 8000)
})