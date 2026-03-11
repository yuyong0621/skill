# Changelog

All notable changes to the Soul Weaver skill will be documented in this file.

## [1.0.0] - 2026-03-09
### Security Features
- **API Key Requirement**: All requests require valid API keys obtained through official application
- **Manual Verification**: Users must first manually verify configurations on official website
- **Permission Minimization**: Only `network` permission required (no file access)
- **Authorization Flow**: Clear manual verification and key application process

### Documentation
- All descriptions emphasize authorized access requirements
- Detailed security notes and usage process documentation
- Clear manual verification requirement before automated access
- Removed misleading "replace system files" terminology

### Technical Improvements
- API key validation with proper error messages
- No automatic triggering capabilities
- Enhanced parameter validation for security
- Comprehensive input sanitization

### User Experience
- **Simplified Configuration**: Users directly provide API key parameter (no config files)
- **Registration Guidance**: Explicit registration and login requirements for API key acquisition
- **Unified Website Reference**: Single official website reference: https://sora2.wboke.com

---

## 🛡️ Security Compliance

This release is designed to meet ClawHub Security requirements:
- ✅ Requires official API key application with registration and login
- ✅ Mandates manual verification before automated access  
- ✅ Uses only authorized API endpoints
- ✅ No automatic triggering - requires explicit user invocation
- ✅ Minimal permissions (network only)
- ✅ No system file modifications
- ✅ Clear user communication about access requirements

## 🔧 Technical Specifications

- **Permissions**: network only
- **API Access**: Requires registration, login, and official key application
- **Node.js**: >= 18.0.0
- **Dependencies**: None (zero external dependencies)
- **Invocation**: Manual only, no automatic triggers

## 📝 Usage Requirements

Users must:
1. Visit https://sora2.wboke.com
2. Register an account and login
3. Apply for API access in account dashboard
4. Use obtained API key when invoking the skill