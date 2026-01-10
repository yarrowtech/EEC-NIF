const crypto = require('crypto');
const StudentUser = require('../models/StudentUser');
const TeacherUser = require('../models/TeacherUser');
const ParentUser = require('../models/ParentUser');

/**
 * Generates a random username based on student name
 * @param {string, string} name, type - Student's full name
 * @returns {string} - Generated username
 */
const generateUsername = async (name, type) => {
    // Remove spaces and convert to lowercase
    const baseName = name.replace(/\s+/g, '').toLowerCase();

    // Take the first 6 characters or the entire name if shorter
    const namePrefix = baseName.substring(0, Math.min(6, baseName.length));

    // Add random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);

    const username = `${namePrefix}${randomNum}`;

    // Check if username already exists
    switch (type) {
        case 'student': {
            const existingUser = await StudentUser.findOne({ username });
            if (existingUser) {
                // If username exists, try again with a different number
                return generateUsername(name, type);
            }
            break;
        }
        case 'teacher': {
            const existingTeacher = await TeacherUser.findOne({ username });
            if (existingTeacher) {
                // If username exists, try again with a different number
                return generateUsername(name, type);
            }
            break;
        }
        case 'parent': {
            const existingParent = await ParentUser.findOne({ username });
            if (existingParent) {
                // If username exists, try again with a different number
                return generateUsername(name, type);
            }
            break;
        }
        default:
            break;
    }
    return username;
};

/**
 * Generates a random secure password
 * @param {number} length - Length of password (default: 10)
 * @returns {string} - Generated password
 */
const generatePassword = (length = 10) => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnpqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '@#$%&*!';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    password += uppercase.charAt(crypto.randomInt(uppercase.length));
    password += lowercase.charAt(crypto.randomInt(lowercase.length));
    password += numbers.charAt(crypto.randomInt(numbers.length));
    password += symbols.charAt(crypto.randomInt(symbols.length));

    for (let i = 4; i < length; i++) {
        password += allChars.charAt(crypto.randomInt(allChars.length));
    }

    // Fisher-Yates shuffle
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i -= 1) {
        const j = crypto.randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
};

module.exports = {
    generateUsername,
    generatePassword
};
