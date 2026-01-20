const express = require('express');
const mongoose = require('mongoose');
const School = require('../models/School');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();

// PUBLIC ENDPOINT - No authentication required
// POST /api/school-registration
router.post(
  '/',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 3 }), // 3 requests per 15 minutes
  async (req, res) => {
    // #swagger.tags = ['School Registration']
    try {
      const {
        name, campuses, officialEmail, contactPersonName, contactPhone,
        address, schoolType, board, boardOther, academicYearStructure, estimatedUsers,
        websiteURL, logo, verificationDocs
      } = req.body;

      // Server-side validation
      const errors = {};

      if (!name || !name.trim()) {
        errors.name = 'School name is required';
      } else if (name.trim().length < 3) {
        errors.name = 'School name must be at least 3 characters';
      }

      // Validate campuses array
      if (!campuses || !Array.isArray(campuses) || campuses.length === 0) {
        errors.campuses = 'At least one campus is required';
      } else {
        // Validate each campus
        for (let i = 0; i < campuses.length; i++) {
          const campus = campuses[i];

          if (!campus.name || !campus.name.trim()) {
            errors[`campus_${i}_name`] = `Campus ${i + 1} name is required`;
          }

          if (!campus.address || !campus.address.trim()) {
            errors[`campus_${i}_address`] = `Campus ${i + 1} address is required`;
          } else if (campus.address.trim().length < 10) {
            errors[`campus_${i}_address`] = `Campus ${i + 1} address must be at least 10 characters`;
          }

          if (campus.contactPhone && !/^\+?[\d\s\-()]{10,}$/.test(campus.contactPhone)) {
            errors[`campus_${i}_phone`] = `Campus ${i + 1} phone number is invalid`;
          }
        }
      }

      if (!officialEmail || !officialEmail.trim()) {
        errors.officialEmail = 'Official email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail)) {
        errors.officialEmail = 'Invalid email format';
      }

      if (!contactPersonName || !contactPersonName.trim()) {
        errors.contactPersonName = 'Contact person name is required';
      }

      if (!contactPhone || !contactPhone.trim()) {
        errors.contactPhone = 'Contact phone is required';
      } else if (!/^\+?[\d\s\-()]{10,}$/.test(contactPhone)) {
        errors.contactPhone = 'Invalid phone format';
      }

      if (!address || !address.trim()) {
        errors.address = 'School address is required';
      } else if (address.trim().length < 10) {
        errors.address = 'Please provide a complete address';
      }

      if (!schoolType) {
        errors.schoolType = 'School type is required';
      }

      if (!board) {
        errors.board = 'School board/affiliation is required';
      } else if (board === 'Other' && (!boardOther || !boardOther.trim())) {
        errors.boardOther = 'Please specify the board name';
      }

      if (!academicYearStructure) {
        errors.academicYearStructure = 'Academic year structure is required';
      }

      if (!estimatedUsers) {
        errors.estimatedUsers = 'Estimated number of users is required';
      }

      // Validate website URL if provided
      if (websiteURL && websiteURL.trim()) {
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlPattern.test(websiteURL)) {
          errors.websiteURL = 'Please enter a valid URL';
        }
      }

      if (!logo || !logo.secure_url) {
        errors.logo = 'School logo is required';
      }

      if (!verificationDocs || !Array.isArray(verificationDocs) || verificationDocs.length === 0) {
        errors.verificationDocs = 'At least one verification document is required';
      }

      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ errors });
      }

      // Check for duplicate email
      const existingSchool = await School.findOne({
        $or: [
          { officialEmail: officialEmail.toLowerCase() },
          { contactEmail: officialEmail.toLowerCase() }
        ]
      });

      if (existingSchool) {
        return res.status(409).json({
          error: 'A school with this email address is already registered'
        });
      }

      // Create school registration
      const school = await School.create({
        name: name.trim(),
        campuses: campuses.map(c => ({
          name: c.name.trim(),
          address: c.address.trim(),
          campusType: c.campusType || 'Branch',
          contactPerson: c.contactPerson?.trim() || undefined,
          contactPhone: c.contactPhone?.trim() || undefined
        })),
        campusName: campuses[0]?.name.trim(), // For backward compatibility
        officialEmail: officialEmail.toLowerCase().trim(),
        contactEmail: officialEmail.toLowerCase().trim(),
        contactPersonName: contactPersonName.trim(),
        contactPhone: contactPhone.trim(),
        address: address.trim(),
        schoolType,
        board,
        boardOther: board === 'Other' ? boardOther?.trim() : undefined,
        academicYearStructure,
        estimatedUsers,
        websiteURL: websiteURL?.trim() || undefined,
        logo,
        verificationDocs,
        registrationStatus: 'pending',
        submittedAt: new Date(),
        status: 'inactive' // Inactive until approved
      });

      // Return sanitized response (no sensitive internal fields)
      res.status(201).json({
        message: 'Registration submitted successfully',
        school: {
          id: school._id,
          name: school.name,
          campusCount: school.campuses.length,
          code: school.code,
          registrationStatus: school.registrationStatus,
          submittedAt: school.submittedAt
        }
      });

    } catch (err) {
      console.error('School registration error:', err);

      if (err.code === 11000) {
        return res.status(409).json({
          error: 'A school with this information already exists'
        });
      }

      res.status(500).json({
        error: 'Registration failed. Please try again later.'
      });
    }
  }
);

module.exports = router;
