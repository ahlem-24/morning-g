import Appointment from "../models/date.model.js";
import mongoose from "mongoose";

export const createAppointment = async (req, res) => {
  try {
    const { sickId, doctorId, deadline, price } = req.body;

    if (!sickId || !doctorId || !deadline || !price) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Example logic for creating an appointment
    const newAppointment = await Appointment.create({
      sickId,
      doctorId,
      deadline,
      price,
    });

    res.status(201).json({
      message: "Appointment created successfully.",
      appointment: newAppointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller to activate an appointment
export const activateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Validate the appointment ID
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID." });
    }

    // Find the appointment by ID
    const appointment = await Appointment.findById(appointmentId);

    // Check if the appointment exists
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Update the appointment's active status
    appointment.active = true;
    await appointment.save();

    res.status(200).json({
      message: "Appointment activated successfully.",
      appointment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getAppointments = async (req, res) => {
  try {
    const { sickId, doctorId, deadline, price } = req.query;

    // Build query object dynamically
    const query = {};
    if (sickId) query.sickId = sickId;
    if (doctorId) query.doctorId = doctorId;
    if (deadline) query.deadline = deadline;
    if (price) query.price = price;

    // Fetch appointments based on query
    const appointments = await Appointment.find(query);

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found." });
    }

    res.status(200).json({
      message: "Appointments  successfully.",
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getAppointmentBy = async (req, res) => {
  try {
    const { sickId, doctorId, deadline, price } = req.query;

    // Build query object dynamically
    const query = {};
    if (sickId && doctorId) {
      query.$or = [{ sickId }, { doctorId }];
    } else {
      if (sickId) query.sickId = sickId;
      if (doctorId) query.doctorId = doctorId;
    }
    if (deadline) query.deadline = deadline;
    if (price) query.price = price;

    // Fetch appointments based on query
    const appointments = await Appointment.find(query);

    if (appointments.length === 0) {
      return res.status(404).json({ message: "No appointments found." });
    }

    res.status(200).json({
      message: "Appointments fetched successfully.",
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

