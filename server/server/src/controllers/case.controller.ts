
import { Request, Response } from 'express';
import Case from '../models/Case';
import User from '../models/User';
import mongoose from 'mongoose';

/**
 * Create a new case
 */
export const createCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, caseType, description, clientId } = req.body;
    const createdBy = req.user?.id;

    // Verify client exists
    if (clientId) {
      const clientExists = await User.exists({ _id: clientId });
      if (!clientExists) {
        res.status(404).json({ success: false, message: 'Client not found' });
        return;
      }
    }

    const newCase = new Case({
      title,
      caseType,
      description,
      client: clientId || null,
      status: 'new',
      createdBy,
      assignedTo: createdBy,
      timeline: [
        {
          status: 'new',
          note: 'Case created',
          updatedBy: createdBy,
          timestamp: new Date()
        }
      ]
    });

    await newCase.save();

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      case: newCase
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating case',
      error: (error as Error).message
    });
  }
};

/**
 * Get all cases with filtering, sorting, and pagination
 */
export const getAllCases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      caseType, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Get user role and ID
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Build filter object
    const filter: any = {};

    // Regular users can only see their own cases (either as client or assignedTo)
    if (userRole === 'user') {
      filter.$or = [
        { client: userId },
        { assignedTo: userId },
        { createdBy: userId }
      ];
    }

    // Add status filter if provided
    if (status) {
      filter.status = status;
    }

    // Add case type filter if provided
    if (caseType) {
      filter.caseType = caseType;
    }

    // Add search query if provided
    if (search) {
      filter.$or = [
        ...(filter.$or || []),
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { caseNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Count total documents for pagination
    const totalCases = await Case.countDocuments(filter);

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;
    
    // Fetch cases
    const cases = await Case.find(filter)
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('client', 'name email')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      count: cases.length,
      total: totalCases,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalCases / Number(limit)),
        limit: Number(limit)
      },
      data: cases
    });
  } catch (error) {
    console.error('Get all cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cases',
      error: (error as Error).message
    });
  }
};

/**
 * Get case by ID
 */
export const getCaseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const caseItem = await Case.findById(id)
      .populate('client', 'name email profile')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('documents');

    if (!caseItem) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    // Check permissions - regular users can only access their own cases
    if (userRole === 'user' && 
        caseItem.client?.toString() !== userId && 
        caseItem.assignedTo?.toString() !== userId &&
        caseItem.createdBy?.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.status(200).json({
      success: true,
      data: caseItem
    });
  } catch (error) {
    console.error('Get case by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching case',
      error: (error as Error).message
    });
  }
};

/**
 * Update case
 */
export const updateCase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, caseType, description, status, assignedTo } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Find the case
    const caseItem = await Case.findById(id);
    if (!caseItem) {
      res.status(404).json({ success: false, message: 'Case not found' });
      return;
    }

    // Check permissions - only admins and case owners/assignees can update
    if (userRole === 'user' && 
        caseItem.createdBy?.toString() !== userId && 
        case

