"""
Scheduler service for autonomous campaign generation
Uses APScheduler to run background jobs for generating campaigns
"""
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime
import sqlite3
from pathlib import Path
import json
import uuid
from typing import Optional

from config import config


class SchedulerService:
    """Background scheduler for autonomous event publicity generation"""
    
    def __init__(self, agent=None, calendar_service=None, db_path: Optional[Path] = None):
        """Initialize scheduler with agent and calendar service"""
        self.agent = agent
        self.calendar_service = calendar_service
        self.db_path = db_path or (Path(__file__).resolve().parents[3] / "aevum_ai.db")
        self.scheduler = BackgroundScheduler()
        
    def start(self):
        """Start the scheduler"""
        if not config.SCHEDULER_ENABLED:
            print("⚠ Scheduler is disabled (SCHEDULER_ENABLED=False)")
            return
            
        try:
            # Add job to run every N hours
            self.scheduler.add_job(
                self.auto_generate_campaigns,
                'interval',
                hours=config.SCHEDULER_INTERVAL_HOURS,
                id='auto_generate_campaigns',
                name='Auto-generate event publicity campaigns',
                replace_existing=True
            )
            self.scheduler.start()
            print(f"✓ Scheduler started - auto-generate every {config.SCHEDULER_INTERVAL_HOURS} hours")
        except Exception as e:
            print(f"⚠ Error starting scheduler: {e}")
    
    def stop(self):
        """Stop the scheduler"""
        try:
            if self.scheduler.running:
                self.scheduler.shutdown()
                print("✓ Scheduler stopped")
        except Exception as e:
            print(f"⚠ Error stopping scheduler: {e}")
    
    def auto_generate_campaigns(self):
        """
        Autonomous job: Fetch high-urgency pre_event events and generate campaigns
        Only generates if no campaign exists for the event yet
        """
        try:
            print(f"\n{'='*70}")
            print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Running auto-generation job...")
            print(f"{'='*70}")
            
            # Sync events from calendar first
            if self.calendar_service:
                self.calendar_service.fetch_and_sync_events()
            
            # Get high-urgency pre_event events
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Find pre_event events with urgency >= 7 and no campaign yet
            cursor.execute("""
                SELECT e.* FROM events e
                WHERE e.lifecycle_stage = 'pre_event' 
                  AND e.urgency_score >= 7
                  AND e.id NOT IN (SELECT event_id FROM campaigns)
                ORDER BY e.urgency_score DESC
                LIMIT 5
            """)
            
            events = [dict(row) for row in cursor.fetchall()]
            print(f"Found {len(events)} high-urgency events ready for campaign generation")
            
            if not events:
                print("No events requiring auto-generation at this time")
                conn.close()
                return
            
            # Generate campaigns for each event
            for event in events:
                try:
                    print(f"\n  → Generating campaign for: {event['title']}")
                    
                    # Call agent to analyze and generate content
                    agent_response = self.agent.analyze_and_generate_content(
                        event=event,
                        lifecycle_stage=event['lifecycle_stage'],
                        urgency_score=event['urgency_score']
                    )
                    
                    # Create campaign record
                    campaign_id = f"camp_{uuid.uuid4().hex[:8]}"
                    cursor.execute("""
                        INSERT INTO campaigns (id, event_id, stage, status, metadata)
                        VALUES (?, ?, ?, ?, ?)
                    """, (
                        campaign_id,
                        event['id'],
                        event['lifecycle_stage'],
                        'draft',
                        json.dumps(agent_response)
                    ))
                    
                    # Store generated content variations
                    content_count = 0
                    for platform_content in agent_response.get('variations', []):
                        platform = platform_content.get('platform', 'email')
                        
                        for var_num in [1, 2, 3]:
                            content_text = platform_content.get(f'variation_{var_num}', '')
                            hashtags = ','.join(platform_content.get('hashtags', []))
                            scheduled_time = platform_content.get('scheduled_time', '09:00')
                            
                            content_id = f"cont_{uuid.uuid4().hex[:8]}"
                            cursor.execute("""
                                INSERT INTO generated_content 
                                (id, campaign_id, platform, content_text, variation_num, tone, hashtags, scheduled_time, status, approval_status)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                content_id,
                                campaign_id,
                                platform,
                                content_text,
                                var_num,
                                agent_response.get('tone', 'professional'),
                                hashtags,
                                scheduled_time,
                                'draft',
                                'pending'
                            ))
                            content_count += 1
                    
                    conn.commit()
                    print(f"    ✓ Generated campaign {campaign_id} with {content_count} content variations")
                    
                except Exception as e:
                    print(f"    ❌ Error generating campaign for {event['title']}: {e}")
                    conn.rollback()
            
            conn.close()
            print(f"\n{'='*70}")
            print("Auto-generation job complete")
            print(f"{'='*70}\n")
            
        except Exception as e:
            print(f"❌ Error in auto-generation job: {e}")


if __name__ == '__main__':
    # Test scheduler initialization
    svc = SchedulerService()
    print(f"Scheduler initialized (enabled={config.SCHEDULER_ENABLED}, interval={config.SCHEDULER_INTERVAL_HOURS}h)")
