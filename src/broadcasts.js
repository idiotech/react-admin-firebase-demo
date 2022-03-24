import * as React from "react";
import {
  ArrayInput,
  Button,
  BooleanInput,
  Confirm,
  NumberInput,
  SimpleFormIterator,
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
  CreateButton,
  SelectInput,
  SelectArrayInput,
  ReferenceInput,
  ReferenceArrayInput,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  FormDataConsumer,
  AutocompleteInput,
  required,
  number,
  FunctionField,
  AutocompleteArrayInput,
  useLoading,
  ArrayField,
  ReferenceField,
  fetchStart,
  fetchEnd,
  useNotify,
} from "react-admin";

import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';

import BluetoothIcon from '@material-ui/icons/Bluetooth';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import MessageIcon from '@material-ui/icons/Message';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import LocationOffIcon from '@material-ui/icons/LocationOff';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import CancelIcon from '@material-ui/icons/Cancel';
import PhoneCallbackIcon from '@material-ui/icons/PhoneCallback';
import PhoneDisabledIcon from '@material-ui/icons/PhoneDisabled';
import MapIcon from '@material-ui/icons/Map';
import ReplyIcon from '@material-ui/icons/Reply';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import HourglassBottomIcon from '@material-ui/icons/HourglassEmpty';

const conditionTypes = [
  { id: 'ALWAYS', name: '立刻' },
  { id: 'GEOFENCE', name: 'GPS觸發' },
  { id: 'BEACON', name: 'Beacon觸發' },
]

import { 
  destinations, soundModes, soundTypes, beaconTypes, 
    callTypes, getContentIcon, locationCondition, beaconCondition,
    soundInput, popupInput, popupDismissalInput, incomingCallInput, hangUpInput, 
    markerInput, markerRemovalInput, mapStyleInput
} from './actionCommon'

import {
  getAllData, getActions
} from './serverCommon'

const Title = ({ record }) => {
    return <span>《{localStorage.getItem('scenarioName')}》廣播{record && record.name ? `："${record.name}"` : ''}</span>;
};

const BroadcastFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

export const BroadcastList = (props) => {
  return <List title={<Title />} {...props} perPage={100} filters={<BroadcastFilter/>}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <FunctionField label="條件" render={getConditionIcon}/>
      <FunctionField label="內容" render={getContentIcon}/>
      <EditButton label="編輯" />
      <SendButton label="傳送" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
};

const InputForm = (props) => {
  return (
  <SimpleForm {...props}>
      <FormDataConsumer>
      {({ formData, ...rest }) => {
        return <>
          <TextInput label="名稱" source="name" validate={[required()]}/> <br/>
          {props.showid === "true" ? <TextInput source="id" options={{ disabled: true }}/> : <></> }
              <SelectInput label="觸發條件" source="conditionType" choices={conditionTypes} />
              <FormDataConsumer>
                {({
                  formData, // The whole form data
                  ...rest
                }) => {
                  const getSource = (field) => field
                  return <>
                    {
                      formData && formData.conditionType === 'GEOFENCE' &&
                      locationCondition(getSource)
                    }
                    {
                      formData && formData.conditionType === 'BEACON' &&
                      beaconCondition(getSource)
                    }
                  </>
                }}
              </FormDataConsumer>
              <br/>
          <NumberInput label="延遲時間 (千分之一秒)" source="delay" validate={[required(), number()]} />
          <BooleanInput label="聲音" source="hasSound" />
          {
            formData.hasSound && soundInput(formData)
          }
          <BooleanInput label="圖文訊息" source="hasPopup" />
          {
            formData.hasPopup && popupInput()
          }
          <BooleanInput label="關閉圖文框" source="hasPopupDismissal" />
          {
            formData.hasPopupDismissal && popupDismissalInput()
          }
          <BooleanInput label="來電" source="hasIncomingCall" />
          {
            formData.hasIncomingCall && incomingCallInput()
          }
          <BooleanInput label="掛電話" source="hasHangUp" />
          {
            formData.hasHangUp && hangUpInput()
          }
          <BooleanInput label="新圖釘" source="hasMarker" />
          {
            formData.hasMarker && markerInput()
          }
          <BooleanInput label="移除圖釘" source="hasMarkerRemoval" />
          {
            formData.hasMarkerRemoval && markerRemovalInput()
          }
          <BooleanInput label="地圖樣式" source="hasMapStyle" />
          {
            formData.hasMapStyle && mapStyleInput()
          }
        </>
      }}
      </FormDataConsumer>
      </SimpleForm>
  )  
}

