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
  BooleanField,
  useLoading
} from "react-admin";

import { useFormState } from 'react-final-form';

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
          { id: 'CONNECTED', name: '接通' },
          { id: 'DISCONNECTED', name: '掛斷' }
]
const Title = ({ record }) => {
    return <span>動作{record && record.name ? `："${record.name}"` : ''}</span>;
};

const CheckField = ({ record = {}, source, TrueIcon}) => {
  let theRecord = {...record};

  theRecord[source + '-exist'] = !!record[source];

  return <BooleanField record={theRecord} TrueIcon={TrueIcon} source={source + '-exist'} />
}

const getConditionIcon = (record) => {
  const parents = new Set(record.parents)
  const conds = new Set(Object.entries(record)
    .filter(e => 
      e[0].startsWith('triggers_') && 
      e[0].endsWith('_conditionType') &&
      parents.has(e[0].slice(9, e[0].length - 14))
    )
    // .filter(e => )
    .map(e => e[1]))

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
      <ReferenceArrayField label="上一步" source="parents" reference="actions">
        <SingleFieldList>
            <ChipField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
      <NextButton source="id" label="下一步" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
};

function shouldShow(formData, parent, t) {
  console.log('compare', parent, 'triggers_' + parent + '_conditionType', formData['triggers_' + parent + '_conditionType'], t)
  return formData['triggers_' + parent + '_conditionType'] === t
}

function TriggerList(props) {
  const {values} = useFormState();
  console.log('comparison', props.record.parents, values.parents)
  const formData = values;
  function content(parent) {
    if (shouldShow(formData, parent, 'GEOFENCE')) {
      return <div key={'triggers_' + parent + '_geofence'}>
        <LocationReferenceInput label="中心點" source="geofenceCenter" reference="locations" validate={[required()]} perPage={1000}>
          <AutocompleteInput optionText="name" />
        </LocationReferenceInput>
        <NumberInput label="範圍" source="geofenceRadius" initialValue="14" validate={[required(), number()]} />公尺
      </div>
    } else if (shouldShow(formData, parent, 'BEACON')) {
      return <div key={'triggers_' + parent + '_beacon'}>
        <ReferenceInput label="Beacon" source="beacon" reference="beacons" validate={[required()]} >
          <AutocompleteInput optionText="name" />
        </ReferenceInput>
        <SelectInput label="模式" source="beaconType"  choices={beaconTypes} initialValue={'ENTER'} />&nbsp;
        <NumberInput label="訊號值" source="beaconThreshold" initialValue="-50" validate={[required(), number()]} />
      </div>
    } else if (shouldShow(formData, parent, 'TEXT')) {
      return <TextInput multiline label="文字" source={'triggers_' + parent + '_userReply'} validate={[required()]} />
    }
  }
  return <div>
    { formData.parents.map(parent => 
      <div key={'triggers_' + parent}>
        <ReferenceInput label="接續" source={'triggers_' + parent + '_id'} reference="actions" initialValue={parent} disabled  sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
          <SelectInput optionText="name" initialValue={parent} />
        </ReferenceInput>
        <SelectInput label="類型" source={'triggers_' + parent + '_conditionType'} choices={conditionTypes} initialValue="ALWAYS" />
        { content(parent) }
      </div>
      )
    }
  </div>
}

