import workstatus from '../api/workStatus';
import attachmentsURLs from '../api/attachmentsURLs';
import request from 'request';
import querystring from 'querystring';
import geoip from 'geoip-lite';


import {
    displayMessage
} from '../utils/misc';

import Teams from '../models/Teams';

/**
 *  "index.html" contains a button that will let users authorize / commands. After clicking button an auth page 
 *    will be shown to user, that will redirect to route "/slack" this same route is also provided in slack app "Oauth" url .
 */

let gtoken = null;
export const indexButton = (req, res) => {
    res.sendFile(`${process.env.PWD}/ui/index.html`);
}

export const slashHome = (req, res) => {

    res.status(200).end();

    if (req.body.token != process.env.SLACK_VERIFICATION_TOKEN) {
        console.log(payloadjson.token, '<<<<<<>>>>>>>>>>>>IIIIIIIIIIIIIIFFFFFFFFFFFFFFFFFFFFF', process.env.SLACK_VERIFICATION_TOKEN);
        res.status(403).end("ACCESS FORBIDDEN");
    } else {

        const text = req.body.text;
        const team_id = req.body.team_id;
        const team_domain = req.body.team_domain;
        if (gtoken === null) {


            Teams.find(team_id).then(access_token => {
                gtoken = access_token;
            }).catch(error => {
                console.log(error);
            });


        }

        if (/^\d+$/.test(text)) {
            res.send('You are Enterning number. Which is under development phase');
            return;
        }
        let status = workstatus[text];
        let data = {
            response_type: 'in_channel', // public to the channel 
            text: `${text} is ${status}`,
            attachments: [{

                    image_url: `${attachmentsURLs[status]}`
                },
                {
                    "fallback": "Have you aprooved?",
                    "title": "Have you aprooved?",
                    "callback_id": "123xyz",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [{
                            "name": "yes",
                            "text": "Yes",
                            "type": "button",
                            "value": "yes"
                        },
                        {
                            "name": "no",
                            "text": "No",
                            "type": "button",
                            "value": "no"
                        }
                    ]
                }
            ]
        };
        console.log("<<<<>>>>><<<<<<>>>>>>", data.attachments)
        displayMessage(req.body.response_url, data)
    }
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
            const token = JSON.parse(body).access_token;
            // gtoken = token;
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


                        const team_id = JSON.parse(body).team.id
                        const team = JSON.parse(body).team.domain;

                        const data = {
                            'team_id': team_id,
                            'team_domain': team,
                            'token': token
                        }

                        Teams.insert(data)
                            .then((data) => {
                                console.log(data);
                            })
                            .catch((error) => {
                                console.log(error);
                            });


                        res.redirect('http://' + team + '.slack.com');
                    }
                }
            });
        }
    });
}




export const approvedAction = (req, res) => {
    res.status(200).end()



    const payloadjson = JSON.parse(req.body.payload);


    if (payloadjson.token != process.env.SLACK_VERIFICATION_TOKEN) {

        res.status(403).end("ACCESS FORBIDDEN");

    } else {

        console.log("GGOOOOOTTTT THE TOKEN", gtoken);
        let attachmentsS = {
            "fallback": "Have you aprooved?",
            "title": "Thankyou for responding",
            "text": `You have just responded with a ${payloadjson.actions[0].value}`,
            "callback_id": payloadjson.callback_id,
            "color": "#3AA3E3",
            "attachment_type": "default",
            "replace_original": true

        }

        request.post('https://slack.com/api/users.list', {
            form: {
                token: gtoken
            }
        }, (error, response, body) => {
            const body_json = JSON.parse(body);
            // body_json.forEach((user) => {
            //     console.log("TTTTHHHHHIIIIIISSSS ISSSS AAAA UUSSEERR::::::::::::::",user);
            // });
            console.log('????//////?????????????///////////????', typeof body_json.members);
            console.log('????//////?????????????///////////????', body_json);
            console.log('????//////?????????????///////////????', body);

        });

        displayMessage(payloadjson.response_url, attachmentsS);


    }




}