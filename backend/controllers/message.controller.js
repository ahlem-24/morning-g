import axios from "axios";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js"; // Adjust import if needed

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id.toString();
    const senderRole = req.user.role;

    // Fetch active appointments involving the sender
    const activeAppointments = await Message.find({
      active: true,
      $or: [{ sickId: senderId }, { doctorId: senderId }],
    });

    // Find the specific appointment where both sender and receiver are participants
    const appointment = activeAppointments.find(
      (appt) =>
        (appt.sickId.toString() === senderId &&
          appt.doctorId.toString() === receiverId) ||
        (appt.sickId.toString() === receiverId &&
          appt.doctorId.toString() === senderId)
    );

    // If no active appointment is found and sender is "sick", allow up to 5 messages
    if (!appointment && senderRole === "sick") {
      const conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (conversation) {
        const messagesDuringConversation = await Message.find({
          _id: { $in: conversation.messages },
          senderId,
        });

        if (messagesDuringConversation.length >= 5) {
          return res
            .status(403)
            .json({ error: "Message limit reached for this conversation." });
        }
      }
    }

    // Validate appointment deadline rules if appointment exists
    if (appointment) {
      const appointmentDeadline = new Date(appointment.deadline);
      const currentTime = new Date();
      const twoHoursAfterDeadline = new Date(
        appointmentDeadline.getTime() + 2 * 60 * 60 * 1000
      );

      if (currentTime > twoHoursAfterDeadline) {
        return res.status(403).json({
          error:
            "Messages cannot be sent after 2 hours past the appointment deadline.",
        });
      }

      // If sender is sick, check message limit during the 2-hour post-deadline window
      if (senderRole === "sick") {
        const conversation = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (conversation) {
          const messagesDuringAppointment = await Message.find({
            _id: { $in: conversation.messages },
            senderId,
            createdAt: {
              $gte: appointmentDeadline.toISOString(),
              $lte: twoHoursAfterDeadline.toISOString(),
            },
          });

          if (messagesDuringAppointment.length >= 5) {
            return res
              .status(403)
              .json({ error: "Message limit reached for this appointment." });
          }
        }
      }
    }

    // Create or find the conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Create and save the new message
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    // Notify the receiver via WebSocket
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
