import * as React from "react";
import {
  ArrayInput,
  BooleanInput,
  NumberInput,
  SimpleFormIterator,
  SelectInput,
  TextInput,
  ReferenceInput,
  AutocompleteInput,
  required,
  number,
  CheckboxGroupInput,
  Button,
  useGetMany,
} from "react-admin";

import "./modalImage.css";

import { ColorInput } from "react-admin-color-input";
import TimeInput from "./timepicker.js";

import BluetoothIcon from "@material-ui/icons/Bluetooth";
import AudiotrackIcon from "@material-ui/icons/Audiotrack";
import MessageIcon from "@material-ui/icons/Message";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import LocationOffIcon from "@material-ui/icons/LocationOff";
import AddLocationIcon from "@material-ui/icons/AddLocation";
import CancelIcon from "@material-ui/icons/Cancel";
import PhoneCallbackIcon from "@material-ui/icons/PhoneCallback";
import PhoneDisabledIcon from "@material-ui/icons/PhoneDisabled";
import MapIcon from "@material-ui/icons/Map";
import ReplyIcon from "@material-ui/icons/Reply";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import HourglassBottomIcon from "@material-ui/icons/HourglassEmpty";
import ImageIcon from "@material-ui/icons/Image";
import ButtonIcon from "@material-ui/icons/NavigateNext";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";

import LocationReferenceInput from "./LocationReferenceInput";
import SoundReferenceInput from "./SoundReferenceInput";
import ImageReferenceInput from "./ImageReferenceInput";

const destinations = [
  { id: "NOTIFICATION", name: "通知列" },
  { id: "APP", name: "對話視窗" },
  { id: "ALERT", name: "提示視窗" },
  { id: "INTRO", name: "首頁" },
  { id: "DIALER", name: "撥號視窗" },
];
const dismissalDestinations = [
  { id: "APP", name: "對話視窗" },
  { id: "ALERT", name: "提示視窗" },
];
const soundModes = [
  { id: "STATIC_VOLUME", name: "固定音量" },
  { id: "DYNAMIC_VOLUME", name: "越遠越小聲" },
];
const soundTypes = [
  { id: "MAIN", name: "主劇情" },
  { id: "BACKGROUND", name: "背景單次" },
  { id: "LOOP", name: "背景循環" },
];
const conditionTypes = [
  { id: "ALWAYS", name: "上個動作結束" },
  { id: "TEXT", name: "文字回應" },
  { id: "GEOFENCE", name: "GPS觸發" },
  { id: "BEACON", name: "Beacon觸發" },
];
const beaconTypes = [
  { id: "ENTER", name: "接近" },
  { id: "EXIT", name: "離開" },
];
const callTypes = [
  { id: "CONNECTING", name: "未接通" },
  { id: "CONNECTED", name: "接通" },
];
const comparisonTypes = [
  { id: "<=", name: "<=" },
  { id: "==", name: "==" },
  { id: ">=", name: ">=" },
];
const operationTypes = [
  { id: "+", name: "+" },
  { id: "-", name: "-" },
  { id: "=", name: "=" },
];

const getConditionIcon = (record) => {
  const conds = record.prevs
    ? new Set(record.prevs.flatMap((p) => p.conditionType))
    : new Set();
  const delay =
    (record.hasSound && record.soundDelay) ||
    (record.hasHangUp && record.hangUpDelay) ||
    (record.hasIncomingCall && record.incomingCallDelay) ||
    (record.hasMarker && record.markerDelay) ||
    (record.hasmarkerremoval && record.markerremovaldelay) ||
    (record.hasPopup && record.popupDelay) ||
    (record.hasPopupDismissal && record.popupDismissalDelay) ||
    (record.hasMapStyle && record.mapStyleDelay) ||
    (record.hasIntroImage && record.introImageDelay) ||
    (record.hasButtonStyle && record.buttonStyleDelay) ||
    (record.hasGuideImage && record.guideImageDelay) ||
    (record.hasGuideImageRemoval && record.hasGuideImageRemovalDelay);

  return (
    <>
      {conds.has("TEXT") ? <ReplyIcon /> : <></>}
      {conds.has("BEACON") ? <BluetoothIcon /> : <></>}
      {conds.has("GEOFENCE") ? <MyLocationIcon /> : <></>}
      {conds.has("ALWAYS") ? <ArrowForwardIcon /> : <></>}
      {delay ? <HourglassBottomIcon /> : <></>}
    </>
  );
};

