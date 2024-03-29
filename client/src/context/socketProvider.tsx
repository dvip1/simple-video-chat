import {
  JSXElementConstructor,
  ReactNode,
  createContext,
  useContext,
  useMemo,
} from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

interface SocketProviderProps {
  children: ReactNode;
}

const SocketProvider: JSXElementConstructor<SocketProviderProps> = (props) => {
  const socket: Socket = useMemo(() => io("http://localhost:3001"), []);
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
