import json
import requests
import time

def load_words(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data['words'].split(', ')

def get_definition(word):
    url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        if data and isinstance(data, list) and len(data) > 0:
            meanings = data[0].get('meanings', [])
            if meanings:
                definition = meanings[0].get('definitions', [{}])[0].get('definition', '')
                return definition
    return None

def fetch_and_store_definitions():
    words_file = 'WORDS.json'
    define_file = 'DEFINE.json'

    words = load_words(words_file)
    definitions = {}

    for word in words:
        print(f"Fetching definition for {word}...")
        definition = get_definition(word)
        if definition:
            # Mask the word in the definition if it appears
            masked_definition = definition.replace(word.lower(), '_' * len(word))
            definitions[word] = masked_definition
        else:
            definitions[word] = f"A {len(word)}-letter word related to channel surfing."
        time.sleep(1)  # Be nice to the API

    with open(define_file, 'w') as file:
        json.dump(definitions, file, indent=2)

    print(f"Definitions stored in {define_file}")

if __name__ == "__main__":
    fetch_and_store_definitions()