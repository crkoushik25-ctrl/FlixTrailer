import urllib.request
import json
import urllib.parse

def check_movie(title):
    try:
        url = f"http://www.omdbapi.com/?t={urllib.parse.quote(title)}&apikey=trilogy"
        req = urllib.request.urlopen(url)
        data = json.loads(req.read().decode('utf-8'))
        print("OMDb data:", json.dumps(data, indent=2))
    except Exception as e:
        print("Failed:", e)

check_movie("Uttama Villain")
