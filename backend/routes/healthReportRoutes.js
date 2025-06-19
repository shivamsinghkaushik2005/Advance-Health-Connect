import express from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import { extractHealthParameters } from '../utils/reportSummarizer.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-report', upload.single('report'), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;
    const result = await Tesseract.recognize(imageBuffer, 'eng');
    const text = result.data.text;

    const summary = extractHealthParameters(text);

    res.json({ success: true, summary });
  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({ success: false, message: 'Error processing image' });
  }
});

export default router;
