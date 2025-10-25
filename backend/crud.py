from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import models
import schemas

# --- Stop Words Configuration ---
# Add any words you want to exclude from keyword extraction here.
korean_stop_words = set(["것", "수", "저", "등", "때", "그", "이", "것임", "있음", "대해", "언제", "설명", "근거", "예시"])
english_stop_words = set(["i", "me", "my", "etc", "www", "com", "is", "a", "the", "of", "to", "in", "for", "on", "with"])


def get_user_by_email(db: Session, email: str):
    """Fetch a single user by their email address."""
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user_data: schemas.UserCreate):
    """
    Create a new user in the database.
    This is a generic user creation function.
    For OAuth, we might adapt this or use a similar one.
    """
    # In a real app with passwords, you'd hash the password here.
    # fake_hashed_password = user_data.password + "notreallyhashed"
    db_user = models.User(
        email=user_data.email,
        # hashed_password=fake_hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_or_create_user(db: Session, user_info: dict):
    """
    Get a user from the DB by email, or create them if they don't exist.
    This is specifically for the OAuth flow where we trust the user info from Google.
    """
    user = get_user_by_email(db, email=user_info['email'])
    if user:
        return user
    
    # User doesn't exist, create a new one.
    new_user = models.User(
        email=user_info['email'],
        provider="google",
        provider_id=user_info.get('sub') # Google's unique ID for the user
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def get_conversations(db: Session, user_id: int, query: Optional[str] = None, date: Optional[str] = None) -> List[models.Conversation]:
    """Fetch conversations for a user, with optional search query and date filters."""
    q = db.query(models.Conversation).filter(models.Conversation.owner_id == user_id)

    if query:
        search_query = f"%{query}%"
        q = q.filter(
            (
                models.Conversation.prompt.ilike(search_query) |
                models.Conversation.response.ilike(search_query) |
                models.Conversation.tags.any(models.Tag.name.ilike(search_query))
            )
        )
    
    if date:
        q = q.filter(func.date(models.Conversation.conversation_timestamp) == date)

    return q.order_by(models.Conversation.conversation_timestamp.desc()).all()

def get_tag_frequency(db: Session, user_id: int):
    """Calculate the frequency of each tag for a given user."""
    tag_frequency = db.query(
        models.Tag.name,
        func.count(models.Conversation.id).label('count')
    ).join(
        models.conversation_tag_association, models.Tag.id == models.conversation_tag_association.c.tag_id
    ).join(
        models.Conversation, models.Conversation.id == models.conversation_tag_association.c.conversation_id
    ).filter(
        models.Conversation.owner_id == user_id
    ).group_by(
        models.Tag.name
    ).order_by(
        func.count(models.Conversation.id).desc()
    ).limit(10).all() # Limit to top 10 tags

    return [{"name": name, "count": count} for name, count in tag_frequency]


def get_or_create_tag(db: Session, tag_name: str) -> models.Tag:
    """Get a tag by name, or create it if it doesn't exist."""
    tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
    if tag:
        return tag
    
    new_tag = models.Tag(name=tag_name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag


def extract_and_add_tags(db: Session, conversation: models.Conversation):
    """Extract keywords, prioritizing words from the prompt."""
    import re
    from collections import Counter
    import nltk
    from konlpy.tag import Okt

    def get_nouns(text: str):
        """Helper function to get both Korean nouns and English words from a text using KoNLPy."""
        from konlpy.tag import Okt
        okt = Okt()
        
        all_words = []
        
        # Use okt.pos to get words with their POS tags, normalizing and stemming
        tagged_words = okt.pos(text, norm=True, stem=True)
        
        for word, pos in tagged_words:
            # Collect Korean nouns (more than one character and not in stop words)
            if pos == 'Noun' and len(word) > 1 and word not in korean_stop_words:
                all_words.append(word)
            # Collect English words (which are tagged as 'Alpha')
            elif pos == 'Alpha' and len(word) > 2 and word.lower() not in english_stop_words:
                all_words.append(word.lower())

        return all_words

    prompt_nouns = get_nouns(conversation.prompt)
    response_nouns = get_nouns(conversation.response)

    # Give higher weight to prompt nouns
    weighted_nouns = (prompt_nouns * 5) + response_nouns

    if not weighted_nouns:
        return

    word_counts = Counter(weighted_nouns)
    tags_to_add = [word for word, _ in word_counts.most_common(5)]

    # --- Add tags to conversation ---
    for word in tags_to_add:
        tag = get_or_create_tag(db, word)
        if tag not in conversation.tags:
            conversation.tags.append(tag)
    
    db.commit()

