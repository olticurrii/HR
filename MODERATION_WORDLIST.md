# Moderation Wordlist - Complete Reference

## ⚠️ Content Warning

This document contains explicit profanity and offensive language for technical documentation purposes.

---

## 📊 Current Filter Statistics

**Total Blocked Words:** ~100+ words and phrases
- **Profanity List:** ~50 words
- **Severe Violations:** ~50 words  
- **Additional Rules:** All caps, excessive punctuation

---

## 🔴 Severe Violations (Immediately Blocked)

These words trigger immediate rejection with "Severe violation" message:

### Violence & Threats
- kill, murder, die, death, dead
- threat, threaten, violence, violent, attack
- harm, hurt, destroy, assault, abuse
- suicide, rape, molest, torture

### Harassment & Bullying
- harassment, harass
- bully, bullying
- stalk, stalking

### Hate Speech & Discrimination
- hate crime
- racist, racism
- sexist, sexism
- bigot, discrimination, discriminate

### Slurs (All Categories)
- Racial/ethnic slurs
- LGBTQ+ slurs
- Disability slurs
- Religious slurs

**Total:** ~50 severe violation terms

---

## 🟡 Profanity (Blocked)

These words trigger rejection with "Contains inappropriate language" message:

### Mild Profanity
- damn, damned, dammit
- hell
- crap, crappy

### Strong Profanity
- shit, shitty, bullshit
- fuck, fucking, fucked, fucker
- ass, asshole
- bitch, bastard
- piss, pissed

### Derogatory Terms
- stupid, idiot, idiotic
- dumb, dumbass
- moron, moronic
- retard, retarded
- loser, pathetic

### Sexual/Inappropriate
- dick, cock
- pussy, cunt
- whore, slut
- porn, sex, sexy, horny
- penis, vagina
- balls, boobs, tits, butt

### Extreme Language
- motherfucker
- son of a bitch
- goddamn
- jesus christ (as profanity)

### Common Variations
- fck, fuk, fvck
- sh1t, a$$, b1tch
- wtf, stfu, gtfo, ffs

### Negative Terms
- hate, suck, sucks, sucked
- worst, terrible, awful

**Total:** ~50 profanity terms

---

## 🛡️ Technical Implementation

### Word Boundary Detection

The filter uses regex word boundaries (`\b`) to avoid false positives:

**Blocked:**
- "You are an **ass**" ← Matches `\bass\b`
- "This **sucks**" ← Matches `\bsucks\b`

**Allowed:**
- "Let me **class**ify this" ← `\bass\b` doesn't match "class"
- "I will **assess** the situation" ← `\bass\b` doesn't match "assess"
- "In **Massachusetts**" ← No match

### Case Insensitive

All matching is case-insensitive:
- "FUCK" ← Blocked
- "fuck" ← Blocked
- "FuCk" ← Blocked

### Phrase Matching

Multi-word phrases use substring matching:
- "hate crime" ← Exact phrase required
- "son of a bitch" ← Exact phrase required

---

## 🔧 Additional Rules

### All Caps Filter

**Triggers:** Text longer than 20 characters in ALL CAPS

**Blocked:**
- "THIS IS COMPLETELY UNACCEPTABLE"
- "WHY ARE YOU DOING THIS"
- "STOP IMMEDIATELY"

**Allowed:**
- "I love it!" (too short)
- "This is great work" (not all caps)
- "NASA" or "CEO" (common acronyms in mixed case)

### Excessive Punctuation

**Triggers:** More than 5 of the same punctuation mark

**Blocked:**
- "What?!?!?!?!" (6 marks)
- "NO!!!!!!" (6 exclamation marks)
- "Why??????" (6 question marks)

**Allowed:**
- "This is great!!!" (3 marks)
- "Really? Are you sure?" (2 marks)

---

## 🎯 Examples

### ✅ Content That PASSES

```
✅ "Great work on the project!"
✅ "I think we could improve the process"
✅ "The deadline is challenging"
✅ "I disagree with this approach"
✅ "Let's discuss this further"
✅ "This needs more work"
✅ "I'm concerned about the timeline"
✅ "Please reconsider this decision"
```

### ❌ Content That's BLOCKED

```
❌ "This is shit" → Profanity
❌ "You're being stupid" → Derogatory
❌ "What the fuck" → Strong profanity
❌ "THIS IS UNACCEPTABLE" → All caps
❌ "Why?!?!?!?!" → Excessive punctuation
❌ "I will kill this idea" → Threat word
❌ "This sucks" → Profanity
❌ "You're an idiot" → Derogatory
```

---

## 🔧 Customization Guide

### Add More Words

Edit `/backend/app/utils/moderation.py`:

```python
PROFANITY_LIST = [
    # Existing words...
    'your_custom_word',
    'another_word',
]

SEVERE_VIOLATIONS = [
    # Existing words...
    'your_severe_word',
]
```

### Remove False Positives

If a word causes issues, remove it:

```python
# Remove "hell" if it causes false positives
PROFANITY_LIST = [
    # 'hell',  ← Commented out or removed
    'damn', 'crap',  # Keep others
]
```

