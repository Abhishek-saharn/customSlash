import {
  Router
} from "express";

import commandsControllers from "../controllers/commands.controller.js";

const router = new Router();

/**
 *@api {post} /pinpoint Handles all slash cammands inputs.
 *@apiGroup commands
 *@apiParam {String} token Token for verification of command invocation.
 *@apiParam {String} text Text written after /pinpoint command.
 *@apiParam {String} team_id Team id where command executed.
 *@apiParam {String} user_id User id who executed the command.
 *@apiParam {String} channel_id Channel id where slash command is executed.
 *@apiParam {String} response_url It is the Url which can be used for send response back.
 *  With this approach, you can respond to a user's command up to 
 *  5 times within 30 minutes of the command's invocation.
 *@apiParamExample {json} Input
 *  {
 *    "token"="gIkuvaNzQIHg97ATvDxqgjtO"
      "team_id" = "T0001"
      "channel_id" = "C2147483705"
      "user_id" = "U2147483697"
      "text" = "update status 1"
      "response_url" = "https://hooks.slack.com/commands/1234/5678"
 *  }
 *@apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *  }
 *@apiErrorExample {json} Internal error
 *  HTTP/1.1 500 Internal Server Error
 */
router.route("/pinpoint")
  .post(commandsControllers.authUser, commandsControllers.slashHome);

/**
 *@api {get} /slackAuth Invokes on first time installation.
 *@apiGroup installation
 *@apiParam {String} code code GET parameter will be used for a temporary authorization.
  *@apiParamExample {json} Input
 *  {
 *    "code"="gIkuvaNzQIHg97ATvDxqgjtO"
 *  }
 *@apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *@apiErrorExample {json} Internal error
 *  HTTP/1.1 500 Internal Server Error
 */
router.route("/slackAuth")
  .get(commandsControllers.slackAuth);

/**
 *  A "Add to slack button" is will be shown in /index
 */
/**
 *@api {get} /index When user visit installation page.
 *@apiGroup installation
 *@apiDescription This api will be used for serving an html index
 page that which later invoke "salckAuth" api.
 *@apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *@apiErrorExample {json} Internal error
 *  HTTP/1.1 500 Internal Server Error
 */
router.route("/index")
  .get(commandsControllers.indexButton);

/**
 * Only used for learning purpose of interactive buttons and their functionality.
 */
/**
 *@api {post} /approvedAction Handles all requests coming by interacting with interative buttons/Message-menus.
 *@apiGroup interactiveActions
 *@apiParam {String} token Token for verification of command invocation.
 *@apiParam {String} actions Action field contains name of the interective element eg: message-menu and "selected value", the option user selects.
 *@apiParam {String} team team field encapsulates _id and domain containing info about id and Team name respectively, where command executed.
 *@apiParam {String} user User information like id and name who executed the command is in user field.
 *@apiParam {String} channel Channel name and id where slash command is executed contained by Channel field.
 *@apiParam {String} response_url It is the Url which can be used for send response back.
 *  With this approach, you can respond to a user's command up to
 *  5 times within 30 minutes of the command's invocation.
 *@apiParamExample {json} Input
 *  {
      "actions": [
          {
              "name": "games_list",
              "selected_options": [
                  {
                      "value": "maze"
                  }
              ]
          }
      ],
      "team": {
          "id": "T012AB0A1",
          "domain": "pocket-calculator"
      },
      "channel": {
          "id": "C012AB3CD",
          "name": "general"
      },
      "user": {
          "id": "U012A1BCD",
          "name": "muzik"
      },
      "token": "verification_token_string",
      "response_url": "https://hooks.slack.com/actions/T012AB0A1/1234567890/JpmK0yzoZ5eRiqfeduTBYXWQ",
 *  }
 *@apiSuccessExample {json} Success
 *  HTTP/1.1 200 OK
 *  {
 *  }
 *@apiErrorExample {json} Internal error
 *  HTTP/1.1 500 Internal Server Error
 */
router.route("/approvedAction")
  .post(commandsControllers.authMenu, commandsControllers.approvedAction);

/**
 * Captures location coming for browser(JUST USED FOR GET REQUESTS).
 */
router.route("/geoLocation")
  .get(commandsControllers.geoLocation);

export default router;