const getContentIcon = (record) => {
  return (
    <>
      {record.hasSound ? <AudiotrackIcon /> : <></>}
      {record.hasPopup ? <MessageIcon /> : <></>}
      {record.hasIncomingCall ? <PhoneCallbackIcon /> : <></>}
      {record.hasPopupDismissal ? <CancelIcon /> : <></>}
      {record.hasMarker ? <AddLocationIcon /> : <></>}
      {record.hasMarkerRemoval ? <LocationOffIcon /> : <></>}
      {record.hasHangUp ? <PhoneDisabledIcon /> : <></>}
      {record.hasMapStyle ? <MapIcon /> : <></>}
      {record.hasIntroImage ? <ImageIcon /> : <></>}
      {record.hasButtonStyle ? <ButtonIcon /> : <></>}
      {record.hasSilence ? <VolumeOffIcon /> : <></>}
    </>
  );
};

const locationCondition = (getSource) => (
  <>
    <LocationReferenceInput
      label="中心點"
      source={getSource("geofenceCenter")}
      reference="locations"
      validate={[required()]}
      perPage={1000}
    >
      <AutocompleteInput optionText="name" />
    </LocationReferenceInput>
    <br />
    <NumberInput
      label="範圍"
      source={getSource("geofenceRadius")}
      validate={[required(), number()]}
    />
    公尺
  </>
);
const beaconCondition = (getSource) => (
  <>
    <ReferenceInput
      label="Beacon"
      source={getSource("beacon")}
      reference="beacons"
      validate={[required()]}
    >
      <AutocompleteInput optionText="name" />
    </ReferenceInput>
    <SelectInput
      label="模式"
      source={getSource("beaconType")}
      choices={beaconTypes}
      validate={[required()]}
    />
    <br />
    <NumberInput
      label="訊號值"
      source={getSource("beaconThreshold")}
      validate={[required(), number()]}
    />
  </>
);

export function getMainType(action) {
  function isDialog() {
    const dests = action.destinations || [];
    return (
      action.hasPopup &&
      (dests.includes("DIALER") ||
        dests.allowTextReply ||
        (action.choices && action.choices.length > 0))
    );
  }
  return isDialog()
    ? "dialog"
    : action.hasSound && (action.soundType == "MAIN" || !action.soundType)
    ? "sound"
    : action.hasPopup
    ? "popup"
    : action.hasIncomingCall
    ? "incoming-call"
    : action.hasHangUp
    ? "hang-up"
    : action.hasMarker
    ? "marker"
    : action.hasMarkerRemoval
    ? "marker-removal"
    : action.hasMapStyle
    ? "map-style"
    : action.hasGuideImage
    ? "guide-image"
    : action.hasPopupDismissal
    ? "popup-dismissal"
    : action.hasIntroImage
    ? "intro-image"
    : action.hasGuideImageRemoval
    ? "guide-image-removal"
    : action.hasSound && action.soundType == "BACKGROUND"
    ? "sound"
    : "button-style";
}

export function getPrevDesc(action) {
  switch (getMainType(action)) {
    case "dialog":
      return "訊息出現";
    case "sound":
      return "聲音播完";
    case "popup":
      return "顯示完畢";
    case "incoming-call":
      return "電話接通";
    case "hang-up":
      return "電話掛斷";
    case "marker":
      return "圖釘出現";
    case "marker-removal":
      return "圖釘移除";
    case "map-style":
      return "地圖樣式改變";
    case "guide-image":
      return "指示圖出現";
    case "guide-image-removal":
      return "指示圖消失";
    case "popup-dismissal":
      return "圖文訊息關閉";
    case "intro-image":
      return "背景圖出現";
    case "sound-background":
      return "背景聲音播完";
    case "button-style":
      return "按鈕樣式改變";
    default:
      return "動作執行完畢";
  }
}

export function getPrevId(action) {
  const mainType = getMainType(action);
  switch (mainType) {
    case "dialog":
      return `${action.id}-popup`;
    case "sound-background":
      return `${action.id}-sound`;
    default:
      return `${action.id}-${mainType}`;
  }
}

