import {
  AudioFilled,
  AudioMutedOutlined,
  PhoneFilled,
} from '@ant-design/icons';
import { Button } from 'antd';
import { useAppSelector } from 'appRedux';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StringeeClient } from 'stringee';
import styled from 'styled-components';
import { checkIsMobile, convertSecondToTimer } from 'utils/helpers';
import Ringing from '../components/Ring';
import { useCountTime } from 'hooks';
import { getPermission, isDeniedMicro } from 'utils/call';
import apis from '../apis';
import { EVENT_NAME, logGAEvent } from 'utils/googleAnalytics';
import { ERROR_LOG_TYPE, sendErrorLog } from 'utils/errors';
import { shallowEqual } from 'react-redux';

export default function VideoCallContainer() {
  const { callToken, phone } = useAppSelector(state => state.auth);
  const done = useAppSelector(state => state.submit.done, shallowEqual);

  const client = useMemo(() => new StringeeClient(), []);
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [ringing, setRinging] = useState(false);
  const [calling, setCalling] = useState(false);
  const [muted, setMuted] = useState(false);
  const [timer, start, clear] = useCountTime();

  const playHangupSound = useCallback(() => {
    const hangup = document.getElementById('hangup') as HTMLAudioElement;
    hangup?.play()?.catch(err => {
      sendErrorLog(ERROR_LOG_TYPE.SOUND_PERMISSION, { phone, error: err });
    });
  }, [phone]);

  const settingCallEvent = useCallback(
    (
      call: any,
      remoteVideo: HTMLVideoElement,
      localVideo: HTMLVideoElement
    ) => {
      call.on('addremotestream', (stream: any) => {
        if (remoteVideo) {
          remoteVideo.srcObject = null;
          remoteVideo.srcObject = stream;
        }
      });

      call.on('addlocalstream', (stream: any) => {
        if (localVideo) {
          localVideo.srcObject = null;
          localVideo.srcObject = stream;
        }
      });

      call.on('signalingstate', (state: any) => {
        if (isDeniedMicro(state)) {
          getPermission().then(user_device =>
            apis.createUserDevice({
              ...user_device,
              pap_submitted_application_id: done?.pap_submitted_application_id,
            })
          );
        }
        if (state.code === 6 || state.code === 5) {
          playHangupSound();
          if (localVideo) localVideo.srcObject = null;
          if (remoteVideo) remoteVideo.srcObject = null;
          setCalling(false);
          setRinging(false);
          setMuted(false);
          setCurrentCall(null);
          clear();
        }
      });

      // call.on('mediastate', function () {
      //   // console.log('mediastate ', state);
      // });

      // call.on('info', function () {
      //   // console.log('on info:' + JSON.stringify(info));
      // });

      // call.on('addremotetrack', () => {
      //   // console.log('remotetrack', track);
      // });

      call.on('otherdevice', (msg: any) => {
        if (msg.type == 'CALL2_STATE') {
          if (msg.code == 200 || msg.code == 486) {
            setRinging(false);
            setCurrentCall(false);
          }
        }
      });
    },
    [clear, done?.pap_submitted_application_id, playHangupSound]
  );

  const answerCall = () => {
    setRinging(false);
    setCalling(true);
    if (currentCall) {
      start();
      currentCall.answer(() => {});
    }
  };

  const rejectCall = () => {
    setRinging(false);
    setCalling(false);
    if (currentCall) {
      currentCall.reject(() => {});
    }
  };

  const hangupCall = () => {
    logGAEvent(EVENT_NAME.BTN_VIDEO_CALL_END);
    setCalling(false);
    setMuted(false);
    playHangupSound();
    if (currentCall) {
      clear();
      currentCall.hangup(() => {});
    }
  };

  const mute = () => {
    setMuted(state => {
      if (currentCall) {
        currentCall.mute(!state);
      }
      return !state;
    });
  };

  const swicthCamera = () => {
    if (checkIsMobile() && currentCall) {
      currentCall.switchCamera();
    }
  };

  useEffect(() => {
    if (callToken) {
      client.connect(callToken);

      // client.on('connect', () => {
      //   // console.log('connected');
      // });

      // client.on('disconnect', () => {
      //   // console.log('disconnect');
      // });

      // client.on('authen', () => {
      //   // console.log(response);
      // });

      // client.on('otherdeviceauthen', () => {
      //   // console.log('otherdeviceauthen: ', data);
      // });

      client.on('incomingcall2', (incomingcall: any) => {
        setCurrentCall(incomingcall);
        incomingcall.ringing();
        const remoteVideo = document.getElementById(
          'remoteVideo'
        ) as HTMLVideoElement;
        const localVideo = document.getElementById(
          'localVideo'
        ) as HTMLVideoElement;
        settingCallEvent(incomingcall, remoteVideo, localVideo);
        setRinging(true);
      });
    }
    return () => {
      client.disconnect();
    };
  }, [client, callToken, settingCallEvent]);

  useEffect(() => {
    return () => {
      if (calling && currentCall) {
        setCalling(false);
        currentCall.hangup(() => {});
      }
    };
  }, [calling, currentCall]);

  useEffect(() => {
    const unloadCallback = () => {
      if (calling && currentCall) {
        currentCall.hangup();
      }
    };

    window.addEventListener('beforeunload', unloadCallback);
    return () => {
      window.removeEventListener('beforeunload', unloadCallback);
    };
  }, [calling, currentCall]);

  useEffect(() => {
    if (calling) {
      logGAEvent(EVENT_NAME.PAGE_VIDEO_CALL);
    }
  }, [calling]);

  return (
    <VideoWrapper style={{ display: ringing || calling ? 'block' : 'none' }}>
      <Ringing answer={answerCall} reject={rejectCall} open={ringing} />
      <Container>
        <audio id='hangup'>
          <source src='/hangup.mp3' type='audio/mpeg' />
        </audio>
        <RemoteVideo
          controls={false}
          playsInline
          id='remoteVideo'
          autoPlay
          style={{ display: calling ? 'block' : 'none' }}
        />
        <LocalVideo
          controls={false}
          playsInline
          onClick={swicthCamera}
          id='localVideo'
          autoPlay
          muted
          style={{ display: calling ? 'block' : 'none' }}
        />
        {calling && (
          <ContentVideoContainer>
            <Timer>{convertSecondToTimer(timer)}</Timer>
            <ButtonContainer>
              <RedButton shape='circle' size='large' onClick={hangupCall}>
                <PhoneFilled style={{ rotate: '-135deg' }} />
              </RedButton>
              <GrayButton
                onClick={mute}
                shape='circle'
                size='large'
                muted={muted}
              >
                {!muted ? <AudioFilled /> : <AudioMutedOutlined />}
              </GrayButton>
            </ButtonContainer>
          </ContentVideoContainer>
        )}
      </Container>
    </VideoWrapper>
  );
}

