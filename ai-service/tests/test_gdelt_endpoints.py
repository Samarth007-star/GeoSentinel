import time
import httpx

def test_gdelt_formats():
    print("Testing GDELT endpoints with different configurations...")
    time.sleep(6)
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
    }

    # Test 1: Simple query with mode=artlist
    url1 = "https://api.gdeltproject.org/api/v2/doc/doc?query=climate&mode=artlist&maxrecords=5&format=json"
    try:
        r = httpx.get(url1, headers=headers, timeout=15.0)
        print("Test 1 status:", r.status_code)
        if r.status_code == 200:
            print("Test 1 success! Articles:", len(r.json().get("articles", [])))
        else:
            print("Test 1 text:", r.text[:150])
    except Exception as e:
        print("Test 1 error:", e)

    time.sleep(6)
    # Test 2: mode=timelinevol
    url2 = "https://api.gdeltproject.org/api/v2/doc/doc?query=India&mode=timelinevol&format=json"
    try:
        r = httpx.get(url2, headers=headers, timeout=15.0)
        print("Test 2 status:", r.status_code)
        if r.status_code == 200:
            print("Test 2 success! Data keys:", r.json().keys() if isinstance(r.json(), dict) else "list")
        else:
            print("Test 2 text:", r.text[:150])
    except Exception as e:
        print("Test 2 error:", e)

if __name__ == "__main__":
    test_gdelt_formats()
