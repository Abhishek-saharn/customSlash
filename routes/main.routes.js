import {
  Router
} from "express";

import {
  slashHome,
  indexButton,
  slackAuth,
  approvedAction,
  geoLocation
} from "../controllers/main.controller.js";

const router = new Router();
/**
 * this route will handle all the "/pinpoint" commands, with post requests.
 */
router.route("/").post(slashHome);

/**
 * This route will be used for authentications for new users intalling /pinpoint app.
 *  It will data in HTTP get
 */
router.route("/slack").get(slackAuth);

/**
 *  A "Add to slack button" is will be shown in /index
 */
router.route("/index").get(indexButton);


router.route("/approvedAction").post(approvedAction);


router.route("/geoLocation").get(geoLocation);

export default router;
