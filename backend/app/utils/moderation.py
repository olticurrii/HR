"""
Content moderation utilities
Comprehensive profanity and inappropriate content filter
"""
from typing import Tuple, Optional
import re

# Comprehensive profanity wordlist
PROFANITY_LIST = [
    # Mild profanity
    'damn', 'damned', 'dammit', 'hell', 'crap', 'crappy',
    
    # Strong profanity (common)
    'shit', 'shitty', 'bullshit', 'fuck', 'fucking', 'fucked', 'fucker',
    'ass', 'asshole', 'bitch', 'bastard', 'piss', 'pissed',
    
    # Derogatory terms
    'stupid', 'idiot', 'idiotic', 'dumb', 'dumbass', 'moron', 'moronic',
    'retard', 'retarded', 'loser', 'pathetic',
    
    # Sexual/inappropriate
    'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut',
    'porn', 'sex', 'sexy', 'horny', 'penis', 'vagina',
    
    # Body parts (inappropriate usage)
    'balls', 'boobs', 'tits', 'butt',
    
    # Extreme language
    'motherfucker', 'son of a bitch', 'goddamn', 'jesus christ',
    
    # Common variations/misspellings
    'fck', 'fuk', 'fvck', 'sh1t', 'a$$', 'b1tch',
    'wtf', 'stfu', 'gtfo', 'ffs',
    
    # Additional negative terms
    'hate', 'suck', 'sucks', 'sucked', 'worst', 'terrible', 'awful',
]

# Severe violations (threats, harassment, discrimination)
SEVERE_VIOLATIONS = [
    # Violence & threats
    'kill', 'murder', 'die', 'death', 'dead',
    'threat', 'threaten', 'violence', 'violent', 'attack',
    'harm', 'hurt', 'destroy', 'assault', 'abuse',
    
    # Harassment & bullying  
    'harassment', 'harass', 'bully', 'bullying', 'stalk', 'stalking',
    
    # Hate speech
    'hate crime', 'racist', 'racism', 'sexist', 'sexism',
    'bigot', 'discrimination', 'discriminate',
    
    # Slurs (racial, ethnic, religious)
    'nigger', 'nigga', 'chink', 'spic', 'kike', 'wetback',
    'raghead', 'towelhead', 'terrorist', 'jihad',
    
    # LGBTQ+ slurs
    'fag', 'faggot', 'dyke', 'tranny',
    
    # Disability slurs
    'cripple', 'spaz', 'psycho', 'retarded', 'retarded', 'moron', 'moronic',
    
    # Extreme actions
    'suicide', 'rape', 'molest', 'torture',
]

def check_content_moderation(content: str) -> Tuple[bool, Optional[str]]:
    """
    Check content for moderation violations.
    Uses word boundaries to avoid false positives.
    
    Returns:
        (is_flagged, reason)
        - is_flagged: True if content should be blocked
        - reason: Description of why it was blocked
    """
    if not content:
        return False, None
    
    content_lower = content.lower()
    
    # Check for severe violations first (highest priority)
    for word in SEVERE_VIOLATIONS:
        # Use word boundaries for single words, substring match for phrases
        if ' ' in word:
            # Phrase - use substring
            if word in content_lower:
                return True, f"Severe violation: contains inappropriate content"
        else:
            # Single word - use word boundary
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, content_lower):
                return True, f"Severe violation: contains inappropriate content"
    
    # Check for profanity
    found_profanity = []
    for word in PROFANITY_LIST:
        # Use word boundaries to avoid false positives
        # e.g., "assassin" won't match "ass", "classic" won't match "ass"
        if ' ' in word:
            # Phrase - use substring
            if word in content_lower:
                found_profanity.append(word)
        else:
            # Single word - use word boundary
            pattern = r'\b' + re.escape(word) + r'\b'
            if re.search(pattern, content_lower):
                found_profanity.append(word)
    
    if found_profanity:
        # Don't reveal the actual words in the error message for privacy
        return True, f"Contains inappropriate language ({len(found_profanity)} violations)"
    
    # Check for all caps (possible shouting/aggression)
    if len(content) > 20 and content.isupper():
        return True, "All caps text (possible aggressive tone)"
    
    # Check for excessive exclamation marks
    if content.count('!') > 5:
        return True, "Excessive exclamation marks"
    
    # Check for excessive question marks
    if content.count('?') > 5:
        return True, "Excessive question marks"
    
    return False, None


def sanitize_content(content: str) -> str:
    """
    Clean/sanitize content before saving.
    Removes excessive whitespace, normalizes line breaks.
    """
    # Remove leading/trailing whitespace
    content = content.strip()
    
    # Normalize line breaks
    content = content.replace('\r\n', '\n')
    
    # Remove excessive consecutive line breaks (max 2)
    while '\n\n\n' in content:
        content = content.replace('\n\n\n', '\n\n')
    
    return content

