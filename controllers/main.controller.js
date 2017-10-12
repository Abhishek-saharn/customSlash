import workstatus from '../api/workStatus'
import attachmentsURLs from '../api/attachmentsURLs'
import request from 'request'

/**
 *  "index.html" contains a button that will let users authorize / commands. After clicking button an auth page 
 *    will be shown to user, that will redirect to route "/slack" this same route is also provided in slack app "Oauth" url .
 */


export const indexButton = (req, res) => {
    res.sendFile(`${process.env.PWD}/ui/index.html`);
}

export const slashHome = (req, res) => {


    let text = req.body.text;

    if (/^\d+$/.test(text)) {
        res.send('You are Enterning a number. Which is under development phase');
        return;
    }
    let status = workstatus[text];
    let data = {
        response_type: 'in_channel', // public to the channel 
        text: `${text} is ${status}`,
        attachments: [{

            image_url: `${attachmentsURLs[status]}`
        }]
    };

    res.json(data);
}

export const slackAuth = (req, res) => {
    if (!req.query.code) { // access denied. This will check whether its first time or not, if 1st time. Then redirect to /index. 
        res.redirect('/index');
        return;
    }


    /**
     *   If authenticated by user, HTTP request will be having a 'code' as query that can be stored.
     *   And the stored data will be exchanged with a token. 
     */
    let data = {
        form: {
            client_id: process.env.SLACK_CLIENT_ID,
            client_secret: process.env.SLACK_CLIENT_SECRET,
            code: req.query.code
        }
    };
    /**
     *  Below data is POSTed to the oauth.access and a token is then stored. 
     */
    request.post('https://slack.com/api/oauth.access', data, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Get an auth token
            let token = JSON.parse(body).access_token;
            console.log(">>>>>><<<<<<<<<<", process.env.SLACK_CLIENT_ID, ">>><<<<<", process.env.SLACK_CLIENT_SECRET, ">>><<<<<<", body);
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
                        res.json(JSON.parse(body))
                        // let team = JSON.parse(body).team.domain;
                        // res.redirect('http://' + team + '.slack.com');
                    }
                }
            });
        }
    });
}