from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests


# Function to fetch and parse webpage
def crawl_website(url):
    try:
        # Send HTTP request with a user-agent to avoid being blocked
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        html = response.text

        # Parse HTML with BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')

        # Extract SEO elements
        title = soup.title.string.strip() if soup.title else 'No title found'
        meta_desc = soup.find('meta', attrs={'name': re.compile('description', re.I)})
        meta_desc = meta_desc['content'].strip() if meta_desc and 'content' in meta_desc.attrs else 'No meta description found'
        meta_keywords = soup.find('meta', attrs={'name': re.compile('keywords', re.I)})
        meta_keywords = meta_keywords['content'].strip() if meta_keywords and 'content' in meta_keywords.attrs else 'No meta keywords found'
        canonical = soup.find('link', attrs={'rel': re.compile('canonical', re.I)})
        canonical = canonical['href'] if canonical and 'href' in canonical.attrs else 'No canonical link found'
        viewport = soup.find('meta', attrs={'name': re.compile('viewport', re.I)})
        viewport = viewport['content'].strip() if viewport and 'content' in viewport.attrs else 'No viewport meta found'
        h1 = soup.find('h1').get_text().strip() if soup.find('h1') else 'No H1 tag found'
        images_without_alt = len([img for img in soup.find_all('img') if not img.get('alt') or img.get('alt').strip() == ''])

        # Extract keywords from body text
        body_text = soup.get_text(separator=' ', strip=True)
        keywords = extract_keywords(body_text)

        # Fetch robots.txt
        #robots_url = urljoin(url, '/robots.txt')
        #robots = fetch_robots(robots_url)

        return {
            'title': title,
            'meta_description': meta_desc,
            'meta_keywords': meta_keywords,
            'canonical': canonical,
            'viewport': viewport,
            'h1': h1,
            'images_without_alt': images_without_alt,
            'keywords': keywords,
            #'robots': robots,
            'status': 'success'
        }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

# Function to extract keywords
def extract_keywords(text):
    words = re.findall(r'\b\w+\b', text.lower())
    freq = {}
    for word in words:
        if len(word) > 3:  # Ignore short words
            freq[word] = freq.get(word, 0) + 1
    # Sort by frequency and take top 10
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:10]
    return ', '.join(word for word, count in sorted_words) or 'No keywords extracted'

# Function to fetch robots.txt
#def fetch_robots(url):
    #try:
        #headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        #response = requests.get(url, headers=headers, timeout=5)
        #response.raise_for_status()
        #return response.text
    ##except:
        #return 'Not found or inaccessible'

# Route for the dashboard
@app.route('/')
def index():
    return render_template('index.html')

# API endpoint for crawling
@app.route('/crawl', methods=['POST'])
def crawl():
    url = request.json.get('url')
    if not url:
        return jsonify({'status': 'error', 'message': 'No URL provided'})
    result = crawl_website(url)
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)