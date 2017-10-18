export const eventHandler = (req, res) => {
  res.status(200).end();

  const bodyJSON = JSON.parse(req.body);

  if (bodyJSON.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    res.status(403).end("Access Forbidden");
  } else {
    if (bodyJSON.type === "url_verification") {
      res.format({
        "application/json": () => {
          res.send({
            challenge: bodyJSON.challenge
          });
        }
      });
    }
    console.log("hdfgsa");
  }
};
