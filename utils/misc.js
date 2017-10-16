export function displayMessage(response_url, message) {

    const options = {
        uri: response_url,
        json: message,
        headers: {
            'Content-type': 'application/json'
        }
    }

    request.post(options, (error, response, body) => {
        console.log("<<<<<>>>>>>>>>><ERRRRRRR", error);
        console.log("BBBBOOOOOOODDDDYYYY", body);
    })

}