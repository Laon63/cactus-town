import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CreateTownPage from "./pages/CreateTownPage";
import TownPage from "./pages/TownPage";
import CactusPage from "./pages/CactusPage";
import "./App.css";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="town/create" element={<CreateTownPage />} />
        <Route path="town/:townId" element={<TownPage />} />
        <Route path="cactus/:cactusId" element={<CactusPage />} />
      </Route>
    </Routes>
  );
}

export default App;
