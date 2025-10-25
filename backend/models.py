from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

# Association Table for Many-to-Many relationship between Conversations and Tags
conversation_tag_association = Table('conversation_tag', Base.metadata,
    Column('conversation_id', Integer, ForeignKey('conversations.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True) # For non-OAuth logins
    provider = Column(String, nullable=True) # e.g., 'google', 'github'
    provider_id = Column(String, nullable=True, unique=True)
    conversations = relationship("Conversation", back_populates="owner")

class Conversation(Base):
    __tablename__ = 'conversations'
    id = Column(Integer, primary_key=True, index=True)
    source = Column(String, index=True)
    prompt = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    conversation_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    owner_id = Column(Integer, ForeignKey('users.id'))
    owner = relationship("User", back_populates="conversations")
    tags = relationship("Tag", secondary=conversation_tag_association, back_populates="conversations")

class Tag(Base):
    __tablename__ = 'tags'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    conversations = relationship("Conversation", secondary=conversation_tag_association, back_populates="tags")
