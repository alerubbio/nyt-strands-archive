import './App.css'
import Grid from './components/Grid'

function App() {
  return (
    <div className="min-h-screen gameWhite text-bgBlack flex flex-col">
      <header className="py-6 px-4 bg-blue-500 dark:bg-blue-700">
        <h1 className="text-4xl font-bold text-left text-white">NYT Strands Fan Game</h1>
      </header>
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Grid />
        </div>
      </main>
      <footer className="py-6 px-4 bg-gray-200 dark:bg-gray-800 mt-auto">
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          © 2024 Strands Clone. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

export default App