### Adjust Sensitivity

```python
# Make all caps filter more lenient
if len(content) > 50 and content.isupper():  # Changed from 20 to 50

# Make punctuation filter stricter
if content.count('!') > 3:  # Changed from 5 to 3
```

**Important:** Restart backend after changes!

---

## 📊 View Current Wordlist (Admin)

### API Endpoint

```bash
GET /api/v1/admin/feedback/moderation-wordlist
```

### Example Request

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/admin/feedback/moderation-wordlist
```

### Response

```json
{
  "profanity_count": 50,
  "severe_violations_count": 50,
  "total_blocked_words": 100,
  "profanity_list": ["ass", "asshole", "awful", ...],
  "severe_violations": ["abuse", "assault", "attack", ...],
  "categories": {
    "mild_profanity": ["damn", "hell", "crap"],
    "strong_profanity": ["shit", "fuck", "ass", "bitch"],
    "derogatory": ["stupid", "idiot", "moron"],
    "sexual": ["sexual content filtered"],
    "severe": ["threats", "violence", "hate speech", "slurs"]
  }
}
```

---

## 🎮 How to Test

### Test Script

```bash
cd backend
python3 test_feedback_enhancements.py
```

Expected output shows BLOCKED items:
```
🚫 BLOCKED: 'This is damn good work!'
   Reason: Content blocked by moderation: Contains inappropriate language (1 violations)
```

### Manual Testing

1. Go to `/feedback`
2. Try submitting these:
   - "This project is shit" ← Should block
   - "You're fucking awesome" ← Should block
   - "THIS IS RIDICULOUS" ← Should block (all caps)
   - "Why?!?!?!?!" ← Should block (excessive !)
   - "Great work!" ← Should pass

---

## 🔄 Enabling/Disabling

### In Settings Page

1. Go to `/settings`
2. Find "Enable Content Moderation"
3. **Toggle OFF** to disable all filtering
4. **Toggle ON** to enable filtering
5. Save changes

### Effect of Toggle

**When ON:**
- All ~100 words blocked
- Tone analysis active
- Punctuation checks active

**When OFF:**
- No word checking
- All content allowed
- No blocking

---

## 🎓 Best Practices

### Recommended Configuration

**For Professional Environment:**
```
✅ Enable Content Moderation: ON
✅ Include strong profanity
✅ Include all severe violations
✅ Keep tone analysis active
```

**For Casual Environment:**
```
✅ Enable Content Moderation: ON
❌ Remove mild profanity (damn, hell, crap)
✅ Keep severe violations
✅ Keep tone analysis
```

**For Small Trusted Team:**
```
❌ Enable Content Moderation: OFF
   (Monitor feedback manually)
```

---

## ⚡ Performance

- **Fast:** Regex matching is very quick
- **Overhead:** < 10ms per submission
- **Scalable:** Handles any content length
- **Memory:** Minimal (wordlist cached)

---

## 📝 Maintenance

### Regular Review

**Monthly:**
- Review if any violations getting through
- Check for false positives
- Update wordlist if needed

**Quarterly:**
- Review all blocked attempts (if logging added)
- Adjust sensitivity
- Update documentation

### When to Update

Update wordlist when:
- New slang emerges
- False positives reported
- Cultural context changes
- Inappropriate content gets through
- Team feedback indicates issues

---

## 🚨 Emergency Override

If moderation is blocking legitimate feedback:

**Quick Fix:**
1. Admin goes to Settings
2. Toggle "Enable Content Moderation" OFF
3. Save
4. User can submit
5. Review and fix wordlist
6. Re-enable moderation

---

## 📞 Support

### For Users

**If your feedback is blocked:**
1. Read the error message
2. Remove inappropriate words
3. Use professional language
4. Resubmit

**Common fixes:**
- "This sucks" → "This needs improvement"
- "This is damn difficult" → "This is very challenging"
- "You're stupid" → "I disagree with this approach"
- "THIS IS WRONG" → "This is incorrect"

### For Admins

**View blocked words:**
```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/v1/admin/feedback/moderation-wordlist
```

**Adjust wordlist:**
Edit `backend/app/utils/moderation.py`

---

## 📈 Summary

**Blocked Content Categories:**

1. ⚫ **Severe** (~50 words)
   - Threats, violence, hate speech, slurs

2. 🔴 **Strong Profanity** (~20 words)
   - F-word, S-word, and variations

3. 🟡 **Derogatory** (~15 words)
   - Stupid, idiot, moron, etc.

4. 🟠 **Sexual** (~15 words)
   - Inappropriate sexual content

5. ⚪ **Tone** (Rules-based)
   - All caps, excessive punctuation

**Total Protection:** ~100 blocked terms + tone rules

**Implementation:**
- ✅ Word boundary detection (no false positives)
- ✅ Case insensitive
- ✅ Phrase matching
- ✅ Admin viewable
- ✅ Easily customizable

**Status:** Comprehensive protection active 🛡️

---

**Last Updated:** October 18, 2025  
**Wordlist Version:** 1.0  
**Coverage:** Comprehensive  
**False Positives:** Minimal (word boundaries)

