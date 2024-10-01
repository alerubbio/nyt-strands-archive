from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import json
import sys

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    
    service = Service(ChromeDriverManager().install())
    
    try:
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"Error setting up Chrome driver: {str(e)}")
        sys.exit(1)

def extract_words(data):
    words = []
    if isinstance(data, dict):
        for value in data.values():
            words.extend(extract_words(value))
    elif isinstance(data, list):
        for item in data:
            if isinstance(item, list) and len(item) > 1 and isinstance(item[1], str):
                words.append(item[1])
            else:
                words.extend(extract_words(item))
    return words

def scrape_words(url):
    driver = setup_driver()
    driver.get(url)
    
    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.TAG_NAME, "astro-island"))
        )
        
        astro_island = driver.find_element(By.TAG_NAME, "astro-island")
        props = astro_island.get_attribute("props")
        if props:
            props_json = json.loads(props)
            all_words = extract_words(props_json)
            return datetime.now().strftime("%Y-%m-%d"), all_words
        
        return None, []
    
    except Exception as e:
        print(f"Error: Could not find the words. {str(e)}")
        import traceback
        traceback.print_exc()
        return None, []
    
    finally:
        driver.quit()

def save_to_json(data, filename):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Data saved to {filename}")

def main():
    date = datetime.now().strftime("%Y-%m-%d")
    url = f"https://www.strands.today/strands-game/?date={date}"
    print(url)
    
    print(f"Scraping words from {url}...")
    game_date, all_words = scrape_words(url)
    
    if game_date:
        data = {
            "date": game_date,
            "words": sorted(list(set(all_words)))  # Remove duplicates and sort
        }
        
        filename = f"HINTS_{game_date}.json"
        save_to_json(data, filename)
    else:
        print("Failed to scrape words.")

if __name__ == "__main__":
    main()