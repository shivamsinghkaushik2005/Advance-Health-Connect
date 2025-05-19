import express from 'express';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

const router = express.Router();

// @desc    Get chat messages for a specific appointment
// @route   GET /api/chat/:appointmentId
// @access  Private
router.get('/:appointmentId', async (req, res) => {
  try {
    const appointmentId = req.params.appointmentId;
    
    // Check if appointment exists and user has access
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is part of this appointment
    const userId = req.user._id.toString();
    if (appointment.patientId.toString() !== userId && 
        appointment.doctorId.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to chat messages' });
    }
    
    // Get messages related to this appointment
    const messages = await ChatMessage.find({ appointmentId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage');
    
    // Mark messages as read if user is the receiver
    await ChatMessage.updateMany(
      {
        appointmentId,
        receiver: req.user._id,
        read: false
      },
      { read: true }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting appointment chat messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Send a new message
// @route   POST /api/chat
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { appointmentId, receiverId, message } = req.body;
    
    if (!appointmentId || !receiverId || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if appointment exists
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Check if user is part of this appointment
    const senderId = req.user._id;
    if (appointment.patientId.toString() !== senderId.toString() && 
        appointment.doctorId.toString() !== senderId.toString()) {
      return res.status(403).json({ message: 'Not authorized to send messages for this appointment' });
    }
    
    // Check if receiver is part of this appointment
    if (appointment.patientId.toString() !== receiverId && 
        appointment.doctorId.toString() !== receiverId) {
      return res.status(400).json({ message: 'Receiver is not part of this appointment' });
    }
    
    // Create conversation ID
    const conversationId = ChatMessage.createConversationId(senderId, receiverId);
    
    const newMessage = new ChatMessage({
      appointmentId,
      conversationId,
      sender: senderId,
      receiver: receiverId,
      message: message.trim(),
      read: false
    });
    
    const savedMessage = await newMessage.save();
    
    // Populate sender and receiver details
    await savedMessage.populate('sender', 'name profileImage');
    await savedMessage.populate('receiver', 'name profileImage');
    
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get conversations for a user
// @route   GET /api/chat/conversations
// @access  Private
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // Find all messages where user is sender or receiver
    const messages = await ChatMessage.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    }).sort({ createdAt: -1 });
    
    // Extract unique conversation IDs
    const conversationMap = new Map();
    
    for (const message of messages) {
      const conversationId = message.conversationId;
      
      if (!conversationMap.has(conversationId)) {
        // Identify the other participant
        const otherUserId = message.sender.toString() === userId
          ? message.receiver.toString()
          : message.sender.toString();
        
        // Get other user details
        const otherUser = await User.findById(otherUserId)
          .select('name email userType profileImage');
          
        if (otherUser) {
          conversationMap.set(conversationId, {
            id: conversationId,
            participant: otherUser,
            lastMessage: {
              message: message.message,
              sender: message.sender,
              createdAt: message.createdAt
            },
            unreadCount: 0
          });
        }
      }
    }
    
    // Count unread messages for each conversation
    for (const [conversationId, conversation] of conversationMap.entries()) {
      const unreadCount = await ChatMessage.countDocuments({
        conversationId,
        receiver: userId,
        read: false
      });
      
      conversation.unreadCount = unreadCount;
    }
    
    // Convert map to array
    const conversations = [...conversationMap.values()];
    
    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get chat history with another user
// @route   GET /api/chat/history/:userId
// @access  Private
router.get('/history/:userId', async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();
    const otherUserId = req.params.userId;
    
    // Create conversation ID
    const conversationId = ChatMessage.createConversationId(currentUserId, otherUserId);
    
    // Get chat history
    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage');
      
    // Mark messages as read
    await ChatMessage.updateMany(
      {
        conversationId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Delete a message
// @route   DELETE /api/chat/message/:id
// @access  Private
router.delete('/message/:id', async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Check ownership
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    
    await message.remove();
    
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 