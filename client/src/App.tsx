import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import DashBoard from "./components/dashboard";
import SocketProvider from "./context/socketProvider";
import RoomPage from "./components/roompage";

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashBoard />} />
          <Route path="/room/:roomID" element={<RoomPage />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}
