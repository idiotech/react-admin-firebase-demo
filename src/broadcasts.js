import * as React from "react";
import {
  Button,
  BooleanInput,
  Confirm,
  Datagrid,
  List,
  Create,
  Edit,
  Filter,
  SimpleForm,
  TextField,
  TextInput,
  EditButton,
  DeleteButton,
  SelectInput,
  FormDataConsumer,
  required,
  FunctionField,
  fetchStart,
  fetchEnd,
  useNotify,
} from "react-admin";

import { getRecordField } from "./utils";
import { useState } from "react";
import { useDispatch } from "react-redux";

import BluetoothIcon from "@material-ui/icons/Bluetooth";
import MyLocationIcon from "@material-ui/icons/MyLocation";
import ReplyIcon from "@material-ui/icons/Reply";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import HourglassBottomIcon from "@material-ui/icons/HourglassEmpty";
import { DummyList } from "./dummy";
import { apiUrl } from "./serverCommon";

const conditionTypes = [
  { id: "ALWAYS", name: "立刻" },
  { id: "GEOFENCE", name: "GPS觸發" },
  { id: "BEACON", name: "Beacon觸發" },
];

import {
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
  silenceInput,
} from "./actionCommon";

import { useAllData, getActions } from "./serverCommon";

const Title = ({ record }) => {
  return (
    <span>
      《{localStorage.getItem("scenarioName")}》廣播
      {record && record.name ? `："${record.name}"` : ""}
    </span>
  );
};

const BroadcastFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

export const BroadcastList = (props) => {
  if (localStorage.getItem("scenario")) {
    return (
      <List
        title={<Title />}
        {...props}
        perPage={100}
        filters={<BroadcastFilter />}
      >
        <Datagrid>
          <TextField label="編號" source="rowIndex" />
          <TextField label="名稱" source="name" />
          <FunctionField label="條件" render={getConditionIcon} />
          <FunctionField label="內容" render={getContentIcon} />
          <EditButton label="編輯" />
          <SendButton label="傳送" />
          <DeleteButton label="" redirect={false} />
        </Datagrid>
      </List>
    );
  } else return DummyList(props);
};

const InputForm = (props) => {
  return (
    <SimpleForm {...props} validate={validateBeforeSubmit}>
      <FormDataConsumer>
        {({ formData }) => {
          return (
            <>
              {props.showid === "true" ? (
                <TextInput source="id" options={{ disabled: true }} />
              ) : (
                <></>
              )}
              <TextInput label="名稱" source="name" validate={[required()]} />{" "}
              <br />
              <h3>觸發順序</h3>
              <hr />
              <SelectInput
                label="觸發條件"
                source="conditionType"
                choices={conditionTypes}
              />
              <FormDataConsumer>
                {({
                  formData, // The whole form data
                }) => {
                  const getSource = (field) => field;
                  return (
                    <>
                      {formData &&
                        formData.conditionType === "GEOFENCE" &&
                        locationCondition(getSource)}
                      {formData &&
                        formData.conditionType === "BEACON" &&
                        beaconCondition(getSource)}
                    </>
                  );
                }}
              </FormDataConsumer>
              <br />
              <h3>內容</h3>
              <hr />
              <BooleanInput label="聲音" source="hasSound" />
              {formData.hasSound && soundInput(formData)}
              <hr />
              <BooleanInput label="圖文訊息" source="hasPopup" />
              {formData.hasPopup && popupInput()}
              <hr />
              <BooleanInput label="關閉圖文框" source="hasPopupDismissal" />
              {formData.hasPopupDismissal && popupDismissalInput()}
              <hr />
              <BooleanInput label="來電" source="hasIncomingCall" />
              {formData.hasIncomingCall && incomingCallInput()}
              <hr />
              <BooleanInput label="掛電話" source="hasHangUp" />
              {formData.hasHangUp && hangUpInput()}
              <hr />
              <BooleanInput label="新圖釘" source="hasMarker" />
              {formData.hasMarker && markerInput()}
              <hr />
              <BooleanInput label="移除圖釘" source="hasMarkerRemoval" />
              {formData.hasMarkerRemoval && markerRemovalInput()}
              <hr />
              <BooleanInput label="地圖樣式" source="hasMapStyle" />
              {formData.hasMapStyle && mapStyleInput()}
              <hr />
              <BooleanInput label="停止聲音" source="hasSilence" />
              {formData.hasSilence && silenceInput()}
            </>
          );
        }}
      </FormDataConsumer>
    </SimpleForm>
  );
};

