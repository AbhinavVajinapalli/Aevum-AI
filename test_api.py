import requests
r = requests.get('http://localhost:8000/api/events')
events = r.json()
eid = events[0]['id'] if events else None
print(f'First event ID: {eid}')
print(f'Title: {events[0]["title"]}')

r2 = requests.post(f'http://localhost:8000/api/campaigns/generate?event_id={eid}')
result = r2.json()
print('\nGeneration result:')
for k, v in result.items():
    if k != 'agent_analysis':
        print(f'  {k}: {v}')
