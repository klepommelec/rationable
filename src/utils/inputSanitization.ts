// Input sanitization utilities for security

/**
 * Sanitize text content to prevent XSS attacks
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  return input
    // Remove script tags and event handlers
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Remove potentially dangerous HTML tags
    .replace(/<iframe\b[^>]*>/gi, '')
    .replace(/<object\b[^>]*>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '')
    .replace(/<link\b[^>]*>/gi, '')
    .replace(/<meta\b[^>]*>/gi, '')
    // Escape HTML entities
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize comment content
 */
export const sanitizeComment = (content: string): string => {
  if (!content) return '';
  
  // Basic length validation
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    throw new Error('Comment cannot be empty');
  }
  
  if (trimmed.length > 10000) {
    throw new Error('Comment is too long (maximum 10,000 characters)');
  }
  
  // Sanitize the content
  return sanitizeText(trimmed);
};

/**
 * Validate decision title
 */
export const sanitizeDecisionTitle = (title: string): string => {
  if (!title) return '';
  
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error('Decision title cannot be empty');
  }
  
  if (trimmed.length > 200) {
    throw new Error('Decision title is too long (maximum 200 characters)');
  }
  
  return sanitizeText(trimmed);
};

/**
 * Validate and sanitize file names
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName) return 'unnamed_file';
  
  // Normalize Unicode and remove dangerous characters
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^[._-]+|[._-]+$/g, '') // Remove leading/trailing special chars
    .substring(0, 255) || 'unnamed_file';
};

/**
 * Validate workspace name
 */
export const sanitizeWorkspaceName = (name: string): string => {
  if (!name) return '';
  
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    throw new Error('Workspace name cannot be empty');
  }
  
  if (trimmed.length > 100) {
    throw new Error('Workspace name is too long (maximum 100 characters)');
  }
  
  return sanitizeText(trimmed);
};

/**
 * Validate workspace description
 */
export const sanitizeWorkspaceDescription = (description: string): string => {
  if (!description) return '';
  
  const trimmed = description.trim();
  if (trimmed.length > 500) {
    throw new Error('Workspace description is too long (maximum 500 characters)');
  }
  
  return sanitizeText(trimmed);
};