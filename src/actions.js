import * as React from "react";
import {
  ArrayInput,
  BooleanInput,
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
  ReferenceField
} from "react-admin";

import BluetoothIcon from '@material-ui/icons/Bluetooth';
import AudiotrackIcon from '@material-ui/icons/Audiotrack';
import MessageIcon from '@material-ui/icons/Message';
import MyLocationIcon from '@material-ui/icons/MyLocation';
import LocationOffIcon from '@material-ui/icons/LocationOff';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import CancelIcon from '@material-ui/icons/Cancel';
import PhoneCallbackIcon from '@material-ui/icons/PhoneCallback';
import ReplyIcon from '@material-ui/icons/Reply';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import LocationReferenceInput from './LocationReferenceInput';
import SoundReferenceInput from './SoundReferenceInput';
import ImageReferenceInput from './ImageReferenceInput';

const ActionFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const destinations = [
          { id: 'NOTIFICATION', name: '通知列' },
          { id: 'APP', name: '對話視窗' },
          { id: 'ALERT', name: '提示視窗' },
          { id: 'INTRO', name: '前情提要' },
          { id: 'WELCOME', name: '停用，請勿選擇' },
]
const soundModes = [
          { id: 'STATIC_VOLUME', name: '固定' },
          { id: 'DYNAMIC_VOLUME', name: '遠近調整' },
]
const soundTypes = [
          { id: 'MAIN', name: '主劇情' },
          { id: 'BACKGROUND', name: '背景單次' },
          { id: 'LOOP', name: '背景循環' }
]
const conditionTypes = [
          { id: 'ALWAYS', name: '上個動作結束' },
          { id: 'TEXT', name: '文字回應' },
          { id: 'GEOFENCE', name: 'GPS觸發' },
          { id: 'BEACON', name: 'Beacon觸發' },
]
const beaconTypes = [
          { id: 'ENTER', name: '接近' },
          { id: 'EXIT', name: '離開' },
]
const callTypes = [
          { id: 'CONNECTING', name: '未接通' },
          { id: 'CONNECTED', name: '接通' }
]
const Title = ({ record }) => {
    return <span>動作{record && record.name ? `："${record.name}"` : ''}</span>;
};

const getConditionIcon = (record) => {
  const conds = record.prevs 
    ? new Set(record.prevs.flatMap(p => p.conditionType))
    : new Set()
   
  return <>
    { conds.has('TEXT') ? <ReplyIcon />: <></>}
    { conds.has('BEACON') ? <BluetoothIcon/>: <></>}
    { conds.has('GEOFENCE') ? <MyLocationIcon/>: <></>}
    { conds.has('ALWAYS') ? <ArrowForwardIcon/>: <></>}
  </>
}

const getContentIcon = (record) => {
  return <>
    { record.hasSound ? <AudiotrackIcon />: <></>}
    { record.hasPopup ? <MessageIcon/>: <></>}
    { record.hasIncomingCall ? <PhoneCallbackIcon/>: <></>}
    { record.hasPopupDismissal ? <CancelIcon/>: <></>}
    { record.hasMarker ? <AddLocationIcon/>: <></>}
    { record.hasMarkerRemoval ? <LocationOffIcon/>: <></>}
  </>
}

export const ActionList = (props) => {
  return <List title={<Title />} {...props} perPage={100} filters={<ActionFilter/>}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <FunctionField label="條件" render={getConditionIcon}/>
      <FunctionField label="內容" render={getContentIcon}/>
      <EditButton label="編輯" />
      <ArrayField label="上一步" source="prevs">
        <Datagrid>
          <ReferenceField label="" source="prev" reference="actions">
            <ChipField source="name" />
          </ReferenceField>
        </Datagrid>
      </ArrayField>
      <NextButton source="id" label="下一步" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
};

