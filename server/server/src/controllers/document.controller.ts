import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import mongoose from 'mongoose';
import Document from '../models/Document';
import Case from '../models/Case';
import { sendDocumentNotification } from '../utils/email';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept common document file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/tiff'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, and TIFF are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// Helper middleware to handle multer uploads
const handleUpload = (req: Request, res: Response, next: Function) => {
  const uploadMiddleware = upload.single('document');
  
  uploadMiddleware(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        success: false, 
        message: `Upload error: ${err.message}` 
      });
    } else if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    next();
  });
};

/**
 * Upload a new document
 * @route POST /api/documents
 * @access Private
 */
export const uploadDocument = [
  handleUpload,
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { caseId, documentType, description } = req.body;

      // Validate case ID
      if (caseId && !mongoose.Types.ObjectId.isValid(caseId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid case ID'
        });
      }

      // Create document record
      const newDocument = new Document({
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype,
        caseId: caseId || null,
        documentType: documentType || 'Other',
        description: description || '',
        uploadedBy: req.user.id
      });

      await newDocument.save();

      // If associated with a case, update the case with the document reference
      if (caseId) {
        await Case.findByIdAndUpdate(caseId, {
          $push: { documents: newDocument._id }
        });

        // Send notification to case owner
        const caseData = await Case.findById(caseId).populate('client');
        if (caseData && caseData.client && caseData.client.email) {
          await sendDocumentNotification(
            caseData.client.email,
            'New Document Added',
            `A new document (${documentType}) has been added to your case.`
          );
        }
      }

      return res.status(201).json({
        success: true,
        document: newDocument
      });
    } catch (error) {
      console.error('Document upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during document upload',
        error: error.message
      });
    }
  }
];

/**
 * Get all documents (admin only) or user's documents
 * @route GET /api/documents
 * @access Private
 */
export const getDocuments = async (req: Request, res: Response) => {
  try {
    const { caseId, documentType, startDate, endDate } = req.query;
    
    // Build query
    const query: any = {};
    
    // Regular users can only see their own documents or documents of cases they own/have access to
    if (req.user.role !== 'admin') {
      query.$or = [
        { uploadedBy: req.user.id },
        { caseId: { $in: req.user.cases } }
      ];
    }
    
    // Apply filters
    if (caseId && mongoose.Types.ObjectId.isValid(caseId as string)) {
      query.caseId = caseId;
    }
    
    if (documentType) {
      query.documentType = documentType;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate as string);
      }
    }
    
    const documents = await Document.find(query)
      .populate('caseId', 'caseNumber title')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching documents',
      error: error.message
    });
  }
};

/**
 * Get a single document by ID
 * @route GET /api/documents/:id
 * @access Private
 */
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }
    
    const document = await Document.findById(id)
      .populate('caseId', 'caseNumber title client')
      .populate('uploadedBy', 'name email');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check access permissions
    if (req.user.role !== 'admin' && 
        document.uploadedBy.toString() !== req.user.id && 
        !req.user.cases.includes(document.caseId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this document'
      });
    }
    
    return res.status(200).json({
      success: true,
      document
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching document',
      error: error.message
    });
  }
};

/**
 * Download a document
 * @route GET /api/documents/:id/download
 * @access Private
 */
export const downloadDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check access permissions
    if (req.user.role !== 'admin' && 
        document.uploadedBy.toString() !== req.user.id && 
        !req.user.cases.includes(document.caseId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to download this document'
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }
    
    // Log download activity
    document.downloadCount = (document.downloadCount || 0) + 1;
    document.lastDownloaded = new Date();
    await document.save();
    
    // Send file for download
    res.download(document.path, document.originalName);
    
  } catch (error) {
    console.error('Error downloading document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while downloading document',
      error: error.message
    });
  }
};

/**
 * Update document metadata
 * @route PUT /api/documents/:id
 * @access Private
 */
export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { documentType, description, caseId } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }
    
    // Validate case ID if provided
    if (caseId && !mongoose.Types.ObjectId.isValid(caseId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid case ID'
      });
    }
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check update permissions
    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to update this document'
      });
    }
    
    // If changing case association, update both cases (old and new)
    if (caseId && document.caseId && caseId !== document.caseId.toString()) {
      // Remove from old case
      await Case.findByIdAndUpdate(document.caseId, {
        $pull: { documents: document._id }
      });
      
      // Add to new case
      await Case.findByIdAndUpdate(caseId, {
        $push: { documents: document._id }
      });
    } else if (caseId && !document.caseId) {
      // Add to new case if it wasn't associated before
      await Case.findByIdAndUpdate(caseId, {
        $push: { documents: document._id }
      });
    }
    
    // Update document
    const updatedDocument = await Document.findByIdAndUpdate(
      id,
      {
        documentType: documentType || document.documentType,
        description: description || document.description,
        caseId: caseId || document.caseId,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      document: updatedDocument
    });
    
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating document',
      error: error.message
    });
  }
};

/**
 * Delete a document
 * @route DELETE /api/documents/:id
 * @access Private
 */
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
    }
    
    const document = await Document.findById(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    // Check delete permissions
    if (req.user.role !== 'admin' && document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to delete this document'
      });
    }
    
    // If associated with a case, update the case
    if (document.caseId) {
      await Case.findByIdAndUpdate(document.caseId, {
        $pull: { documents: document._id }
      });
    }
    
    // Delete file from storage
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }
    
    // Delete document record
    await document.remove();
    
    return res.status(200).json({
      success: true,
      message: 'Document successfully deleted'
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting document',
      error: error.message
    });
  }
};

/**
 * Get document categories/types for dropdown options
 * @route GET /api/documents/types
 * @access Private
 */
export const getDocumentTypes = async (req: Request, res: Response) => {
  try {
    // Return predefined document types for immigration application
    const documentTypes = [
      'Passport',
      'Birth Certificate',
      'Marriage Certificate',
      'Divorce

