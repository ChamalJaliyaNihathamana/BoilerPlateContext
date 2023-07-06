import React from "react";
import "./App.css";
import { AuthProvider } from "./context/AuthProvider";
import MainRoutes from "./routes/routes";

interface AppProps {}

const App: React.FunctionComponent<AppProps> = () => {
  
  return (
    <AuthProvider>
      <MainRoutes />
    </AuthProvider>
  );
};

export default App;
