"""
Database configuration and schema setup for Aevum AI
"""
import sqlite3
from pathlib import Path

# Use SQLite in Aevum AI folder
DB_PATH = Path(__file__).parent.parent / "aevum_ai.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"


def init_db():
    """Initialize database schema with performance indexes"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            start_time DATETIME,
            end_time DATETIME,
            event_type TEXT DEFAULT 'workshop',
            lifecycle_stage TEXT DEFAULT 'pre_event',
            urgency_score INTEGER DEFAULT 5,
            synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS campaigns (
            id TEXT PRIMARY KEY,
            event_id TEXT NOT NULL,
            stage TEXT NOT NULL,
            status TEXT DEFAULT 'draft',
            metadata TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (event_id) REFERENCES events(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS generated_content (
            id TEXT PRIMARY KEY,
            campaign_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            content_text TEXT NOT NULL,
            variation_num INTEGER DEFAULT 1,
            tone TEXT DEFAULT 'professional',
            hashtags TEXT,
            scheduled_time DATETIME,
            status TEXT DEFAULT 'draft',
            approval_status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS approvals (
            id TEXT PRIMARY KEY,
            content_id TEXT NOT NULL,
            approved_by TEXT,
            approved_at DATETIME,
            comments TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (content_id) REFERENCES generated_content(id)
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS analytics (
            id TEXT PRIMARY KEY,
            platform TEXT NOT NULL,
            content_id TEXT,
            status TEXT DEFAULT 'sent',
            sent_at DATETIME,
            response_status INTEGER,
            response_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (content_id) REFERENCES generated_content(id)
        )
    """)
    
    # Create indexes for frequently queried columns
    # Events indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_lifecycle_stage ON events(lifecycle_stage)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC)")
    
    # Campaigns indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_campaigns_event_id ON campaigns(event_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_campaigns_event_status ON campaigns(event_id, status)")
    
    # Generated content indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_campaign_id ON generated_content(campaign_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_platform ON generated_content(platform)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_approval_status ON generated_content(approval_status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_status ON generated_content(status)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_campaign_platform ON generated_content(campaign_id, platform)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_content_approval_created ON generated_content(approval_status, created_at DESC)")
    
    # Approvals indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_approvals_content_id ON approvals(content_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_approvals_created_at ON approvals(created_at DESC)")
    
    # Analytics indexes
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_platform ON analytics(platform)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_content_id ON analytics(content_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_analytics_status ON analytics(status)")
    
    conn.commit()
    conn.close()
    print(f"✓ Database initialized at {DB_PATH}")


if __name__ == "__main__":
    init_db()
