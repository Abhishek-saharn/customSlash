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
    let workstatus = {
        "sapna": "working from home",
        "abhishek": "onsite",
        "devesh": "offsite",
        "vinay": "day off",
    }
    let attachmentsURLs = {
        "working from home": "https://ichef-1.bbci.co.uk/news/660/media/images/75292000/jpg/_75292103_80410876.jpg",
        "onsite": "https://tr2.cbsistatic.com/hub/i/r/2015/02/03/ae3b8050-af60-440b-a397-ac6061d06166/resize/770x/d88a5e21c251cf863d59417739ef7f37/officeworkersistock000044385306small.jpg",
        "offsite": "https://img.etimg.com/thumb/msid-35402653,width-300,imglength-37812,resizemode-4/indian-technology-firms-sending-fewer-employees-overseas-due-to-cost-pressure.jpg",
        "day off": "http://lipstickchica.com/wp-content/uploads/2016/09/day-off.jpg",

    }
    // console.log("inside jdkfsjkdhkdshfkhdskfh")
    let text = req.body.text;

    if (/^\d+$/.test(text)) {
        res.send('U R DOIN IT WRONG. Enter a text not a number.');
        return;
    }
    status = workstatus[text];
    let data = {
        response_type: 'in_channel', // public to the channel 
        text: `${text} is ${status}`,
        attachments: [{

            image_url: `${attachmentsURLs[status]}`
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
                        res.json({
                            "status": "Success"
                        })
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