from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import sys
import json

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    
    # Use webdriver_manager to install and manage ChromeDriver
    service = Service(ChromeDriverManager().install())
    
    try:
        driver = webdriver.Chrome(service=service, options=chrome_options)
        return driver
    except Exception as e:
        print(f"Error setting up Chrome driver: {str(e)}")
        sys.exit(1)

def scrape_strands_game(date):
    url = f"https://www.strands.today/strands-game/?date={date}"
    
    driver = setup_driver()
    driver.get(url)
    
    try:
        WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.ID, "board"))
        )
        
        board_div = driver.find_element(By.ID, "board")
        
        board = []
        for y in range(8):
            row = []
            for x in range(6):
                selector = f'div[data-x="{x}"][data-y="{y}"] .relative'
                try:
                    letter = board_div.find_element(By.CSS_SELECTOR, selector).text
                    row.append(letter)
                except:
                    row.append(' ')
            board.append(row)
        
        return board
    
    except Exception as e:
        print(f"Error: Could not find the game board. {str(e)}")
        return None
    
    finally:
        driver.quit()

def print_board(board):
    if board is None:
        return
    for row in board:
        print(' '.join(row))

def export_to_json(board, date):
    data = {
        "date": date,
        "board": board
    }
    
    # Try different possible locations for the data directory
    possible_paths = [
        '../data/BOARD.json',
        './data/BOARD.json',
        'BOARD.json'
    ]
    
    for filename in possible_paths:
        try:
            os.makedirs(os.path.dirname(filename), exist_ok=True)
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"Board exported to {filename}")
            return
        except IOError as e:
            print(f"Could not write to {filename}: {e}")
    
    print("Failed to export board to any of the attempted locations.")

def main():
    if len(sys.argv) > 1:
        date = sys.argv[1]
    else:
        date = datetime.now().strftime("%Y-%m-%d")
    
    print(f"Scraping Strands game board for {date}...")
    board = scrape_strands_game(date)
    
    if board:
        print(f"Strands game board for {date}:")
        print_board(board)
        export_to_json(board, date)
    else:
        print("Failed to retrieve the game board.")

if __name__ == "__main__":
    main()