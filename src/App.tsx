import { RouterProvider } from 'react-router-dom';
import './App.css'
import { router } from './routes/Router';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    console.log("VITE_BACKEND_URL:", import.meta.env.VITE_BACKEND_URL)
  }, [])

  return (
    <>
      <Toaster />

      <RouterProvider router={router} />
    </>
  )
}

export default App
