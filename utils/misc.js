import request from 'request'

export function displayMessage(response_url, message) {

    const options = {
        uri: response_url,
        json: true,
        headers: {
            'Content-type': 'application/json'
        },
        body: message
    }

    request.post(options, (error, response, body) => {
        console.log("<<<<<>>>>>>>>>><ERRRRRRR", error);
        console.log("BBBBOOOOOOODDDDYYYY", body);
    })

}