
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Landing from "../pages/Landing";
import GamePage from "../pages/GamePage";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
