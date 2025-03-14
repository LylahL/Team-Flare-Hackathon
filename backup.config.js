/**
 * Database Backup Configuration
 * 
 * This file configures automated database backups, rotation policies,
 * and restoration procedures for MongoDB databases.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const AWS = require('aws-sdk');
const cron = require('node-cron');
const moment = require('moment');
const zlib = require('zlib');

// Load environment variables
const environment = process.env.NODE_ENV || 'development';
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/immigration_dev';
const awsRegion = process.env.AWS_REGION || 'us-east-1';
const awsBucketName = process.env.AWS_BUCKET_NAME || 'immigration-app-backups';

// Parse MongoDB connection string
function parseMongoUri(uri) {
  try {
    // Extract database name from URI
    const dbName = uri.split('/').pop().split('?')[0];
    return {
      uri,
      dbName
    };
  } catch (error) {
    console.error('Error parsing MongoDB URI:', error);
    return {
      uri,
      dbName: 'immigration_db'
    };
  }
}

const mongoConfig = parseMongoUri(mongoUri);

/**
 * Backup strategies for different environments
 */
const backupStrategies = {
  development: {
    schedule: '0 0 * * *',       // Daily at midnight
    retention: {
      days: 7,                   // Keep backups for 7 days
      minCount: 5                // Always keep at least 5 backups
    },
    compress: true,
    uploadToS3: false,
    backupDir: path.join(__dirname, 'backups/development')
  },
  
  staging: {
    schedule: '0 */6 * * *',     // Every 6 hours
    retention: {
      days: 14,                  // Keep backups for 14 days
      minCount: 10               // Always keep at least 10 backups
    },
    compress: true,
    uploadToS3: true,
    backupDir: path.join(__dirname, 'backups/staging')
  },
  
  production: {
    schedule: '0 */4 * * *',     