export const modalImage = (
  <>
    <div id="modalContainer" className="modal">
      <span id="closeModal" className="close">
        &times;
      </span>
      <img id="modalImage" className="modal-content" />
      <div id="modalCaption" className="caption"></div>
    </div>
  </>
);

function setModal(img, caption) {
  const modal = document.getElementById("modalContainer");
  modal.style.display = "block";
  const imgElem = document.getElementById("modalImage");
  imgElem.src = img;
  imgElem.alt = caption;
  const captionElem = document.getElementById("modalCaption");
  captionElem.innerHTML = caption;
  const closeElem = document.getElementById("closeModal");
  closeElem.onclick = () => {
    modal.style.display = "none";
  };
}

function modalButton(img, caption) {
  function handleClick() {
    setModal(img, caption);
  }
  return <Button label={caption} onClick={handleClick} primary="true" />;
}

function addDelay(formData, name) {
  return (
    <>
      <BooleanInput
        label="進階時間控制"
        source={name + "AdvancedTime"}
        initialValue={false}
      />
      {formData[name + "AdvancedTime"] && addAdvancedDelay(name)}
      {!formData[name + "AdvancedTime"] && (
        <NumberInput
          label="延遲時間(毫秒)"
          style={{ width: 130 }}
          min={0}
          step={1}
          source={name + "Delay"}
          validate={[number()]}
        />
      )}
    </>
  );
}

function addAdvancedDelay(name) {
  return (
    <>
      <div>
        延遲時間 <br />
        <NumberInput
          label="小時"
          style={{ width: 100 }}
          min={0}
          step={1}
          source={name + "DelayHour"}
          validate={[number()]}
        />
        <NumberInput
          style={{ width: 100 }}
          min={0}
          max={59}
          step={1}
          label="分鐘"
          source={name + "DelayMinute"}
          validate={[number()]}
        />
        <NumberInput
          label="秒鐘"
          style={{ width: 100 }}
          min={0}
          max={59}
          step={1}
          source={name + "DelaySecond"}
          validate={[number()]}
        />
        <NumberInput
          label="毫秒"
          style={{ width: 130 }}
          min={0}
          max={999}
          step={1}
          source={name + "DelayMilli"}
          validate={[number()]}
        />
      </div>
      <div>
        發送時刻 <br />
        <TimeInput label="發送時刻" source={name + "Time"} />
      </div>
      <div>
        隨機前後調整 <br />
        <NumberInput
          label="小時"
          style={{ width: 100 }}
          min={0}
          step={1}
          source={name + "RandomHour"}
          validate={[number()]}
        />
        <NumberInput
          style={{ width: 100 }}
          min={0}
          max={59}
          step={1}
          label="分鐘"
          source={name + "RandomMinute"}
          validate={[number()]}
        />
        <NumberInput
          label="秒鐘"
          style={{ width: 100 }}
          min={0}
          max={59}
          step={1}
          source={name + "RandomSecond"}
          validate={[number()]}
        />
        <NumberInput
          label="毫秒"
          style={{ width: 130 }}
          min={0}
          max={999}
          step={1}
          source={name + "RandomMilli"}
          validate={[number()]}
        />
      </div>
    </>
  );
}

