import express from "express";
import protectRoute from "../middleware/protectRoote.js";
import { getUsersForSidebar } from "../controllers/user.controller.js";
import { createAppointment } from "../controllers/date.controller.js";
import {
  getAppointments,
  getAppointmentBy,
  activateAppointment,
} from "../controllers/date.controller.js";

const router = express.Router();

router.get("/", protectRoute, getUsersForSidebar);

router.get("/appointments", getAppointments);

// Route to activate an appointment
router.patch("/appointments/:appointmentId/activate", activateAppointment);
// Route definition
router.get("/getAppointmentBy", getAppointmentBy);
router.post("/purchase", createAppointment);
export default router;
