import { ArrowLeftOutlined, LoadingOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaceDetectionResults } from "react-face-detection-hook";
import styled from "styled-components";
import { defineFileFromType, fileToBase64, uploadImage } from "utils/upload";
import { useAppDispatch, useAppSelector } from "appRedux";
import { updateLiveness } from "modules/ApplicationSubmit/slice";
import { PAPBackButton, PAPButton, PAPError } from "core/pures";
import Layout from "core/layout";
import LivenessCamera from "./LivenessCamera";
import { Face, IdCard, UploadIcon } from "core/icons";
import { useCameraPermission, useTrackViewPage } from "hooks";
import { b64toBlob } from "utils/helpers";
import imageCompression from "browser-image-compression";
import { createSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Upload } from "antd";
import { EVENT_NAME, logGAEvent } from "utils/googleAnalytics";
import { shallowEqual } from "react-redux";
import { ERROR_LOG_TYPE, sendErrorLog } from "utils/errors";

const COUNTDOWN_SECOND = 3;

const { REACT_APP_REDUCE_LIVENESS_SIZE } = process.env;

const INSTRUCTION_ITEMS = [
  {
    icon: Face,
  },
  {
    icon: IdCard,
  },
];

const InstructionItem = ({ Icon }: { Icon: React.FC }): JSX.Element => {
  return (
    <InstructionItemContainer>
      <Icon />
    </InstructionItemContainer>
  );
};

function UploadLiveness({
  handleUpload,
  loading = false,
  setIsUsingUpload,
  setRemainSecond,
}: {
  handleUpload: (e: any) => void;
  loading?: boolean;
  setIsUsingUpload: (value: boolean) => void;
  setRemainSecond: (value: number) => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const upload = document.getElementById("upload-liveness");
    const handleReset = () => {
      setIsUsingUpload(false);
      setRemainSecond(COUNTDOWN_SECOND);
    };
    upload?.addEventListener("cancel", handleReset);
    return () => upload?.removeEventListener("cancel", handleReset);
  }, [setIsUsingUpload]);

  return (
    <UploadLivenessContainer
      onClick={() => {
        setIsUsingUpload(true);
      }}
    >
      <Upload
        onChange={(e) => {
          handleUpload(e.file);
        }}
        // beforeUpload={handleUpload}
        beforeUpload={() => false}
        maxCount={1}
        showUploadList={false}
        accept="image/*"
        disabled={loading}
        id="upload-liveness"
      >
        <Here>
          {t("UPLOAD_POTRAIT_HERE")}
          {loading ? <LoadingOutlined /> : <UploadIcon color="white" />}
        </Here>
      </Upload>
    </UploadLivenessContainer>
  );
}

const UploadLivenessContainer = styled.div`
  margin-block: 2rem;
`;

const Here = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.5rem;
  background-color: ${(props) => props.theme.colorPrimary};
  border-radius: 0.75rem;
