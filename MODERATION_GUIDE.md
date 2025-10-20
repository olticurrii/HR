# Content Moderation Guide

## Overview

The content moderation system automatically scans feedback for inappropriate content and BLOCKS submissions that violate policies.

---

## 🚨 How Moderation Works

### When Moderation is ON

1. **User submits feedback**
2. **Content is sanitized** (whitespace, line breaks cleaned)
3. **Moderation scan runs:**
   - Checks profanity wordlist
   - Detects severe violations
   - Analyzes tone (all caps, excessive punctuation)
4. **If violations found:**
   - ❌ Feedback is REJECTED
   - ❌ NOT saved to database
   - ❌ User receives error message
   - ℹ️ User can revise and resubmit
5. **If clean:**
   - ✅ Feedback saved normally
   - ✅ Sentiment analysis applied
   - ✅ Notifications sent

### When Moderation is OFF

- All content passes through
- No scanning performed
- All feedback saved (even inappropriate)
- Use with caution!

---

## 📋 Moderation Rules

### Level 1: Profanity (BLOCKED)

Common profanity words:
- damn, hell, crap
- stupid, idiot, dumb
- hate, suck
- shit, fuck, ass, bitch, bastard
- And more...

**Action:** Immediate rejection  
**Error:** "Content blocked by moderation: Contains profanity: [word]"

---

### Level 2: Severe Violations (BLOCKED)

Threats and harassment:
- threat, kill, violence
- harassment, attack
- harm, hurt, destroy
- hate crime

**Action:** Immediate rejection  
**Error:** "Content blocked by moderation: Severe violation: contains inappropriate content"

---

### Level 3: Tone Analysis (BLOCKED)

**All Caps:**
- Text longer than 20 characters
- Entirely in UPPERCASE
- Interpreted as shouting/aggression

**Example:** "THIS IS UNACCEPTABLE!!!"  
**Action:** Rejected  
**Error:** "Content blocked by moderation: All caps text (possible aggressive tone)"

**Excessive Exclamation:**
- More than 5 exclamation marks
- Indicates excessive emotion

**Example:** "This is terrible!!!!!!"  
**Action:** Rejected  
**Error:** "Content blocked by moderation: Excessive exclamation marks"

---

## 🎯 User Experience

### Submission Blocked

When feedback is blocked, user sees:

```
❌ Content blocked by moderation: Contains profanity: damn

Please revise your feedback to use professional language.
```

**User can:**
1. Edit their feedback
2. Remove inappropriate content
3. Resubmit

**Feedback is NOT saved** - user must fix and retry.

---

### Reply Blocked

When a reply is blocked:

```
❌ Content blocked by moderation: All caps text (possible aggressive tone)

Please revise your reply to use professional language.
```

Same behavior as main feedback - must revise and resubmit.

---

## 🔧 Configuration

### Enable/Disable Moderation

**Settings Page** (`/settings`):
1. Scroll to "Feedback System Features"
2. Find "Enable Content Moderation"
3. Toggle ON/OFF
4. Click "Save All Settings"

**Default:** ON (recommended)

### When to Disable

Consider disabling if:
- Small, trusted team (<10 people)
- Culture emphasizes open communication
- Too many false positives
- Testing feedback system

**⚠️ Warning:** Disabling removes all content protection!

---

## 📝 Customizing the Wordlist

### Location

`backend/app/utils/moderation.py`

### Add Words

```python
# Add to profanity list
PROFANITY_LIST = [
    'damn', 'hell', 'crap',
    'your_word_here',  # Add here
]

# Add to severe violations
SEVERE_VIOLATIONS = [
    'threat', 'kill', 'violence',
    'your_severe_word',  # Add here
]
```

### Remove False Positives

If a word causes too many false positives, remove it from the list:

```python
# Before
PROFANITY_LIST = [
    'damn', 'hell', 'crap',
]

# After (removed 'crap')
PROFANITY_LIST = [
    'damn', 'hell',
]
```

**Restart backend** after changes.

---

## 🧪 Testing Moderation

### Test Content Examples

**Should PASS (clean):**
- "Great work on the project!"
- "I think we could improve the process"
- "The deadline is tight but manageable"

**Should BLOCK (profanity):**
- "This is damn difficult"
- "The project is shit"
- "Stop being stupid"

**Should BLOCK (severe):**
- "I will kill this project"
- "This is a threat to the team"
- "Violence is the answer"

**Should BLOCK (tone):**
- "THIS IS COMPLETELY UNACCEPTABLE!!!" (all caps)
- "Why?!!!!!! This makes no sense!!!!!" (excessive !)

### Manual Test

