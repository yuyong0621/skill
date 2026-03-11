/**
 * Soul Weaver Skill
 * Configuration generation with API key authorization
 * Requires official API key for authenticated access
 */

const LOCAL_TEMPLATES = require('./references/templates.js');

const TEMPLATES = {
  celebrity: [
    'musk', 'jobs', 'einstein', 'bezos', 
    'da_vinci', 'qianxuesen', 'ng', 'kondo', 'ferris'
  ],
  profession: [
    'developer', 'writer', 'researcher', 'analyst', 'collaborator'
  ]
};

const REQUIRED_TOOLS = ['find-skills', 'autoclaw', 'brave-search'];

/**
 * Main handler function
 * @param {Object} params - User parameters
 * @returns {Promise<Object>} Result object
 */
async function handler(params) {
  const {
    apiKey = '',
    apiEndpoint = 'https://official-api-endpoint.com', // Default endpoint
    aiName = 'AI_Assistant',
    userName = 'User',
    profession = '',
    useCase = '',
    communicationStyle = '',
    celebrityName = '',
    language = 'ZH'
  } = params;

  console.log('Soul Weaver: Generating configuration for', aiName);

  // API key validation
  if (!apiKey || apiKey.trim().length === 0) {
    return {
      success: false,
      error: 'API_KEY_REQUIRED',
      message: 'API key is required. Please register and login at https://sora2.wboke.com to apply for an API key'
    };
  }

  // Validate API key format (basic validation)
  if (!isValidApiKey(apiKey)) {
    return {
      success: false,
      error: 'INVALID_API_KEY',
      message: 'Invalid API key format. Please register and login at https://sora2.wboke.com to obtain a valid API key'
    };
  }

  try {
    // Generate configuration locally using templates
    const result = LOCAL_TEMPLATES.generateConfig({
      aiName,
      userName,
      profession,
      useCase,
      communicationStyle,
      celebrityName,
      language
    });

    return {
      success: true,
      files: result.files,
      template: result.template,
      language: result.language,
      message: "Configuration files generated successfully using authorized access."
    };

  } catch (error) {
    console.error('Soul Weaver error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate configuration. Please check your parameters and API key.'
    };
  }
}

/**
 * List available templates
 * @returns {Object} Available templates
 */
function listTemplates() {
  return {
    celebrity: TEMPLATES.celebrity,
    profession: TEMPLATES.profession,
    requiredTools: REQUIRED_TOOLS
  };
}

/**
 * Validate input parameters
 * @param {Object} params - User parameters
 * @returns {Object} Validation result
 */
function validateParams(params) {
  const errors = [];
  
  if (!params.aiName || params.aiName.trim().length === 0) {
    errors.push('aiName is required');
  }
  
  if (params.celebrityName && !TEMPLATES.celebrity.includes(params.celebrityName.toLowerCase())) {
    errors.push('Invalid celebrityName');
  }
  
  if (params.profession && !TEMPLATES.profession.includes(params.profession.toLowerCase())) {
    errors.push('Invalid profession');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Validate API key format
 * @param {string} apiKey - API key to validate
 * @returns {boolean} Validation result
 */
function isValidApiKey(apiKey) {
  // Basic validation: should be non-empty and look like a key
  return apiKey && 
         apiKey.trim().length >= 16 && 
         apiKey.includes('_') && 
         /^[a-zA-Z0-9_\-]+$/.test(apiKey);
}

module.exports = {
  handler,
  listTemplates,
  validateParams,
  isValidApiKey
};