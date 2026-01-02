/**
 * Password validation utility
 * Used for both sign-up and password change
 */

// Password regex: At least 8 chars, with letters, numbers, and special characters
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/;

/**
 * Validates a password string
 * @param password - The password to validate
 * @returns true if valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
    if (password.length < 8) return false;
    if (!PASSWORD_REGEX.test(password)) return false;
    return true;
};

/**
 * Gets the password validation error message
 * @param password - The password to validate
 * @returns Error message if invalid, empty string if valid
 */
export const getPasswordValidationError = (password: string): string => {
    if (!password) return '비밀번호를 입력해 주세요.';
    if (password.length < 8) return '비밀번호는 최소 8자 이상이어야 합니다.';
    if (!PASSWORD_REGEX.test(password)) {
        return '영문, 숫자, 특수문자를 각각 최소 하나씩 포함해야 합니다.';
    }
    return '';
};

/**
 * Email validation utility
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string): string => {
    if (!email) return '이메일을 입력해 주세요.';
    if (!EMAIL_REGEX.test(email)) return '올바른 이메일 형식이 아닙니다.';
    return '';
};
