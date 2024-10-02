import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def get_url():
    today = datetime.now()
    formatted_date = today.strftime("%B-%d").lower()
    year = today.year
    return f"https://www.strands.today/strands-today-answers-{formatted_date}-{year}/"

def scrape_data():
    url = get_url()
    print(f"Scraping URL: {url}")
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the main div containing all the information
        hints_div = soup.find('div', id='hints-for-today')
        if not hints_div:
            raise ValueError("Could not find 'hints-for-today' div")
        
        # Extract the theme
        theme_div = hints_div.find('div', class_='bg-green-200')
        if not theme_div:
            raise ValueError("Could not find theme div")
        theme = theme_div.find('p', class_='font-bold text-[#007bff]').text.strip()
        print(f"Theme: {theme}")
        
        # Extract the spangram
        spangram_div = hints_div.find_all('div', class_='bg-blue-100')[-1]
        if not spangram_div:
            raise ValueError("Could not find spangram div")
        spangram = spangram_div.find('p', class_='font-bold text-[#007bff]').text.split("- ")[-1]
        print(f"Spangram: {spangram}")
        
        # Extract the list of words from the ul tag
        words_div = hints_div.find_all('div', class_='bg-green-100')[-1]
        if not words_div:
            raise ValueError("Could not find words div")
        words_ul = words_div.find('ul')
        if not words_ul:
            raise ValueError("Could not find words list")
        
        # Extract individual words from the ul
        words = [li.text.strip() for li in words_ul.find_all('li')]
        words_string = ", ".join(words)
        print(f"Words: {words_string}")
        
        # Prepare the data to be saved
        scraped_data = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "theme": theme,
            "spangram": spangram,
            "words": words_string
        }
        
        # Save the scraped data to a JSON file
        with open('WORDS.json', 'w') as f:
            json.dump(scraped_data, f, indent=2)
        
        print("Scraping completed successfully")
        print(json.dumps(scraped_data, indent=2))  # Print the scraped data for verification
    except Exception as e:
        print(f"An error occurred while scraping: {e}")
        print("HTML content:")
        print(soup.prettify())  # Print full HTML for debugging
        # Create a default or error data set
        default_data = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "theme": "Error occurred",
            "spangram": "Error",
            "words": "Error, Scraping, Failed"
        }
        with open('WORDS.json', 'w') as f:
            json.dump(default_data, f, indent=2)
        print("Default data saved due to scraping error")

if __name__ == "__main__":
    scrape_data()