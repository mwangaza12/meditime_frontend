import { createBrowserRouter } from "react-router-dom";
import { Home } from "../pages/Home";
import Error from "../pages/Error";
import { Contact } from "../pages/Contact";
import {About} from "../pages/About";
import { Register } from "../pages/auth/Register";
import { Login } from "../pages/auth/Login";
import EmailVerification from "../pages/auth/EmailVerification";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <Error />
  },
  {
    path: "/contact",
    element: <Contact />,
    errorElement: <Error />
  },
  {
    path: "/about",
    element: <About />,
    errorElement: <Error />
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <Error />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <Error />
  },
  {
    path: "/email-verification",
    element: <EmailVerification />,
    errorElement: <Error />
  }
])