import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import ChatMessage from './models/ChatMessage.js';
import User from './models/User.js';

// Map to store online users
const onlineUsers = new Map();

const setupSocketServer = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      // Verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your_jwt_secret_key_here'
      );

      // Find user
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    console.log(`User connected: ${userId}`);
    
    // Add user to online users map
    onlineUsers.set(userId, socket.id);
    
    // Broadcast online status
    io.emit('userOnline', userId);
    
    // Handle private messages
    socket.on('sendMessage', async (data) => {
      try {
        const { receiverId, message, attachments = [] } = data;
        
        if (!receiverId || !message) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        const sender = socket.user;
        
        // Create conversation ID
        const conversationId = ChatMessage.createConversationId(
          sender._id.toString(), 
          receiverId
        );
        
        // Create and save message to database
        const newMessage = new ChatMessage({
          conversationId,
          sender: sender._id,
          receiver: receiverId,
          message,
          attachments,
          read: false
        });
        
        await newMessage.save();
        
        // Format message for frontend
        const messageToSend = {
          _id: newMessage._id,
          conversationId,
          sender: {
            _id: sender._id,
            name: sender.name
          },
          receiver: receiverId,
          message,
          attachments,
          read: false,
          createdAt: newMessage.createdAt
        };
        
        // Send to sender
        socket.emit('newMessage', messageToSend);
        
        // Send to receiver if online
        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('newMessage', messageToSend);
        }
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Mark messages as read
    socket.on('markMessagesAsRead', async (data) => {
      try {
        const { conversationId } = data;
        
        // Update messages in database
        await ChatMessage.updateMany(
          { 
            conversationId,
            receiver: socket.user._id,
            read: false
          },
          { read: true }
        );
        
        // Notify conversation partner
        const messages = await ChatMessage.find({ conversationId, read: true })
          .sort({ createdAt: -1 })
          .limit(1);
          
        if (messages.length > 0) {
          const lastMessage = messages[0];
          const partnerId = lastMessage.sender.toString() === socket.user._id.toString()
            ? lastMessage.receiver.toString()
            : lastMessage.sender.toString();
            
          const partnerSocketId = onlineUsers.get(partnerId);
          if (partnerSocketId) {
            io.to(partnerSocketId).emit('messagesRead', { conversationId });
          }
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = onlineUsers.get(receiverId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('userTyping', {
          senderId: socket.user._id.toString(),
          senderName: socket.user.name
        });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      
      // Remove from online users
      onlineUsers.delete(userId);
      
      // Broadcast offline status
      io.emit('userOffline', userId);
    });
  });

  return io;
};

export default setupSocketServer; 