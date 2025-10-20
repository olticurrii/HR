"""
Keyword extraction utility for feedback analysis
Extracts meaningful terms with stopword filtering and n-gram support
"""
import re
from typing import List, Dict, Tuple
from collections import Counter
from datetime import date


# Common English stopwords
STOPWORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any',
    'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between',
    'both', 'but', 'by', 'can', 'cannot', 'could', 'did', 'do', 'does', 'doing', 'down',
    'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having',
    'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
    'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my',
    'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or',
    'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should',
    'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves',
    'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under',
    'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
    'who', 'whom', 'why', 'will', 'with', 'would', 'you', 'your', 'yours', 'yourself',
    'yourselves'
}


def clean_text(text: str) -> str:
    """Clean and normalize text for keyword extraction"""
    # Convert to lowercase
    text = text.lower()
    # Remove special characters but keep spaces
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_unigrams(text: str, min_length: int = 3) -> List[str]:
    """Extract single words (unigrams) excluding stopwords"""
    words = clean_text(text).split()
    return [
        word for word in words
        if len(word) >= min_length and word not in STOPWORDS
    ]


def extract_bigrams(text: str) -> List[str]:
    """Extract two-word phrases (bigrams)"""
    words = clean_text(text).split()
    # Filter out stopwords first
    filtered_words = [w for w in words if w not in STOPWORDS and len(w) >= 3]
    
    if len(filtered_words) < 2:
        return []
    
    bigrams = []
    for i in range(len(filtered_words) - 1):
        bigram = f"{filtered_words[i]} {filtered_words[i+1]}"
        bigrams.append(bigram)
    
    return bigrams


def extract_trigrams(text: str) -> List[str]:
    """Extract three-word phrases (trigrams)"""
    words = clean_text(text).split()
    # Filter out stopwords first
    filtered_words = [w for w in words if w not in STOPWORDS and len(w) >= 3]
    
    if len(filtered_words) < 3:
        return []
    
    trigrams = []
    for i in range(len(filtered_words) - 2):
        trigram = f"{filtered_words[i]} {filtered_words[i+1]} {filtered_words[i+2]}"
        trigrams.append(trigram)
    
    return trigrams


def extract_keywords(
    text: str,
    include_bigrams: bool = True,
    include_trigrams: bool = False,
    min_word_length: int = 3
) -> List[str]:
    """
    Extract all keywords from text with configurable n-gram support
    
    Args:
        text: Input text to analyze
        include_bigrams: Whether to include 2-word phrases
        include_trigrams: Whether to include 3-word phrases
        min_word_length: Minimum length for single words
    
    Returns:
        List of extracted keywords
    """
    keywords = []
    
    # Always extract unigrams
    keywords.extend(extract_unigrams(text, min_word_length))
    
    # Optionally add bigrams
    if include_bigrams:
        keywords.extend(extract_bigrams(text))
    
    # Optionally add trigrams
    if include_trigrams:
        keywords.extend(extract_trigrams(text))
    
    return keywords


def get_top_keywords(
    texts: List[str],
    top_n: int = 20,
    include_bigrams: bool = True,
    include_trigrams: bool = False
) -> List[Tuple[str, int]]:
    """
    Extract and rank top keywords from multiple texts
    
    Args:
        texts: List of text strings to analyze
        top_n: Number of top keywords to return
        include_bigrams: Whether to include 2-word phrases
        include_trigrams: Whether to include 3-word phrases
    
    Returns:
        List of (keyword, frequency) tuples sorted by frequency
    """
    all_keywords = []
    
    for text in texts:
        if text:
            keywords = extract_keywords(text, include_bigrams, include_trigrams)
            all_keywords.extend(keywords)
    
    # Count frequencies
    keyword_counts = Counter(all_keywords)
    
    # Return top N
    return keyword_counts.most_common(top_n)


def categorize_keywords_by_sentiment(
    feedback_items: List[Dict],
    top_n: int = 20
) -> Dict[str, List[Tuple[str, int]]]:
    """
    Categorize top keywords by sentiment context
    
    Args:
        feedback_items: List of dicts with 'content' and 'sentiment' keys
        top_n: Number of top keywords per sentiment
    
    Returns:
        Dict with sentiment keys ('positive', 'negative', 'neutral') and keyword lists
    """
    positive_texts = []
    negative_texts = []
    neutral_texts = []
    
    for item in feedback_items:
        content = item.get('content', '')
        sentiment = item.get('sentiment', 'neutral')
        
        if sentiment == 'positive':
            positive_texts.append(content)
        elif sentiment == 'negative':
            negative_texts.append(content)
        else:
            neutral_texts.append(content)
    
    return {
        'positive': get_top_keywords(positive_texts, top_n),
        'negative': get_top_keywords(negative_texts, top_n),
        'neutral': get_top_keywords(neutral_texts, top_n)
    }


def categorize_keywords_by_department(
    feedback_items: List[Dict],
    top_n: int = 20
) -> Dict[str, List[Tuple[str, int]]]:
    """
    Categorize top keywords by department
    
    Args:
        feedback_items: List of dicts with 'content' and 'department' keys
        top_n: Number of top keywords per department
    
    Returns:
        Dict with department names as keys and keyword lists as values
    """
    dept_texts = {}
    
    for item in feedback_items:
        content = item.get('content', '')
        department = item.get('department', 'Unknown')
        
        if department not in dept_texts:
            dept_texts[department] = []
        dept_texts[department].append(content)
    
    result = {}
    for dept, texts in dept_texts.items():
        result[dept] = get_top_keywords(texts, top_n)
    
    return result

