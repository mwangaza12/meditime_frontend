import { RouterProvider } from 'react-router-dom';
import './App.css';
import { router } from './routes/Router';
import { Toaster } from 'react-hot-toast';
import { Chatbot } from './pages/complaints/Chatbot';

function App() {
  return (
    <>
      <Toaster />
      <RouterProvider router={router} />

      {/* ✅ Global Chatbot */}
      <Chatbot />
    </>
  );
}

export default App;
