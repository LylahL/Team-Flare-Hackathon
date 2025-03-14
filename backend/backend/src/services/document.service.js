const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Document = require('../models/document.model');
const ImmigrationCase = require('../models/immigrationCase.model');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Multer configuration for S3 uploads
const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  }),
});

// Upload document to S3 and save metadata to database
exports.uploadDocument = (req, res) => {
  const singleUpload = upload.single('document');

  singleUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }

    try {
      const document = await Document.create({
        case: req.body.caseId,
        name: req.file.originalname,
        fileKey: req.file.key,
        fileUrl: req.file.location,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: req.user.id,
      });

      // Update case document list
      await ImmigrationCase.findByIdAndUpdate(
        req.body.caseId,
        { $push: { documents: document._id } },
        { new: true }
      );

      res.status(201).json({
        success: true,
        document,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload document',
      });
    }
  });
};

// Delete document from S3 and database
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    // Delete from S3
    await s3
      .deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: document.fileKey,
      })
      .promise();

    // Remove document from associated case
    await ImmigrationCase.findByIdAndUpdate(
      document.case,
      { $pull: { documents: document._id } }
    );

    // Delete document from database
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
    });
  }
};