const InputForm = (props) => {
  console.log(`rewrite with ${JSON.stringify(props)}`)
  const [locked, setLocked] = React.useState(true)
  const loading = useLoading();
  const parentMap = new Map()

  return (
  <SimpleForm {...props}>
      <FormDataConsumer>
      {({ formData, ...rest }) => {
        return <>
          {props.showid === "true" ? <TextInput source="id" options={{ disabled: true }}/> : <></> }
          <BooleanInput label="開頭" source="firstAction" />
          {formData.firstAction || <ArrayInput label="前一步" source="prevs">
            <SimpleFormIterator>
              <ReferenceInput label="接續" source="prev" reference="actions" sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
                <SelectInput optionText="name" />
              </ReferenceInput>
              <SelectInput label="觸發條件" source="conditionType" choices={conditionTypes} initialValue="ALWAYS" />
              <FormDataConsumer>
                {({
                  formData, // The whole form data
                  scopedFormData, // The data for this item of the ArrayInput
                  getSource, // A function to get the valid source inside an ArrayInput
                  ...rest
                }) => 
                  <>
                    {
                      scopedFormData && scopedFormData.conditionType === 'GEOFENCE' &&
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
                        <br/>
                        <NumberInput 
                          label="範圍" 
                          source={getSource("geofenceRadius")}
                          initialValue={14}
                          validate={[required(), number()]} 
                        />公尺
                      </>
                    }
                    {
                      scopedFormData && scopedFormData.conditionType === 'BEACON' &&
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
                          initialValue={'ENTER'} 
                        />
                        <br/>
                        <NumberInput 
                          label="訊號值"
                          source={getSource("beaconThreshold")}
                          initialValue={-85}
                          validate={[required(), number()]}
                        />
                      </>
                    }
                    {
                      scopedFormData && scopedFormData.conditionType === 'TEXT' &&
                        <TextInput 
                          multiline
                          label="文字"
                          source={getSource("userReply")}
                          validate={[required()]}
                        />
                    }
                  </>
                }
              </FormDataConsumer>
            </SimpleFormIterator>
          </ArrayInput>}
          {
            !formData.firstAction &&
            <>
              <ReferenceArrayInput label="互斥於" source="exclusiveWith" reference="actions" sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
                <AutocompleteArrayInput optionText="name" />
              </ReferenceArrayInput>
            </>
          }
          <TextInput label="名稱" source="name" validate={[required()]}/> <br/>
          <NumberInput label="延遲時間 (千分之一秒)" source="delay" initialValue={0} validate={[required(), number()]} />
          <BooleanInput label="聲音" source="hasSound" />
          {
            formData.hasSound &&
            <>
                <SoundReferenceInput label="音檔" source="soundId" reference="sounds" sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000} validate={[required()]}>
                  <AutocompleteInput optionText="name" />
                </SoundReferenceInput>
                <SelectInput label="聲音類型" source="soundType" choices={soundTypes} initialValue={'MAIN'}  />
                <SelectInput label="音量模式" source="mode" choices={soundModes} initialValue={'STATIC_VOLUME'}  />
                {
                  formData.mode === 'STATIC_VOLUME' &&
                  <div>
                    <NumberInput label="淡出秒數" source="fadeOutSeconds" validate={[number()]} /><br/>
                    <NumberInput label="正文秒數" source="speechLength" validate={[number()]} />
                  </div>
                }
                {
                  formData.mode === 'DYNAMIC_VOLUME' &&
                  <div>
                  <LocationReferenceInput label="中心點" source="soundCenterId" reference="locations" validate={[required()]} perPage={1000}>
                    <AutocompleteInput optionText="name" />
                  </LocationReferenceInput>
                  <NumberInput label="最小音量" source="minVolume" initialValue={0} validate={[required(), number()]} /> 0-1之間<br/>
                  <NumberInput label="範圍" source="range" initialValue={30} validate={[required(), number()]}/>公尺
                  </div>
                }
                <NumberInput label="延遲時間 (千分之一秒)" source="soundDelay" validate={[number()]} />
            </>
          }
          <BooleanInput label="圖文訊息" source="hasPopup" />
          {
            formData.hasPopup &&
            <>
                <TextInput multiline label="文字" source="text" />
                <ArrayInput label="圖片" source="pictures">
                  <SimpleFormIterator>
                    <ImageReferenceInput label="圖檔" source="pictureId" reference="images"  sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000} />
                  </SimpleFormIterator>
                </ArrayInput>
                <ArrayInput label="回應按鈕" source="choices">
                  <SimpleFormIterator>
                    <TextInput source="choice" label="選擇" />
                  </SimpleFormIterator>
                </ArrayInput>
                <BooleanInput label="允許文字回應" source="allowTextReply" initialValue={false} />
                <SelectArrayInput label="顯示於" source="destinations" choices={destinations} /> <br/>
                <NumberInput label="延遲時間 (千分之一秒)" source="popupDelay" validate={[number()]} />
            </>
          }
          <BooleanInput label="關閉圖文框" source="hasPopupDismissal" />
          {
            formData.hasPopupDismissal &&
            <>
                <SelectArrayInput label="關閉" source="dismissalDestinations" choices={destinations} /> <br/>
                <NumberInput label="延遲時間 (千分之一秒)" source="dismissalDelay" validate={[number()]} />
            </>
          }
          <BooleanInput label="來電" source="hasIncomingCall" />
          {
            formData.hasIncomingCall &&
            <>
                <TextInput label="來電人" source="caller" validate={[required()]}/>
                <ImageReferenceInput label="圖示檔案" source="portrait" reference="images" validate={[required()]} sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000} />
                <SelectInput label="狀態" source="callStatus"  choices={callTypes} initialValue={'CONNECTING'} /> <br/>
                <NumberInput label="延遲時間 (千分之一秒)" source="incomingCallDelay" validate={[number()]} />
            </>
          }
          <BooleanInput label="掛電話" source="hasHangUp" />
          {
            formData.hasHangUp &&
            <>
                <TextInput label="來電人" source="caller" validate={[required()]}/>
                <ImageReferenceInput label="圖示檔案" source="portrait" reference="images" validate={[required()]} sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000} />
                <NumberInput label="延遲時間 (千分之一秒)" source="hangUpDelay" validate={[number()]} />
            </>
          }
          <BooleanInput label="新圖釘" source="hasMarker" />
          {
            formData.hasMarker &&
            <>
            <TextInput label="標題" source="title" /><br/>
            <ImageReferenceInput label="圖示檔案" source="markerIcon" reference="images" validate={[required()]} sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000} />
            <LocationReferenceInput label="座標" source="locationId" reference="locations" validate={[required()]} sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000} >
              <AutocompleteInput optionText="name" />
            </LocationReferenceInput>
            <br/>
            <NumberInput label="延遲時間 (千分之一秒)" source="markerDelay" validate={[number()]} />
            </>
          }
          <BooleanInput label="移除圖釘" source="hasMarkerRemoval" />
          {
            formData.hasMarkerRemoval &&
            <>
               <ReferenceInput label="圖釘" source="markerId" reference="actions" validate={[required()]} filter={{ hasMarker: true }}  sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
                 <SelectInput optionText="title" />
               </ReferenceInput>
               <br/>
               <NumberInput label="延遲時間 (千分之一秒)" source="markerRemovalDelay" validate={[number()]} />
            </>
          }
          <BooleanInput label="地圖樣式" source="hasMapStyle" />
          {
            formData.hasMapStyle &&
            <>
               <ReferenceInput label="樣式" source="mapStyle" reference="mapStyles" validate={[required()]} sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
                 <SelectInput optionText="name" />
               </ReferenceInput>
               <br/>
               <NumberInput label="延遲時間 (千分之一秒)" source="mapStyleDelay" validate={[number()]} />
            </>
          }
        </>
      }}
      </FormDataConsumer>
      </SimpleForm>
  )  
}

export const ActionCreate = (props) => {
  return <Create title={<Title/>} {...props} >
    <InputForm {...props} showid="false" />
  </Create>
};

export const ActionEdit = (props) => {
  return <Edit title={<Title/>} {...props}>
    <InputForm {...props} showid="true" />
  </Edit>
};

function NextButton(props) {
  return (
    <CreateButton label="下一步"
      to={{
        pathname: '/actions/create',
        state: { record: { prevs: [{prev: props.record.id, conditionType: 'ALWAYS'}] }}
      }}
    />
  )
}