`;

export default function Liveness(): JSX.Element {
  useTrackViewPage(EVENT_NAME.PAGE_LIVENESS);
  const { t } = useTranslation();
  const data = useAppSelector((state) => state.submit.data, shallowEqual);
  const [phone, pap_user_account_id] = useAppSelector(
    (state) => [state.auth.phone, state.auth.pap_user_account_id],
    shallowEqual
  );
  const [remainSecond, setRemainSecond] = useState(COUNTDOWN_SECOND);
  const [faceInFrame, setFaceInFrame] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [face, setFace] = useState("");
  const dispatch = useAppDispatch();
  const [takeFlag, setTakeFlag] = useState(false); // this flag for take photo in Webcam Component
  // const [start, setStart] = useState(false);
  const [error, setError] = useState<any>(null);
  const [canNotEkyc, setCanNotEkyc] = useState(false);
  const [isUsingUpload, setIsUsingUpload] = useState(false);
  const [portraitImgTakeBy, setPortraitImgTakeBy] = useState<
    "direct" | "upload" | undefined
  >("direct");
  const hasPermission = useCameraPermission("user");
  const navigate = useNavigate();
  const { pathname } = useLocation();
  let take = false;
  const showUpload = useMemo(
    () => !hasPermission || canNotEkyc,
    [hasPermission, canNotEkyc]
  );

  const next = () => {
    const registerProfile = data[0];
    const query: any = registerProfile.id_card_front ? {} : { step: "front" };
    navigate({
      pathname,
      search: createSearchParams(query).toString(),
    });
  };

  const back = () => {
    navigate({
      pathname,
      search: createSearchParams({}).toString(),
    });
  };

  const handleUpload = (face: any) => {
    // upload screenshot and update state then move to next step
    if (!face) {
      setError(t("SOMETHING_WENT_WRONG"));
      return;
    }
    setLoading(true);
    const faceFile = typeof face === "string" ? b64toBlob(face) : face;
    return imageCompression(faceFile as File, {
      maxSizeMB: parseFloat(REACT_APP_REDUCE_LIVENESS_SIZE as string),
      // maxWidthOrHeight: 1024,
      useWebWorker: true,
    })
      .then((compressImg) => {
        return uploadImage(
          compressImg,
          phone,
          compressImg.type.includes("image"),
          defineFileFromType("PORT_TRAIT"),
          undefined,
          undefined,
          pap_user_account_id,
          portraitImgTakeBy
        ).then((data) => {
          if (!data?.data?.url) {
            sendErrorLog(ERROR_LOG_TYPE.UPLOAD_FILE, "No url in response");
            throw t("ERROR_WHEN_UPLOAD_FILE");
          }
          dispatch(updateLiveness(data.data));
          setLoading(false);
          next();
        });
      })
      .catch((err) => {
        setLoading(false);
        setError(err);
        if (err.error.code.includes("TOKEN")) {
          navigate(`/login?isUpdate=true&phone=${phone}`);
          localStorage.removeItem("auth");
          localStorage.removeItem("notSubmitApplicationToken");
        }
      });
  };

  const handleRetake = () => {
    // reset state
    setError(null);
    take = false;
    setRemainSecond(COUNTDOWN_SECOND);
    setShowConfirm(false);
    setFace("");
    setTakeFlag(false);
    setIsUsingUpload(false);
  };

  function onFaceDetected({ detections }: FaceDetectionResults, image: string) {
    if (takeFlag && image) {
      // screenshot image and show confirm button
      setFace(image);
      setShowConfirm(true);
      return;
    }

    if (detections.length >= 1) {
      // if have face in camera
      if (remainSecond <= 0 && !take) {
        // trigger screenshot
        take = true;
        clearInterval(ref.current);
        ref.current = null;
        isUsingUpload ? setTakeFlag(false) : setTakeFlag(true);
      }

      setFaceInFrame(true);
      if (ref.current) return;
      ref.current = setInterval(() => {
        setRemainSecond((t) => t - 1);
      }, 1000);
      if (remainSecond <= 0) {
        // take photo
        clearInterval(ref.current);
      }
    } else {
      // reset timeout when no face in camera
      clearInterval(ref.current);
      ref.current = null;
      setRemainSecond(COUNTDOWN_SECOND);
      setFaceInFrame(false);
    }
  }

  const handleUploadFace = async (fileImg: any) => {
    // handleUpload(fileImg);
    logGAEvent(EVENT_NAME.BTN_LIVENESS_UPLOAD);
    const base64Img = await fileToBase64(fileImg);
    setFace(base64Img);
    setShowConfirm(true);
    setRemainSecond(0);
    setPortraitImgTakeBy("upload");
  };

  useEffect(() => {
    const updateCanNotEkyc = () => {
      if (remainSecond === COUNTDOWN_SECOND && !face) setCanNotEkyc(true);
    };

    const timeout = setTimeout(updateCanNotEkyc, 4000);

    return () => {
      clearTimeout(timeout);
    };
  }, [remainSecond, face]);

  useEffect(() => {
    return () => {
      if (ref.current) {
        clearInterval(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isUsingUpload) {
      clearInterval(ref.current);
      ref.current = null;
    }
  }, [isUsingUpload]);

  return (
    <Layout>
      <PAPBackButton
        onClick={back}
        gaTrack={{
          event: EVENT_NAME.BTN_LIVENESS_BACK,
        }}
      />

      <Container>
        <ButtonContainer>
          <ArrowLeftOutlined size={40} onClick={back} />
        </ButtonContainer>
        {showConfirm ? (
          <WebcamImage src={face} />
        ) : (
          <LivenessCamera onFaceDetected={onFaceDetected} takeFlag={takeFlag} />
        )}
        {!hasPermission && (
          <NotFoundCamera>{t("NOT_FOUND_CAMERA")}</NotFoundCamera>
        )}

        <PAPError error={error} />
        {showConfirm ? (
          <FlexButton>
            <PAPButton type="text" color="colorPrimary" onClick={handleRetake}>
              {t("RETAKE")}
            </PAPButton>
            <PAPButton
              type="primary"
              onClick={() => handleUpload(face)}
              loading={loading}
              gaTrack={{
                event: EVENT_NAME.BTN_LIVENESS_NEXT,
              }}
            >
              {t("CONFIRM")}
            </PAPButton>
          </FlexButton>
        ) : (
          <>
            <Instruction>{t("LIVENESS_INSTRUCTION")}</Instruction>
            <InstructionDescription>
              {INSTRUCTION_ITEMS.map((item, k) => (
                <InstructionItem Icon={item.icon} key={k} />
              ))}
            </InstructionDescription>
            {!isUsingUpload &&
              (faceInFrame ? (
                <span>{`${t("STAY_WITHIN")} ${remainSecond} ${t(
                  "SECOND"
                )}`}</span>
              ) : (
                <span>{t("MOVE_FACE_INTO_FRAME")}</span>
              ))}

            {showUpload && (
              <>
                <div
                  style={{
                    marginTop: "1rem",
                  }}
                >
                  {t("or")}
                </div>
                <div>
                  <UploadLiveness
                    handleUpload={handleUploadFace}
                    loading={loading}
                    setIsUsingUpload={setIsUsingUpload}
                    setRemainSecond={setRemainSecond}
                  />
                </div>
              </>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
}

const Container = styled.div`
  background-color: black;
  text-align: center;
  color: white;
  width: 500px;
  margin: auto;
  border-radius: 1rem;
  padding-block: 3rem;
  padding-inline: 2rem;
  margin-top: 2rem;
  margin-bottom: 2rem;

  @media screen and (max-height: 780px) {
    padding-block: 1.5rem;
    padding-inline: 1rem;
    margin-block: 1rem;
  }

  @media screen and (max-width: 768px) {
    border-radius: 0;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100vw;
    height: 100dvh;
    padding-block: 1rem;
    padding-inline: 1rem;
    margin-top: 0;
    margin-bottom: 0;
  }
`;

const ButtonContainer = styled.div`
  display: none;
  @media screen and (max-width: 768px) {
    display: block;
    text-align: left;
    color: white;
    margin: 1rem;
    margin-bottom: 0rem;
  }
`;

const Instruction = styled.h1`
  font-size: 1.25rem;
  font-weight: 600;

  @media screen and (max-height: 780px) {
    font-size: 1rem;
  }
`;

const WebcamImage = styled.img`
  margin: auto;
  width: 336px;
  height: 390px;
  border-radius: 50%;
  max-width: 100%;
  border: 2px solid white;
  object-fit: cover;

  /* @media screen and (max-height: 780px) {
    width: 270px;
    height: 313px;
  } */
`;

const FlexButton = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-top: 2rem;
`;

const InstructionItemContainer = styled.div`
  text-align: center;
  width: 120px;
`;

const InstructionDescription = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-block: 1rem;
`;

const NotFoundCamera = styled.span`
  text-align: center;
  color: white;
  display: block;
  margin-block: 10px;
`;
