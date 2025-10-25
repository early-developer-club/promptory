import sys
import os

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import crud

def retag_all_conversations():
    """Iterate through all conversations and apply the tagging logic."""
    db: Session = SessionLocal()
    try:
        print("Fetching all conversations...")
        conversations = db.query(models.Conversation).all()
        total = len(conversations)
        print(f"Found {total} conversations to retag.")

        for i, conversation in enumerate(conversations):
            print(f"Processing conversation {i + 1}/{total} (ID: {conversation.id})...", end='')
            # Clear existing tags to avoid duplicates if run multiple times
            conversation.tags.clear()
            crud.extract_and_add_tags(db, conversation)
            print(" Done.")

        print("\nRetagging process completed successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    retag_all_conversations()
