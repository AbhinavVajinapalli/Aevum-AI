from app.agents.event_publicity_agent import EventPublicityAgent
import pprint
agent=EventPublicityAgent()
mock_event={'id':'mock_1','title':'Test Event: AI Workshop','description':'An advanced workshop on AI techniques.','start_time':'2026-05-10T10:00:00','end_time':'2026-05-10T12:00:00','event_type':'workshop','lifecycle_stage':'pre_event','urgency_score':8}
res=agent.analyze_and_generate_content(mock_event,'pre_event',8)
pprint.pprint(res)
print('--- Attempt draft send (should not actually send) ---')
agent.send_email_draft('test@example.com', mock_event, variation_index=1)
