import httpx

def test_gdelt_headers():
    url = "https://api.gdeltproject.org/api/v2/doc/doc?query=India&mode=artlist&format=json"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
    }
    r = httpx.get(url, headers=headers, timeout=15.0)
    print("Status:", r.status_code)
    print("Headers:", dict(r.headers))
    print("Body snippet:", r.text[:250])

if __name__ == "__main__":
    test_gdelt_headers()