const VideoWrapper = styled.div`
  position: relative;
`;

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: white;
  z-index: 999;
  top: 0;
  left: 0;
`;

const LocalVideo = styled.video`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 20%;
  height: auto;
  border-radius: 10px;
  border: 1px solid white;
  background-color: black;

  @media screen and (max-width: 540px) {
    width: 30%;
    aspect-ratio: 3/5;
  }
`;
const RemoteVideo = styled.video`
  width: 100vw;
  height: 100dvh;
  min-height: 100%;
  background-color: #ccc;
  position: absolute;
  top: 0;
`;

const ContentVideoContainer = styled.div`
  position: absolute;
  top: 70dvh;
  width: 100%;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
`;

const RedButton = styled(Button)`
  background-color: ${props => props.theme.red};
  color: white !important;
  outline: none;
  border: none;
  min-width: 60px !important;
  height: 60px !important;
  font-size: 22px !important;
  padding: 10px !important;

  &:hover,
  &:active {
    background-color: ${props => props.theme.red};
    color: white;
    outline: none;
    border: none;
  }
`;

interface IGrayButton {
  muted: boolean;
}

const GrayButton = styled(Button)<IGrayButton>`
  outline: none;
  border-color: white !important;
  background-color: ${props => (props.muted ? 'white' : 'rgba(0, 0, 0, 0.5)')};
  color: ${props => (props.muted ? props.theme.grey8 : 'white')} !important;
  min-width: 60px !important;
  height: 60px !important;
  font-size: 22px !important;
  padding: 10px !important;

  &:hover,
  &:active {
    background-color: ${props =>
      props.muted ? props.theme.grey1 : props.theme.grey};
  }
`;

const Timer = styled.p`
  text-align: center;
  color: ${props => props.theme.green};
  font-size: 1rem;
`;