export const BroadcastCreate = (props) => {
  return <Create title={<Title/>} {...props} >
    <InputForm {...props} showid="false" />
  </Create>
};

export const BroadcastEdit = (props) => {
  return <Edit title={<Title/>} {...props}>
    <InputForm {...props} showid="true" />
  </Edit>
};


function getCondition(currentNode, data) {
  const {locations, beacons} = data;
  if (currentNode.conditionType == 'ALWAYS') {
    return {type: 'ALWAYS'};
  } else {
    return {
      type: currentNode.conditionType,
      beaconId: currentNode.beacon ? beacons[currentNode.beacon].beaconId : null,
      threshold: currentNode.beaconThreshold,
      mode: currentNode.beaconType,
      location: currentNode.geofenceCenter ? locations[currentNode.geofenceCenter] : null,
      radius: currentNode.geofenceRadius || 14
    }
  }
}

const getConditionIcon = (record) => {
    const delay = (record.delay && record.delay != '0') ||
    record.hasSound && record.soundDelay ||
    record.hasHangUp && record.hangUpDelay ||
    record.hasIncomingCall && record.incomingCallDelay ||
    record.hasMarker && record.markerDelay ||
    record.hasMarkerRemoval && record.markerRemovalDelay ||
    record.hasPopup && record.popupDelay ||
    record.hasPopupDismissal && record.popupDismissalDelay ||
    record.hasMapStyle && record.mapStyleDelay
  
    return <>
      { record.conditionType == 'TEXT' ? <ReplyIcon />: <></>}
      { record.conditionType == 'BEACON' ? <BluetoothIcon/>: <></>}
      { record.conditionType == 'GEOFENCE' ? <MyLocationIcon/>: <></>}
      { record.conditionType == 'ALWAYS' ? <ArrowForwardIcon/>: <></>}
      { delay ? <HourglassBottomIcon/>: <></>}
    </>
  }

function SendButton(props) {
  const [open, setOpen] = useState(false);
  const handleClick = () => setOpen(true);
  const [loading, setLoading] = useState(false);
  const data = getAllData();
  const handleDialogClose = () => setOpen(false);
  const dispatch = useDispatch();
  const notify = useNotify();
  function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    const condition = getCondition(props.record, data);
    const scenario = localStorage.getItem('scenario');
    const actions = getActions(props.record, data, condition).map(a => ({
      ...a,
      session: {
        scenario: scenario,
        chapter: ""
      }
    }))
    const messages = actions.map(a => {
      return {
        payload: {
          type: 'PERFORM_DIRECTLY',
          action: a
        },
        sender: 'ghost',
        receiver: '?u',
        id: `perform-${a.id}`,
        scenarioId: scenario
      }
    })
    const url = "https://ghostspeak.floraland.tw/agent/v1/broadcast";
    Promise.all(
      messages.map(m => {
        fetch(url, {
          method: 'POST',
          body: JSON.stringify(m),
          headers: {
            'content-type': 'application/json'
          }
        })
        .then((response) => {
          if (response.ok) {
            notify(`成功傳送「${props.record.name}」`, 'success');
          } else {
            notify("傳送失敗；原因 =" + JSON.stringify(response.body) + " " + response.status, 'error');
          }
        })
      })
    )
    .finally(() => {
      setLoading(false);
      dispatch(fetchEnd());
    })
  }
  return (<>
    <Button
      label="傳送"
      onClick={handleClick}
      disabled={ loading }
      primary="true"
    />
    <Confirm
      isOpen={open}
      title="傳送"
      content= {`你即將傳送「${props.record.name}」給全部使用者。確定嗎？`}
      onConfirm={handleConfirm}
      onClose={handleDialogClose}
      confirm="確認傳送"
      cancel="取消"
    />
  </>)
}