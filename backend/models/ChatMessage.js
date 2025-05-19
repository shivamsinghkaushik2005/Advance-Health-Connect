import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: false
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    url: String,
    fileType: String,
    fileName: String
  }],
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Helper method to create a conversation ID from two user IDs
chatMessageSchema.statics.createConversationId = (userId1, userId2) => {
  // Sort to ensure the same conversation ID regardless of order
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

export default ChatMessage; 