import Router from "express";

import {
  eventHandler
} from "../controllers/events.controller.js";

const router = new Router();

router.route("/events", eventHandler);
