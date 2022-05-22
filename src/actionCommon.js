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

import LocationReferenceInput from "./LocationReferenceInput";
import SoundReferenceInput from "./SoundReferenceInput";
import ImageReferenceInput from "./ImageReferenceInput";

const destinations = [
  { id: "NOTIFICATION", name: "通知列" },
  { id: "APP", name: "對話視窗" },
  { id: "ALERT", name: "提示視窗" },
  { id: "INTRO", name: "首頁" },
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
const getConditionIcon = (record) => {
  const conds = record.prevs
    ? new Set(record.prevs.flatMap((p) => p.conditionType))
    : new Set();
  const delay =
    (record.delay && record.delay != "0") ||
    (record.hasSound && record.soundDelay) ||
    (record.hasHangUp && record.hangUpDelay) ||
    (record.hasIncomingCall && record.incomingCallDelay) ||
    (record.hasMarker && record.markerDelay) ||
    (record.hasMarkerRemoval && record.markerRemovalDelay) ||
    (record.hasPopup && record.popupDelay) ||
    (record.hasPopupDismissal && record.popupDismissalDelay) ||
    (record.hasMapStyle && record.mapStyleDelay) ||
    (record.hasIntroImage && record.introImageDelay) ||
    (record.hasButtonStyle && record.buttonStyleDelay);

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
    <SelectInput label="聲音類型" source="soundType" choices={soundTypes} />
    <br />
    <SelectInput label="音量模式" source="mode" choices={soundModes} />
    {formData.mode === "STATIC_VOLUME" && (
      <div>
        <NumberInput
          label="正文秒數"
          source="speechLength"
          validate={[number()]}
        />
        播放到超過正文秒數之後，如果與下一個音檔重疊，則開始淡出。
        <br />
        <NumberInput
          label="淡出秒數"
          source="fadeOutSeconds"
          validate={[number()]}
        />
        在幾秒內淡出到消失。
      </div>
    )}
    {formData.mode === "DYNAMIC_VOLUME" && (
      <span>中心點音量值為1(檔案原始音量)，到圓周的音量為「最小音量」</span>
    )}
    {formData.mode === "DYNAMIC_VOLUME" && (
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
    )}
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="soundDelay"
        validate={[number()]}
      />
    )}
  </>
);

const validateDestinations = (value) => {
  const dests = value.destinations;
  const error = {};
  if (
    dests &&
    dests.filter((d) => d === "APP" || d === "ALERT" || d === "INTRO").length >=
      2
  ) {
    error.destinations = "「前情提要」/「對話視窗」/「提示視窗」只能選其中一個";
  }
  return error;
};

const popupInput = (enableDelay) => (
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
    />
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
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="popupDelay"
        validate={[number()]}
      />
    )}
  </>
);

const popupDismissalInput = (enableDelay) => (
  <>
    <CheckboxGroupInput
      label="關閉"
      source="dismissalDestinations"
      choices={destinations}
    />{" "}
    <br />
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="dismissalDelay"
        validate={[number()]}
      />
    )}
  </>
);

const incomingCallInput = (enableDelay) => (
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
    {modalButton(
      "https://storage.googleapis.com/daqiaotou/editor/image/phone.jpg",
      "示意圖"
    )}
    <br />
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="incomingCallDelay"
        validate={[number()]}
      />
    )}
  </>
);
const hangUpInput = (enableDelay) => (
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
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="hangUpDelay"
        validate={[number()]}
      />
    )}
  </>
);

const markerInput = (enableDelay) => (
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
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="markerDelay"
        validate={[number()]}
      />
    )}
  </>
);

const markerRemovalInput = (enableDelay) => (
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
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="markerRemovalDelay"
        validate={[number()]}
      />
    )}
  </>
);

const mapStyleInput = (enableDelay, formData) => (
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
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="mapStyleDelay"
        validate={[number()]}
      />
    )}
  </>
);

const introImageInput = (enableDelay) => (
  <>
    <ImageReferenceInput
      label="背景圖"
      source="introBackground"
      reference="images"
      validate={[required()]}
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
    <ImageReferenceInput
      label="Logo"
      source="introLogo"
      reference="images"
      validate={[required()]}
      sort={{ field: "lastupdate", order: "DESC" }}
      perPage={1000}
    />
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
    <br />
    {modalButton(
      "https://storage.googleapis.com/daqiaotou/editor/image/intro-style.jpg",
      "示意圖"
    )}
    <br />
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="introImageDelay"
        validate={[number()]}
      />
    )}
  </>
);

const buttonStyleInput = (enableDelay) => (
  <>
    <ColorInput label="背景顏色" source="backgroundColor" />
    <ColorInput label="文字顏色" source="textColor" />
    {modalButton(
      "https://storage.googleapis.com/daqiaotou/editor/image/button.jpg",
      "示意圖"
    )}
    <br />
    {enableDelay && (
      <NumberInput
        label="延遲時間 (千分之一秒)"
        source="buttonStyleDelay"
        validate={[number()]}
      />
    )}
  </>
);

export {
  destinations,
  soundModes,
  soundTypes,
  conditionTypes,
  beaconTypes,
  callTypes,
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
  validateDestinations,
  introImageInput,
  buttonStyleInput,
};
