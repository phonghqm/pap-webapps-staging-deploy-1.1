export function isDeniedMicro(signaling_state: any) {
  return (
    signaling_state.reason === 'WebRTC_NotAllowedError' &&
    signaling_state.code === -1
  );
}

export function checkMicrophone() {
  return navigator.mediaDevices
    .getUserMedia({
      audio: true,
      video: false,
    })
    .then(stream => {
      stream.getTracks().forEach((track: any) => track?.stop());
      return true;
    })
    .catch(() => false);
}

export function checkCamera() {
  return navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: true,
    })
    .then(stream => {
      stream.getTracks().forEach((track: any) => track?.stop());
      return true;
    })
    .catch(() => false);
}

export function getPermission() {
  return Promise.allSettled([
    checkCamera(),
    checkMicrophone(),
    navigator.permissions.query({ name: 'geolocation' }),
  ])
    .then(([camera, microphone, geolocation]) => {
      const cam = camera.status === 'fulfilled' ? camera.value : null;
      const mic = microphone.status === 'fulfilled' ? microphone.value : null;
      const geo =
        geolocation.status === 'fulfilled' ? geolocation.value.state : 'error';
      const user_agent = navigator.userAgent;
      return {
        micro_permission: mic !== null ? (mic ? 'granted' : 'denied') : 'error',
        camera_permission:
          cam !== null ? (cam ? 'granted' : 'denied') : 'error',
        geo_permission: geo,
        user_agent,
      };
    })
    .catch(err => {
      console.log('Error when get permission:', err);
    });
}
