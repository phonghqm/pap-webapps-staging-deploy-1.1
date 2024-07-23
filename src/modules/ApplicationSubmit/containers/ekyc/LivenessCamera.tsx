import {
  useFaceDetection,
  FaceDetectionResults,
  Camera,
  FaceDetection,
  Webcam,
} from 'react-face-detection-hook';
import styled from 'styled-components';

type LivenessCameraProps = {
  onFaceDetected: (data: FaceDetectionResults, image: string) => void;
  takeFlag: boolean;
};

const LIVENESS_URL = process.env.REACT_APP_LIVENESS_MODEL_FILE_URL;

export default function LivenessCamera({
  onFaceDetected,
  takeFlag,
}: LivenessCameraProps) {

  const handleOnFaceDetected = (data: FaceDetectionResults) => {
    const img = takeFlag ? webcamRef.current?.getScreenshot() || '' : '';
    onFaceDetected(data, img);
  };

  const { webcamRef } = useFaceDetection({
    handleOnFaceDetected,
    faceDetectionOptions: {
      model: 'short',
    },
    faceDetection: new FaceDetection({
      locateFile: file => `${LIVENESS_URL}/${file}`,
    }),
    camera: ({ mediaSrc, onFrame }) =>
      new Camera(mediaSrc, {
        onFrame,
        width: 500,
        height: 600,
      }),
  });

  return (
    <StyledWebcam
      controls={false}
      forceScreenshotSourceSize
      mirrored
      ref={webcamRef}
    />
  );
}

const StyledWebcam = styled(Webcam)`
  margin: auto;
  width: 336px;
  height: 390px;
  border-radius: 50%;
  max-width: 100%;
  border: 2px solid white;
  object-fit: cover;
`;
