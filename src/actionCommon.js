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
  const dests = value.destinations;
  const error = {};
  if (
    dests &&
    dests.filter((d) => d === "APP" || d === "ALERT" || d === "INTRO").length >=
      2
  ) {
    error.destinations = "「前情提要」/「對話視窗」/「提示視窗」只能選其中一個";
  } else if (dests && dests.length === 0) {
    error.destinations = "至少要選其中一個";
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
  return (
    <>
      <TextInput multiline label="文字" source="text" />
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
      <ArrayInput label="回應按鈕" source="choices">
        <SimpleFormIterator>
          <TextInput source="choice" label="選擇" />
        </SimpleFormIterator>
      </ArrayInput>
      <BooleanInput
        label="允許文字回應"
        source="allowTextReply"
        initialValue={false}
      />

      {modalButton(
        "https://storage.googleapis.com/daqiaotou/editor/image/text-input.jpg",
        "文字回應示意圖"
      )}
      <CheckboxGroupInput
        label="顯示於"
        source="destinations"
        choices={destinations}
        initialValue={initialDestination}
      />
      {formData.destinations && formData.destinations.includes("ALERT") && (
        <BooleanInput
          label="回覆後保留提示視窗"
          source="dontCloseAlertAfterReply"
          initialValue={false}
        />
      )}
      {formData.destinations && formData.destinations.includes("APP") && (
        <BooleanInput
          label="移除先前對話"
          source="clearDialog"
          initialValue={false}
        />
      )}

      <span>
        示意圖：
        {modalButton(
          "https://storage.googleapis.com/daqiaotou/editor/image/notification.jpg",
          "通知列(iOS不支援按鈕)"
        )}
        {modalButton(
          "https://storage.googleapis.com/daqiaotou/editor/image/dialog.jpg",
          "對話視窗"
        )}
        {modalButton(
          "https://storage.googleapis.com/daqiaotou/editor/image/alert.jpg",
          "提示視窗"
        )}
        {modalButton(
          "https://storage.googleapis.com/daqiaotou/editor/image/intro.jpg",
          "首頁(不支援圖片)"
        )}
      </span>
      <br />
      {enableDelay && addDelay(formData, "popup")}
    </>
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
