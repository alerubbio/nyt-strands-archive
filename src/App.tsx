import './App.css'
import Grid from './components/Grid'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br bg-indigo-100  dark:from-gray-900 dark:to-indigo-900 text-gray-800 dark:text-gray-200 flex flex-col">
      <header className="py-8 px-4 bg-gradient-to-r from-[#2e346d] to-[#4754d1]">
        <div className="container mx-auto flex items-center">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl font-bold text-indigo-600">S</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">NYT Strands Fan Game</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-12 flex-grow relative">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-opacity-50 dark:bg-opacity-30 pointer-events-none" 
               style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`}}></div>
          <Grid />
        </div>
      </main>
      <footer className="py-6 px-4 bg-indigo-100 dark:bg-gray-800 mt-auto">
        <div className="container mx-auto flex flex-col sm:flex-row justify-center items-center">
          <p className="text-center text-sm text-indigo-600 dark:text-indigo-300 mx-auto">
            © 2024 Strands Game. All rights reserved.
          </p>
          <p className="text-center text-sm text-indigo-600 dark:text-indigo-300 mt-2 sm:mt-0 mx-0">
            Created by <a href="https://www.hackfol.io/alejandro" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-800 dark:hover:text-indigo-100 transition-colors">Alejandro</a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App