 # NYT Strands-Inspired Game
This project is a word game inspired by the New York Times' Strands game, built with React, Vite, and shadcn ui components styled with Tailwind CSS. It features daily themes, hints, and a dynamic grid interface, offering a unique twist on the popular word puzzle format.

## Demo
 [Strands Demo](https://github.com/user-attachments/assets/3108b4bb-60cb-4755-9fd6-a1bb63588809)

 ## Features
 - Daily changing themes and word sets
 - Interactive grid for word selection
 - Hint system with progress tracking
 - Responsive design for various screen sizes
 - Spangram detection and special highlighting
 ## Tech Stack
 -  Frontend: React with Vite
 -  UI Components: shadcn ui
 -  Styling: Tailwind CSS
 -  Web Scraping: Selenium WebDriver
 -  CI CD: GitHub Actions
 -  Deployment: Cloudflare
 ## Getting Started
 ### Prerequisites
 - Node.js (version 14 or later)
 - npm or yarn
 ### Installation
 1. Clone the repository:
     git clone https:  github.com your-username wordle-inspired-game.git     
 2. Navigate to the project directory:
     cd wordle-inspired-game     
 3. Install dependencies:
     npm install     
or
     yarn install     
 ### Running the Development Server
Start the development server:
  npm run dev  
or
  yarn dev  
The application will be available at  http:  localhost:5173 (or another port if 5173 is in use).
 ## Project Structure
 -   src: Contains the main React application code
 -   scripts: Houses scraping scripts and data processing utilities
 -   public: Static assets
 -   components: Reusable React components, including shadcn ui components
 ## Deployment
This project uses GitHub Actions for CI CD and deploys to Cloudflare. The workflow is defined in  .github workflows main.yml.
To deploy:
 1. Push changes to the  main branch
 2. GitHub Actions will automatically build and deploy the project to Cloudflare
 ## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
 ## License
This project is licensed under the  MIT License.
 ## Acknowledgements
 -  New York Times Strands - Inspiration for this game
 -  Vite
 -  React
 -  shadcn ui
 -  Tailwind CSS
 -  Selenium
 -  Cloudflare