export const BroadcastCreate = (props) => {
  return (
    <Create title={<Title />} {...props}>
      <InputForm {...props} showid="false" />
    </Create>
  );
};

export const BroadcastEdit = (props) => {
  return (
    <Edit title={<Title />} {...props}>
      <InputForm {...props} showid="true" />
    </Edit>
  );
};

function getCondition(currentNode, data) {
  const { locations, beacons } = data;
  if (currentNode.conditionType == "ALWAYS") {
    return { type: "ALWAYS" };
  } else {
    return {
      type: currentNode.conditionType,
      beaconId: currentNode.beacon
        ? beacons[currentNode.beacon].beaconId
        : null,
      threshold: currentNode.beaconThreshold,
      mode: currentNode.beaconType,
      location: currentNode.geofenceCenter
        ? locations[currentNode.geofenceCenter]
        : null,
      radius: currentNode.geofenceRadius || 14,
    };
  }
}

const getConditionIcon = (record) => {
  const delay =
    (record.hasSound && record.soundDelay) ||
    (record.hasHangUp && record.hangUpDelay) ||
    (record.hasIncomingCall && record.incomingCallDelay) ||
    (record.hasMarker && record.markerDelay) ||
    (record.hasMarkerRemoval && record.markerRemovalDelay) ||
    (record.hasPopup && record.popupDelay) ||
    (record.hasPopupDismissal && record.popupDismissalDelay) ||
    (record.hasMapStyle && record.mapStyleDelay);

  return (
    <>
      {record.conditionType == "TEXT" ? <ReplyIcon /> : <></>}
      {record.conditionType == "BEACON" ? <BluetoothIcon /> : <></>}
      {record.conditionType == "GEOFENCE" ? <MyLocationIcon /> : <></>}
      {record.conditionType == "ALWAYS" ? <ArrowForwardIcon /> : <></>}
      {delay ? <HourglassBottomIcon /> : <></>}
    </>
  );
};

function SendButton(props) {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const [loading, setLoading] = useState(false);
  const data = useAllData();
  const handleDialogClose = () => setOpen(false);
  const dispatch = useDispatch();
  const notify = useNotify();
  function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    const condition = getCondition(props.record, data);
    const scenario = localStorage.getItem("scenario");
    const actions = getActions(props.record, data, condition).map((a) => ({
      ...a,
      session: {
        scenario: scenario,
        chapter: "",
      },
    }));
    const messages = actions.map((a) => {
      return {
        payload: {
          type: "PERFORM_DIRECTLY",
          action: a,
        },
        sender: "ghost",
        receiver: "?u",
        id: `perform-${a.id}`,
        scenarioId: scenario,
      };
    });
    const url = `${apiUrl}/v1/broadcast`;
    Promise.all(
      messages.map((m) => {
        fetch(url, {
          method: "POST",
          body: JSON.stringify(m),
          headers: {
            "content-type": "application/json",
          },
        }).then((response) => {
          if (response.ok) {
            notify(`成功傳送「${getRecordField(props, "name")}」`, "success");
          } else {
            notify(
              "傳送失敗；原因 =" +
                JSON.stringify(response.body) +
                " " +
                response.status,
              "error"
            );
          }
        });
      })
    ).finally(() => {
      setLoading(false);
      dispatch(fetchEnd());
    });
  }
  return (
    <>
      <Button
        label="傳送"
        onClick={handleClick}
        disabled={loading}
        primary="true"
      />
      <Confirm
        isOpen={open}
        title="傳送"
        content={`你即將傳送「${getRecordField(
          props,
          "name"
        )}」給全部使用者。確定嗎？`}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        confirm="確認傳送"
        cancel="取消"
      />
    </>
  );
}
