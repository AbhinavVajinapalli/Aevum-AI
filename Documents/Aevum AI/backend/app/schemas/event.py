"""
Pydantic schemas for request/response validation
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


# ========== Event Schemas ==========
class EventSchema(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    event_type: str
    lifecycle_stage: str
    urgency_score: int


# ========== Campaign Schemas ==========
class CampaignSchema(BaseModel):
    id: str
    event_id: str
    stage: str
    status: str
    metadata: Optional[Dict[str, Any]] = None


# ========== Content Schemas ==========
class ContentSchema(BaseModel):
    id: str
    campaign_id: str
    platform: str
    content_text: str
    variation_num: int
    tone: str
    hashtags: Optional[str] = None
    scheduled_time: Optional[str] = None
    status: str
    approval_status: str


# ========== Approval Schemas ==========
class ApprovalSchema(BaseModel):
    id: str
    content_id: str
    approved_by: str
    approved_at: datetime
    comments: Optional[str] = None