```bash
cd backend
python3 -c "
from app.utils.moderation import check_content_moderation

tests = [
    'Great work!',
    'This is damn good',
    'STOP DOING THIS!!!',
    'This project is shit',
]

for content in tests:
    is_flagged, reason = check_content_moderation(content)
    status = '🚫 BLOCKED' if is_flagged else '✅ ALLOWED'
    print(f'{status}: \"{content}\"')
    if is_flagged:
        print(f'   Reason: {reason}')
"
```

---

## 📊 Moderation Statistics

### Tracking Blocked Content

Currently, blocked content is NOT saved to database. To track moderation statistics, you could:

**Option 1:** Log to file
```python
# In moderation.py
if is_flagged:
    with open('moderation_log.txt', 'a') as f:
        f.write(f"{datetime.now()}: Blocked - {flagged_reason}\n")
```

**Option 2:** Create blocked_feedback table
```sql
CREATE TABLE blocked_feedback (
    id INTEGER PRIMARY KEY,
    author_id INTEGER,
    content TEXT,
    blocked_reason VARCHAR,
    blocked_at TIMESTAMP
);
```

---

## 🎓 Best Practices

### For Admins

1. **Start with moderation ON** - Protect your culture
2. **Monitor false positives** - Adjust wordlist if needed
3. **Communicate policy** - Let users know moderation exists
4. **Review periodically** - Update wordlist quarterly
5. **Balance protection vs freedom** - Don't be too strict

### For Users

1. **Be professional** - Use workplace-appropriate language
2. **Avoid all caps** - It's interpreted as shouting
3. **Limit exclamation marks** - Max 2-3 is enough
4. **If blocked** - Revise and resubmit
5. **No workarounds** - Respect the policy

---

## 🔄 Moderation Workflow

```
User submits feedback
       ↓
Is moderation ON?
  ├─ NO → Save feedback ✅
  └─ YES → Scan content
            ├─ Clean → Save feedback ✅
            └─ Flagged → BLOCK ❌
                        ↓
                  Show error to user
                        ↓
                  User revises content
                        ↓
                  Resubmit
```

---

## ⚠️ Important Notes

### Moderation is Immediate

- No review queue
- No "pending approval"
- Instant block if violation found
- User sees error immediately

### No Saved Flagged Items

Since we BLOCK instead of FLAG:
- Blocked content is NOT in database
- No admin review queue needed
- Users must fix before submitting
- Clean submissions only

### Previous Implementation

The old implementation (before this update) would:
- Save feedback with `is_flagged = true`
- Allow admin to review later
- Unflag after review

**New implementation:**
- Blocks submission entirely
- Never saved to database
- User must fix before it's accepted

---

## 🛡️ Security Benefits

### Protection Against

- ✅ Profanity in feedback
- ✅ Threatening language
- ✅ Harassment
- ✅ Aggressive tone
- ✅ Spam (excessive punctuation)
- ✅ Inappropriate submissions

### Culture Benefits

- ✅ Maintains professional environment
- ✅ Prevents toxic feedback
- ✅ Encourages constructive communication
- ✅ Reduces HR issues
- ✅ Protects company culture

---

## 🔮 Future Enhancements

Possible improvements:
- [ ] ML-based moderation (more sophisticated)
- [ ] Context-aware scanning
- [ ] Severity levels (warn vs block)
- [ ] Whitelist for allowed words in context
- [ ] Admin override/bypass
- [ ] Moderation statistics dashboard
- [ ] Custom wordlists per organization

---

## 📞 Support

### If Legitimate Feedback is Blocked

1. **Revise language** - Use professional terms
2. **Avoid trigger words** - Check wordlist
3. **Contact admin** - Report false positives
4. **Admin can** - Disable moderation temporarily or adjust wordlist

### Adjusting Sensitivity

**Too strict:**
- Remove words from PROFANITY_LIST
- Increase all caps threshold
- Increase punctuation threshold

**Too lenient:**
- Add words to lists
- Decrease thresholds
- Add more severe violations

---

## 📈 Summary

Content Moderation:

✅ **ON by default** - Protects culture  
✅ **Blocks inappropriate content** - Doesn't save  
✅ **Clear error messages** - Users know why  
✅ **Customizable wordlist** - Adjust as needed  
✅ **Can be disabled** - If needed  

**Status:** Fully implemented and working  
**Behavior:** BLOCK (not flag) inappropriate content  
**User Impact:** Must revise blocked submissions  
**Admin Control:** Toggle in Settings page

---

**Last Updated:** October 18, 2025  
**Status:** ✅ Complete  
**Recommendation:** Keep ON for professional environment

