# OpenAI Integration Setup Guide

## Overview
The resume AI features (UC-047, UC-049, UC-050) are now fully integrated with OpenAI's GPT-3.5-turbo model for real AI-powered content generation.

## Setup Instructions

### Step 1: Get Your OpenAI API Key

1. Go to [OpenAI API Platform](https://platform.openai.com/account/api-keys)
2. Sign in with your OpenAI account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy the key (you won't be able to see it again!)

### Step 2: Create .env File

1. In the `backend/` directory, create a new file named `.env`
2. Copy the contents of `.env.example`:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Replace `sk-your-api-key-here` with your actual API key
4. Save the file

**Important:** Never commit `.env` to Git! It's already in `.gitignore`.

### Step 3: Verify Installation

The following are already installed:
- ✅ `openai` (v2.7.2) - OpenAI Python SDK
- ✅ `python-dotenv` (v1.1.1) - Environment variable loading

No additional packages needed!

### Step 4: Restart Backend Server

Kill any running backend processes and restart:

```bash
cd backend
.venv/Scripts/python main.py
```

The server will now load your OpenAI API key on startup.

## How It Works

### Architecture

```
User clicks AI Button in ResumeEditor
    ↓
Frontend calls aiResumeAPI endpoint
    ↓
Backend route handler in resumes.py receives request
    ↓
AIGenerator.method() (UC-047, UC-049, or UC-050)
    ↓
PromptTemplates.format_*_prompt() - Variable substitution
    ↓
OpenAI API Call (gpt-3.5-turbo)
    ↓
JSON Response Parsing
    ↓
Return structured suggestions to frontend
    ↓
AISuggestionPanel displays results
    ↓
User accepts/rejects suggestions
    ↓
Resume state updated, user saves
```

### Prompt Engineering

Each AI feature uses structured prompts with **variable substitution**:

#### UC-047: Generate Resume Content
- Inputs: User's name, summary, skills, experience + Job title, company, description, requirements
- Outputs: `summary`, `bullets`, `skills` as JSON
- Model: gpt-3.5-turbo, temp=0.7, max_tokens=1500

#### UC-049: Optimize Skills
- Inputs: User's skills + Job description and requirements
- Outputs: `skills_to_emphasize`, `recommended_skills`, `missing_critical_skills`, `optimization_score`
- Model: gpt-3.5-turbo, temp=0.7, max_tokens=1200

#### UC-050: Tailor Experience
- Inputs: User's experience entries + Job details
- Outputs: `experiences` array with `variants` (3 variations per experience)
- Model: gpt-3.5-turbo, temp=0.7, max_tokens=2000

### System Messages

Each request includes a system message that shapes AI behavior:

```python
# UC-047
"You are an expert resume writer. Respond with valid JSON only."

# UC-049
"You are an ATS expert. Respond with valid JSON only."

# UC-050
"You are a career coach. Respond with valid JSON only."
```

## Error Handling

The system gracefully handles OpenAI API errors:

1. **Missing API Key**: Error message prompts user to set `OPENAI_API_KEY`
2. **Invalid JSON Response**: Attempts to parse markdown-wrapped JSON
3. **API Errors**: Caught and returned as user-friendly error messages
4. **Timeout**: FastAPI default timeout handling

## Cost Estimates

GPT-3.5-turbo is very affordable:

- **Input**: ~$0.0005 per 1K tokens
- **Output**: ~$0.0015 per 1K tokens

Example costs per feature call:
- UC-047: ~$0.01-0.03 (1500 tokens output max)
- UC-049: ~$0.01-0.02 (1200 tokens output max)
- UC-050: ~$0.02-0.05 (2000 tokens output max)

Total per resume optimization: **$0.05-0.10**

## Files Modified/Created

### Backend
- ✅ `services/ai_generator.py` - Updated with OpenAI integration
- ✅ `services/prompt_templates.py` - Created with structured prompts
- ✅ `routes/resumes.py` - Three new endpoints already added
- ✅ `main.py` - Updated to load .env variables
- ✅ `.env.example` - Template for API key

### Frontend
- ✅ `api/aiResumeAPI.js` - API client for endpoints
- ✅ `components/resumes/JobPostingSelector.jsx` - Job selection UI
- ✅ `components/resumes/AISuggestionPanel.jsx` - Suggestions display
- ✅ `pages/resumes/ResumeEditor.jsx` - AI button integration
- ✅ `styles/resumes.css` - Styling for AI features

## Testing the Implementation

### Manual Test Flow

1. **Create a Resume**
   - Go to Resumes page
   - Create a new resume with sample data
   - Add experience, skills, summary

2. **Create a Job Posting**
   - Go to Jobs page
   - Create a sample job posting with title and description

3. **Test UC-047: Generate Content**
   - In ResumeEditor, click "✨ Generate Content"
   - Select the job posting
   - Verify suggestions appear in sidebar
   - Accept suggestions and save

4. **Test UC-049: Optimize Skills**
   - Click "📊 Optimize Skills"
   - Select the job posting
   - Review skill recommendations
   - Accept and save

5. **Test UC-050: Tailor Experience**
   - Click "🎯 Tailor Experience"
   - Select the job posting
   - Review experience variations
   - Accept and save

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable not set"

**Solution:** Make sure your `.env` file exists in the `backend/` directory and contains:
```
OPENAI_API_KEY=sk-xxxxx...
```

### Error: "Failed to parse AI response as JSON"

**Possible causes:**
1. API returned non-JSON response
2. API rate limited or errored
3. JSON parsing failed on malformed response

**Solution:** Check backend logs for actual API response

### Slow Response / Timeout

**Cause:** OpenAI API is slow or overloaded
**Solution:** The frontend has built-in loading states. Users will see "Generating suggestions..."

### High API Costs

**Solutions:**
1. Switch to `gpt-3.5-turbo-16k` for complex resume (cheaper for longer context)
2. Reduce `max_tokens` in api_generator.py
3. Batch requests during low-traffic hours
4. Implement caching for repeated job postings

## Next Steps

### Optional Enhancements

1. **Caching**: Cache similar job postings to avoid duplicate API calls
2. **Batch Processing**: Queue AI requests instead of real-time
3. **Model Upgrade**: Switch to GPT-4 for better quality (costs ~10x more)
4. **Custom Prompts**: Let users customize AI behavior per generation
5. **Cost Tracking**: Log API usage and costs per user

### Monitoring

Set up monitoring for:
- API response times
- Error rates
- Cost tracking
- Token usage by feature

## Support & Documentation

- **OpenAI API Docs**: https://platform.openai.com/docs
- **Python SDK**: https://github.com/openai/openai-python
- **Prompt Engineering**: https://platform.openai.com/docs/guides/prompt-engineering

---

**Status:** ✅ Fully integrated and ready to use!
