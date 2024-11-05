import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const VideoCall = () => {
  const location = useLocation();
  const { roomName } = location.state || {}; // Room name must be passed here
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    if (!roomName) {
      console.error('Room name is required to start a call');
      return;
    }

    // Initialize the Jitsi iframe
    const domain = 'meet.jit.si';
    const options = {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        enableWelcomePage: false,
      },
      interfaceConfigOverwrite: {
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      },
    };
    
    const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);

    // Clean up the Jitsi iframe when the component unmounts
    return () => jitsiApi?.dispose();
  }, [roomName]);

  if (!roomName) {
    return <p>Error: Room name is missing.</p>;
  }

  return (
    <div style={{ height: '100vh', width: '100%' }} ref={jitsiContainerRef}></div>
  );
};

export default VideoCall;


