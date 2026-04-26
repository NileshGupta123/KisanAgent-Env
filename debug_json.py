import json
import codecs

try:
    with codecs.open(r'C:\tmp\reset_res.json', 'r', 'utf-16') as f:
        data = json.load(f)
    print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")
    # Try alternate encoding
    try:
        with open(r'C:\tmp\reset_res.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(json.dumps(data, indent=2))
    except:
        print("Failed both utf-16 and utf-8")
