// src/context/SocketContext.js
import React, { createContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';

export const SocketContext = createContext();

export const SocketProvider = ({ children, isAuthenticated, userName }) => {
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socket = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      socket.current = io('http://localhost:4000', {
        transports: ['websocket', 'polling'],
      });

      socket.current.on('connect', () => {
        console.log('Socket connected:', socket.current.id);
        setIsSocketConnected(true);

        // Emit the username to the server after connection
        if (userName) {
          socket.current.emit('set-username', userName);
        }
      });

      socket.current.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsSocketConnected(false);
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [isAuthenticated, userName]);

  return (
    <SocketContext.Provider value={{ socket: socket.current, isSocketConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

SocketProvider.propTypes = {
  children: PropTypes.node.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  userName: PropTypes.string, // Optional if userName isn't always available
};