const soundInput = (formData, enableDelay) => (
  <>
    <SoundReferenceInput
      label="音檔"
      source="soundId"
      reference="sounds"
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
      validate={[required()]}
    >
      <AutocompleteInput optionText="name" />
    </SoundReferenceInput>

    <BooleanInput
      label="進階聲音控制"
      source="advancedSound"
      initialValue={false}
    />

    {formData.advancedSound && (
      <>
        <SelectInput
          label="聲音類型"
          source="soundType"
          choices={soundTypes}
          initialValue="MAIN"
        />
        <SelectInput
          label="音量模式"
          source="mode"
          choices={soundModes}
          initialValue="STATIC_VOLUME"
        />
      </>
    )}
    <br />
    {formData.mode === "STATIC_VOLUME" &&
      formData.soundType === "MAIN" &&
      formData.advancedSound && (
        <div>
          <NumberInput
            label="正文秒數"
            source="speechLength"
            validate={[number()]}
          />
          播放到超過正文秒數之後，如果與下一個音檔重疊，則開始淡出。不淡出則不必設。
          <br />
          <NumberInput
            label="淡出秒數"
            source="fadeOutSeconds"
            validate={[number()]}
          />
          在幾秒內淡出到消失。設為0代表立即停止。
        </div>
      )}
    {formData.mode === "DYNAMIC_VOLUME" && formData.advancedSound && (
      <>
        <span>中心點音量值為1(檔案原始音量)，到圓周的音量為「最小音量」</span>
        <div>
          <LocationReferenceInput
            label="中心點"
            source="soundCenterId"
            reference="locations"
            validate={[required()]}
            perPage={1000}
          >
            <AutocompleteInput optionText="name" />
          </LocationReferenceInput>
          <NumberInput
            label="最小音量"
            source="minVolume"
            initialValue={0}
            validate={[required(), number()]}
          />{" "}
          0-1之間
          <br />
          <NumberInput
            label="半徑"
            source="range"
            initialValue={30}
            validate={[required(), number()]}
          />
          公尺
        </div>
      </>
    )}
    {enableDelay && addDelay(formData, "sound")}
  </>
);

const validateBeforeSubmit = (value) => {
  const dests = value.destinations || [];
  const error = {};
  if (
    dests &&
    dests.filter(
      (d) => d === "APP" || d === "ALERT" || d === "INTRO" || d === "DIALER"
    ).length >= 2
  ) {
    error.destinations =
      "「前情提要」/「對話視窗」/「提示視窗」/「撥號視窗」只能選其中一個";
  } else if (dests.length === 0) {
    error.destinations = "至少要選其中一個";
  } else if (
    dests.filter((d) => d === "APP" || d === "ALERT" || d === "INTRO").length >=
      1 &&
    (!value.choices || value.choices.length == 0) &&
    !value.allowTextReply &&
    !value.allowNoReply
  ) {
    error.allowTextReply =
      "必須要有回應方式 (按鈕或打字)，否則圖文視窗不會自行消失！";
  }
  if (
    value.hasIntroImage &&
    !value.introBackground &&
    !value.introLogo &&
    !value.mapLogo
  ) {
    error.hasIntroImage = "背景和logo至少要有一個";
  }
  return error;
};