const InputForm = (props) => {
  console.log(`rewrite with ${JSON.stringify(props)}`)
  const [locked, setLocked] = React.useState(true)
  const loading = useLoading();

  const parentMap = new Map()

  return (
  <SimpleForm {...props}>
    {props.showid === "true" ? <TextInput source="id" options={{ disabled: true }}/> : <></> }
          <BooleanInput label="開頭" source="firstAction" />
          <FormDataConsumer>
               {({ formData, ...rest }) =>  !formData.firstAction &&
                  <>
                    <ReferenceArrayInput label="上一步" source="parents" reference="actions" disabled={loading} sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
                      <AutocompleteArrayInput optionText="name" />
                    </ReferenceArrayInput>
                    <ReferenceArrayInput label="互斥於" source="exclusiveWith" reference="actions" sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
                      <AutocompleteArrayInput optionText="name" />
                    </ReferenceArrayInput>
                  </>
                }
          </FormDataConsumer>
          <TextInput label="名稱" source="name" validate={[required()]}/>
          <NumberInput label="延遲時間 (千分之一秒)" source="delay" initialValue="0" validate={[required(), number()]} />
          <FormDataConsumer>
            {({ formData, ...rest }) => {
              console.log(`trigger: rewriting records with form: ${formData.parents}, record: ${props.record.parents}`)
              if (!formData.parents) {
                return <></>
              } else {
                formData.parents.map(p => {
                  if (!formData['triggers_' + p + '_id']) {
                    props.record['triggers_' + p + '_id'] = p
                  }
                  if (!formData['triggers_' + p + '_conditionType']) {
                    props.record['triggers_' + p + '_conditionType'] = 'ALWAYS'
                  }
                })
                return <TriggerList {...props}/>
              }
            }}
          </FormDataConsumer>
          <BooleanInput label="聲音" source="hasSound" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasSound &&
                <>
                    <SoundReferenceInput label="音檔" source="soundId" reference="sounds" sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000} validate={[required()]}>
                      <AutocompleteInput optionText="name" />
                    </SoundReferenceInput>
                    <SelectInput label="聲音類型" source="soundType" choices={soundTypes} initialValue={'MAIN'}  />
                    <SelectInput label="音量模式" source="mode" choices={soundModes} initialValue={'STATIC_VOLUME'}  />
                    <FormDataConsumer>
                    {({ formData, ...rest }) => formData.mode === 'STATIC_VOLUME' &&
                        <div>
                          <NumberInput label="淡出秒數" source="fadeOutSeconds" validate={[number()]} /><br/>
                          <NumberInput label="正文秒數" source="speechLength" validate={[number()]} />
                        </div>
                    }
                    </FormDataConsumer>
                    <FormDataConsumer>
                    {({ formData, ...rest }) => formData.mode === 'DYNAMIC_VOLUME' &&
                        <div>
                        <LocationReferenceInput label="中心點" source="soundCenterId" reference="locations" validate={[required()]} perPage={1000}>
                          <AutocompleteInput optionText="name" />
                        </LocationReferenceInput>
                        <NumberInput label="最小音量" source="minVolume" initialValue="0" validate={[required(), number()]} /> 0-1之間<br/>
                        <NumberInput label="範圍" source="range" initialValue="30" validate={[required(), number()]}/>公尺
                        </div>
                    }
                    </FormDataConsumer>
                    <NumberInput label="延遲時間 (千分之一秒)" source="soundDelay" validate={[number()]} />
                </>
                }
          </FormDataConsumer>
          <BooleanInput label="圖文訊息" source="hasPopup" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasPopup &&
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
                    <SelectArrayInput label="顯示於" source="destinations" choices={destinations} />
                    <NumberInput label="延遲時間 (千分之一秒)" source="popupDelay" validate={[required()]} />
                </>
                }
          </FormDataConsumer>
          <BooleanInput label="關閉圖文框" source="hasPopupDismissal" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasPopupDismissal &&
                <>
                    <SelectArrayInput label="關閉" source="dismissalDestinations" choices={destinations} /> <br/>
                    <NumberInput label="延遲時間 (千分之一秒)" source="dismissalDelay" validate={[number()]} />
                </>
               }
          </FormDataConsumer>
          <BooleanInput label="來電" source="hasIncomingCall" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasIncomingCall &&
                <>
                    <TextInput label="來電人" source="caller" validate={[required()]}/>
                    <ImageReferenceInput label="圖示檔案" source="portrait" reference="images" validate={[required()]} sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000} />
                    <SelectInput label="狀態" source="callStatus"  choices={callTypes} initialValue={'CALLING'} /> <br/>
                    <NumberInput label="延遲時間 (千分之一秒)" source="incomingCallDelay" validate={[number()]} />
                </>
                }
          </FormDataConsumer>
          <BooleanInput label="新圖釘" source="hasMarker" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasMarker &&
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
          </FormDataConsumer>
          <BooleanInput label="移除圖釘" source="hasMarkerRemoval" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasMarkerRemoval &&
                 <>
                    <ReferenceInput label="圖釘" source="markerId" reference="actions" validate={[required()]} filter={{ hasMarker: true }}  sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
                      <SelectInput optionText="title" />
                    </ReferenceInput>
                    <br/>
                    <NumberInput label="延遲時間 (千分之一秒)" source="markerRemovalDelay" validate={[number()]} />
                 </>
                }
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
        state: { record: { parents: [props.record.id]  } }
      }}
    />
  )
}