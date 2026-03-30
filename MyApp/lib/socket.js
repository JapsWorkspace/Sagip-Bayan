import { io } from "socket.io-client";

const SOCKET_URL = "http://10.208.46.51:8000"; // same as your backend

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: false,
});