const popupInput = (formData, enableDelay) => {
  const initialDestination = React.useMemo(() => ["ALERT"], []);
  const dests = formData.destinations || [];
  const hasDialog = dests.includes("APP");
  const hasAlert = dests.includes("ALERT");
  const blockingPopup = hasAlert || dests.includes("INTRO");
  const hasDialer = dests.includes("DIALER");
  const hasIntro = dests.includes("INTRO");
  const contentPane = (
    <>
      <h4>
        <u>圖文內容</u>
      </h4>
      {!hasDialer ? (
        <table border="1" cellPadding="10">
          <tr>
            <td>
              <TextInput multiline label="文字" source="text" />
            </td>
          </tr>
          <tr>
            <td>
              {!hasIntro ? (
                <ArrayInput label="圖片" source="pictures">
                  <SimpleFormIterator>
                    <ImageReferenceInput
                      label="圖檔"
                      source="pictureId"
                      reference="images"
                      sort={{ field: "lastupdate", order: "DESC" }}
                      perPage={1000}
                    />
                  </SimpleFormIterator>
                </ArrayInput>
              ) : (
                <>(要改變首頁背景圖片，請到「進階內容」→「首頁背景」)</>
              )}
            </td>
          </tr>
        </table>
      ) : (
        <>撥號視窗目前不支援圖文顯示</>
      )}
      {!hasDialer && (
        <div>
          <h4>
            <u>回應方式</u>
          </h4>
          <table border="1" cellPadding="10">
            {!formData.allowNoReply && (
              <tr>
                <td>
                  <ArrayInput label="回應按鈕" source="choices">
                    <SimpleFormIterator>
                      <TextInput source="choice" label="選擇" />
                    </SimpleFormIterator>
                  </ArrayInput>
                </td>
              </tr>
            )}
            {!formData.allowNoReply && (
              <tr>
                <td>
                  <BooleanInput
                    label="允許打字回應"
                    source="allowTextReply"
                    initialValue={false}
                  />
                  {modalButton(
                    "https://storage.googleapis.com/daqiaotou/editor/image/text-input.jpg",
                    "打字回應示意圖"
                  )}
                </td>
              </tr>
            )}
            {blockingPopup && (
              <tr>
                <td>
                  <BooleanInput
                    label="不需用戶回應 (我了解必須自行計時關閉視窗)"
                    source="allowNoReply"
                    initialValue={false}
                  />
                </td>
              </tr>
            )}
          </table>
        </div>
      )}

      <h4>
        <u>顯示區域</u>
      </h4>
      <CheckboxGroupInput
        label="顯示於"
        source="destinations"
        choices={destinations}
        initialValue={initialDestination}
      />
      <br />
      <span>
        示意圖：
        {modalButton(
          "https://storage.googleapis.com/daqiaotou/editor/image/notification.jpg",
          "通知列(iOS不支援按鈕)"
        )}
      </span>
      <h4>
        <u>進階功能</u>
      </h4>
      {hasAlert && (
        <BooleanInput
          label="回覆後保留提示視窗"
          source="dontCloseAlertAfterReply"
          initialValue={false}
        />
      )}
      {hasDialog && (
        <BooleanInput
          label="移除先前對話"
          source="clearDialog"
          initialValue={false}
        />
      )}
      {enableDelay && addDelay(formData, "popup")}
    </>
  );
  const pictures = (formData.pictures || []).filter((x) => x);
  const imageData = useGetMany(
    "images",
    pictures.map((p) => p.pictureId)
  ).data;

  const previewPane = (
    <>
      <h4>
        <u>示意圖</u>
      </h4>
      僅供編輯時參考，與實際手機上佈局不同！
      <table>
        {hasAlert && (
          <tr>
            <td style={{ background: "#555555" }}>
              <div
                style={{
                  width: 320,
                  paddingLeft: 24,
                  paddingRight: 24,
                  paddingTop: 32,
                  paddingBottom: 32,
                  margin: 24,
                  background:
                    "linear-gradient(160deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 100%)",
                  borderRadius: 30,
                  overflow: "hidden",
                  border: "0.50px rgba(255, 255, 255, 0.30) solid",
                  backdropFilter: "blur(30px)",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 40,
                  display: "inline-flex",
                }}
              >
                <div
                  style={{
                    width: 320,
                    position: "relative",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {imageData.length > 0 && (
                    <img src={imageData[0].image.src} style={{ width: 300 }} />
                  )}
                </div>
                <div
                  style={{
                    width: 240,
                    textAlign: "center",
                    color: "#F2F2F7",
                    fontSize: 15,
                    fontFamily: "Noto Sans TC",
                    fontWeight: "400",
                    wordWrap: "break-word",
                  }}
                >
                  {formData.text}
                </div>
                <div
                  style={{
                    alignSelf: "stretch",
                    overflow: "hidden",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 10,
                    display: "inline-flex",
                  }}
                >
                  {(formData.choices || []).map((c, i) => (
                    <div
                      key={"choice" + i}
                      style={{
                        textAlign: "center",
                        color: "black",
                        fontSize: 16,
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 8,
                        paddingBottom: 8,
                        background: "#68E3DC",
                        borderRadius: 12,
                        fontFamily: "Noto Sans TC",
                        fontWeight: "500",
                        letterSpacing: 2,
                        wordWrap: "break-word",
                      }}
                    >
                      {c && c.choice}
                    </div>
                  ))}
                </div>
                {formData.allowTextReply && (
                  <div
                    style={{
                      width: 272,
                      height: 39,
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 8,
                      paddingBottom: 8,
                      background: "black",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "0.50px rgba(255, 255, 255, 0.60) solid",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 10,
                      display: "inline-flex",
                    }}
                  >
                    <div
                      style={{
                        width: 157,
                        alignSelf: "stretch",
                        opacity: 0.5,
                        color: "white",
                        fontSize: 16,
                        fontFamily: "Noto Sans TC",
                        fontWeight: "700",
                        wordWrap: "break-word",
                      }}
                    >
                      |
                    </div>
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
        {hasDialog && (
          <tr>
            <td style={{ background: "#555555" }}>
              <div
                style={{
                  width: 320,
                  paddingBottom: 32,
                  paddingTop: 32,
                  background:
                    "linear-gradient(160deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0) 100%)",
                  borderRadius: 30,
                  overflow: "hidden",
                  border: "0.50px rgba(255, 255, 255, 0.30) solid",
                  backdropFilter: "blur(30px)",
                  flexDirection: "column",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  display: "inline-flex",
                }}
              >
                <div
                  style={{
                    alignSelf: "stretch",
                    paddingBottom: 24,
                    paddingLeft: 24,
                    paddingRight: 24,
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 24,
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      alignSelf: "stretch",
                      padding: 24,
                      background:
                        "linear-gradient(160deg, rgba(143.33, 242.25, 224.44, 0.15) 0%, rgba(143, 242, 224, 0.35) 100%)",
                      borderTopLeftRadius: 30,
                      borderTopRightRadius: 30,
                      borderBottomLeftRadius: 30,
                      overflow: "hidden",
                      border: "0.50px rgba(255, 255, 255, 0.30) solid",
                      backdropFilter: "blur(30px)",
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      gap: 40,
                      display: "inline-flex",
                    }}
                  >
                    <div
                      style={{
                        flex: "1 1 0",
                        color: "#F2F2F7",
                        fontSize: 14,
                        fontFamily: "Noto Sans TC",
                        wordWrap: "break-word",
                      }}
                    >
                      .........
                    </div>
                  </div>
                  <div
                    style={{
                      alignSelf: "stretch",
                      padding: 24,
                      background:
                        "linear-gradient(160deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.40) 100%)",
                      borderTopLeftRadius: 30,
                      borderTopRightRadius: 30,
                      borderBottomRightRadius: 30,
                      overflow: "hidden",
                      border: "0.50px rgba(255, 255, 255, 0.30) solid",
                      backdropFilter: "blur(30px)",
                      justifyContent: "flex-start",
                      alignItems: "flex-start",
                      gap: 40,
                      display: "inline-flex",
                    }}
                  >
                    <div
                      style={{
                        flex: "1 1 0",
                        color: "#F2F2F7",
                        fontSize: 14,
                        fontFamily: "Noto Sans TC",
                        wordWrap: "break-word",
                      }}
                    >
                      {formData.text}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    alignSelf: "stretch",
                    paddingTop: 24,
                    paddingLeft: 24,
                    paddingRight: 24,
                    borderTop: "0.50px rgba(255, 255, 255, 0.20) solid",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    gap: 16,
                    display: "flex",
                  }}
                >
                  <div
                    style={{
                      alignSelf: "stretch",
                      justifyContent: "center",
                      alignItems: "flex-start",
                      gap: 16,
                      display: "inline-flex",
                    }}
                  >
                    {(formData.choices || []).map((c, i) => (
                      <div
                        key={"choice" + i}
                        style={{
                          textAlign: "center",
                          color: "black",
                          paddingLeft: 16,
                          paddingRight: 16,
                          paddingTop: 8,
                          paddingBottom: 8,
                          background: "#68E3DC",
                          borderRadius: 12,
                          fontFamily: "Noto Sans TC",
                          fontWeight: "500",
                          wordWrap: "break-word",
                          fontSize: 14,
                          flex: "1 1 0",
                        }}
                      >
                        {c && c.choice}
                      </div>
                    ))}
                  </div>
                  {formData.allowTextReply && (
                    <div
                      style={{
                        alignSelf: "stretch",
                        paddingLeft: 16,
                        paddingRight: 16,
                        paddingTop: 8,
                        paddingBottom: 8,
                        background: "black",
                        borderRadius: 12,
                        overflow: "hidden",
                        border: "0.50px rgba(255, 255, 255, 0.60) solid",
                        justifyContent: "flex-start",
                        alignItems: "center",
                        gap: 10,
                        display: "inline-flex",
                      }}
                    >
                      <div
                        style={{
                          width: 157,
                          alignSelf: "stretch",
                          opacity: 0.5,
                          color: "white",
                          fontSize: 16,
                          fontFamily: "Noto Sans TC",
                          fontWeight: "700",
                          wordWrap: "break-word",
                        }}
                      >
                        |
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </td>
          </tr>
        )}
        {hasIntro && (
          <tr>
            <td>
              <img
                src="https://storage.googleapis.com/daqiaotou/editor/image/intro.jpg"
                width="300"
              />
            </td>
          </tr>
        )}
        {hasDialer && (
          <tr>
            <td>
              <img
                src="https://storage.googleapis.com/daqiaotou/editor/image/dialer.png"
                width="300"
              />
            </td>
          </tr>
        )}
      </table>
    </>
  );
  return (
    <table border="0">
      <tr>
        <td style={{ verticalAlign: "top", width: "1%", whiteSpace: "nowrap" }}>
          {contentPane}
        </td>
        <td style={{ verticalAlign: "top", horizontalAlign: "left" }}>
          {previewPane}
        </td>
      </tr>
    </table>
  );
};

const popupDismissalInput = (formData, enableDelay) => {
  return (
    <>
      <CheckboxGroupInput
        label="關閉"
        source="dismissalDestinations"
        choices={dismissalDestinations}
      />{" "}
      <br />
      {enableDelay && addDelay(formData, "dismissal")}
    </>
  );
};

const incomingCallInput = (formData, enableDelay) => (
  <>
    <TextInput label="來電人" source="caller" validate={[required()]} />
    <ImageReferenceInput
      label="圖示檔案"
      source="portrait"
      reference="images"
      validate={[required()]}
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
    <SelectInput
      label="狀態"
      source="callStatus"
      choices={callTypes}
      initialValue={"CONNECTING"}
    />{" "}
    <br />
    示意圖：
    {modalButton(
      "https://storage.googleapis.com/daqiaotou/editor/image/phone-calling.png",
      "未接通"
    )}
    {modalButton(
      "https://storage.googleapis.com/daqiaotou/editor/image/phone-connected.png",
      "接通"
    )}
    <br />
    {enableDelay && addDelay(formData, "incomingCall")}
  </>
);

const hangUpInput = (formdata, enableDelay) => (
  <>
    <TextInput label="來電人" source="caller" validate={[required()]} />
    <ImageReferenceInput
      label="圖示檔案"
      source="portrait"
      reference="images"
      validate={[required()]}
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
    {enableDelay && addDelay(formdata, "hangUp")}
  </>
);

const markerInput = (formData, enableDelay) => (
  <>
    <TextInput label="標題" source="title" validate={[required()]} />
    <br />
    <ImageReferenceInput
      label="圖示檔案"
      source="markerIcon"
      reference="images"
      validate={[required()]}
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
    <LocationReferenceInput
      label="座標"
      source="locationId"
      reference="locations"
      validate={[required()]}
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    >
      <AutocompleteInput optionText="name" />
    </LocationReferenceInput>
    <br />
    {modalButton(
      "https://storage.googleapis.com/daqiaotou/editor/image/marker.jpg",
      "示意圖"
    )}
    <br />
    {enableDelay && addDelay(formData, "marker")}
  </>
);

const markerRemovalInput = (formData, enableDelay) => (
  <>
    <ReferenceInput
      label="圖釘"
      source="markerId"
      reference="actions"
      validate={[required()]}
      filter={{ hasMarker: true }}
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    >
      <SelectInput optionText="title" />
    </ReferenceInput>
    <br />
    {enableDelay && addDelay(formData, "markerRemoval")}
  </>
);

const mapStyleInput = (formData, enableDelay) => (
  <>
    {!formData.satellite && (
      <ReferenceInput
        label="樣式"
        source="mapStyle"
        reference="mapStyles"
        sort={{ field: "lastupdate", order: "DESC" }}
        perPage={1000}
      >
        <SelectInput optionText="name" />
      </ReferenceInput>
    )}
    <BooleanInput label="衛星地圖" source="satellite" initialValue={false} />
    <br />
    <span>
      示意圖：
      {modalButton(
        "https://storage.googleapis.com/daqiaotou/editor/image/sattelite.jpg",
        "衛星地圖"
      )}
      {modalButton(
        "https://storage.googleapis.com/daqiaotou/editor/image/marker.jpg",
        "一般地圖"
      )}
    </span>
    <br />
    {enableDelay && addDelay(formData, "mapStyle")}
  </>
);

const introImageInput = (formData, enableDelay) => (
  <>
    <ImageReferenceInput
      label="背景圖"
      source="introBackground"
      reference="images"
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
    首頁logo建議比例: 寬300 / 高280
    <ImageReferenceInput
      label="首頁logo"
      source="introLogo"
      reference="images"
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
    地圖logo建議比例: 寬62 / 高100
    <ColorInput label="首頁文字顏色" source="introTextColor" />
    <ImageReferenceInput
      label="地圖頁logo"
      source="mapLogo"
      reference="images"
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
    <BooleanInput
      label="向下相容模式"
      source="advancedLogo"
      initialValue={false}
    />
    {formData.advancedLogo && (
      <>
        <NumberInput
          label="Logo距頂"
          source="introLogoMarginTop"
          validate={[number()]}
        />
        <NumberInput
          label="Logo高度"
          source="introLogoHeight"
          validate={[number()]}
        />
        <NumberInput
          label="Logo寬度"
          source="introLogoWidth"
          validate={[number()]}
        />
      </>
    )}
    <br />
    {modalButton(
      "https://storage.googleapis.com/daqiaotou/editor/image/intro-style.jpg",
      "示意圖"
    )}
    <br />
    {enableDelay && addDelay(formData, "introImage")}
  </>
);

const buttonStyleInput = (formData, enableDelay) => (
  <>
    <ColorInput label="背景顏色" source="backgroundColor" />
    <ColorInput label="文字顏色" source="textColor" />
    {modalButton(
      "https://storage.googleapis.com/daqiaotou/editor/image/button.jpg",
      "示意圖"
    )}
    <br />
    {enableDelay && addDelay(formData, "buttonStyle")}
  </>
);

const variableUpdateInput = () => (
  <ArrayInput label="更新變數" source="variableUpdates">
    <SimpleFormIterator>
      <ReferenceInput
        label="變數"
        source="variable"
        reference="variables"
        validate={[required()]}
      >
        <AutocompleteInput optionText="name" />
      </ReferenceInput>
      <SelectInput
        label="運算"
        source="operation"
        choices={operationTypes}
        validate={[required()]}
      />
      <NumberInput label="值" source="value" validate={[required()]} />
    </SimpleFormIterator>
  </ArrayInput>
);

const endgameInput = (formData, enableDelay) => (
  <>
    <BooleanInput
      label="結束活動，返回劇本選擇畫面"
      source="endgame"
      initialValue={false}
    />
    <br />
    {enableDelay && addDelay(formData, "endgame")}
  </>
);

const guideImageInput = (formData, enableDelay) => (
  <>
    <ImageReferenceInput
      label="指示圖"
      source="guideImage"
      reference="images"
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
    <br />
    {enableDelay && addDelay(formData, "guideImage")}
  </>
);

const guideImageRemovalInput = (formData, enableDelay) => (
  <>{enableDelay && addDelay(formData, "guideImageRemoval")}</>
);

const silenceInput = (formData, enableDelay) => (
  <>
    <ReferenceInput
      label="聲音"
      source="silencedSound"
      reference="actions"
      sort={{ field: "lastupdate", order: "DESC" }}
      filter={{ hasSound: true }}
      perPage={1000}
    >
      <SelectInput optionText="name" />
    </ReferenceInput>
    <NumberInput
      label="淡出秒數"
      source="forceFadeOutSeconds"
      validate={[number()]}
    />
    在幾秒內淡出到消失。設為0代表立即停止。
    <br />
    {enableDelay && addDelay(formData, "silence")}
  </>
);

export {
  destinations,
  soundModes,
  soundTypes,
  conditionTypes,
  beaconTypes,
  callTypes,
  operationTypes,
  comparisonTypes,
  getConditionIcon,
  getContentIcon,
  locationCondition,
  beaconCondition,
  soundInput,
  popupInput,
  popupDismissalInput,
  incomingCallInput,
  hangUpInput,
  markerInput,
  markerRemovalInput,
  mapStyleInput,
  validateBeforeSubmit,
  introImageInput,
  buttonStyleInput,
  variableUpdateInput,
  endgameInput,
  guideImageInput,
  guideImageRemovalInput,
  silenceInput,
};
