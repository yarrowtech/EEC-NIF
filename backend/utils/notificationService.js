const Notification = require('../models/Notification');

class NotificationService {
  /**
   * Create a notification with consistent structure
   */
  static async createNotification({
    schoolId,
    campusId = null,
    title,
    message,
    audience = 'All',
    type = 'general',
    priority = 'medium',
    category = 'general',
    classId = null,
    sectionId = null,
    createdBy = null,
    relatedEntity = null,
    expiresAt = null
  }) {
    try {
      const notification = await Notification.create({
        schoolId,
        campusId,
        title,
        message,
        audience,
        type,
        priority,
        category,
        classId,
        sectionId,
        createdBy,
        relatedEntity: relatedEntity ? {
          entityType: relatedEntity.entityType,
          entityId: relatedEntity.entityId
        } : undefined,
        expiresAt
      });

      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  /**
   * Create assignment notification
   */
  static async notifyAssignmentCreated({ schoolId, campusId, assignment, createdBy }) {
    const dueDate = assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'TBA';

    return await this.createNotification({
      schoolId,
      campusId,
      title: `New Assignment: ${assignment.title}`,
      message: `A new ${assignment.subject} assignment has been posted for ${assignment.class}. Due date: ${dueDate}`,
      audience: 'Student',
      type: 'assignment',
      priority: 'medium',
      category: 'academic',
      createdBy,
      relatedEntity: {
        entityType: 'assignment',
        entityId: assignment._id
      }
    });
  }

  /**
   * Create exam notification
   */
  static async notifyExamScheduled({ schoolId, campusId, exam, createdBy }) {
    const examDate = exam.date ? new Date(exam.date).toLocaleDateString() : 'TBA';
    const examTime = exam.time || '';

    return await this.createNotification({
      schoolId,
      campusId,
      title: `Exam Scheduled: ${exam.title}`,
      message: `${exam.subject} exam has been scheduled for ${examDate} ${examTime}. Venue: ${exam.venue || 'TBA'}`,
      audience: 'Student',
      type: 'exam',
      priority: 'high',
      category: 'academic',
      createdBy,
      relatedEntity: {
        entityType: 'exam',
        entityId: exam._id
      }
    });
  }

  /**
   * Create fee reminder notification
   */
  static async notifyFeeReminder({ schoolId, campusId, invoice, createdBy }) {
    const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'soon';

    return await this.createNotification({
      schoolId,
      campusId,
      title: `Fee Reminder: ${invoice.title || 'Fee Payment'}`,
      message: `Fee payment of Rs. ${invoice.balanceAmount || invoice.totalAmount} is due ${dueDate}. Please pay on time to avoid late fees.`,
      audience: 'Student',
      type: 'fee',
      priority: 'high',
      category: 'general',
      createdBy,
      relatedEntity: {
        entityType: 'fee',
        entityId: invoice._id
      }
    });
  }

  /**
   * Create result published notification
   */
  static async notifyResultPublished({ schoolId, campusId, grade, section, createdBy }) {
    const sectionText = section ? ` Section ${section}` : '';

    return await this.createNotification({
      schoolId,
      campusId,
      title: `Results Published - ${grade}${sectionText}`,
      message: `The examination results for ${grade}${sectionText} have been published. Please check your results.`,
      audience: 'Student',
      type: 'result',
      priority: 'high',
      category: 'academic',
      createdBy
    });
  }
}

module.exports = NotificationService;
