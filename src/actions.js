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
  SimpleShowLayout,
  SimpleForm,
  TextField,
  TextInput,
  Button,
  ShowButton,
  EditButton,
  DeleteButton,
  CreateButton,
  ShowController,
  SelectInput,
  SelectField,
  SelectArrayInput,
  ReferenceInput,
  ReferenceField,
  ShowView,
  FormDataConsumer,
  AutocompleteInput,
  TabbedForm,
  FormTab,
  required,
  ImageField
} from "react-admin";

import { Link } from 'react-router-dom';

import LocationReferenceInput from './LocationReferenceInput';
import SoundReferenceInput from './SoundReferenceInput';
import ImageReferenceInput from './ImageReferenceInput';

const ActionFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const requiredField = []

const destinations = [
          { id: 'NOTIFICATION', name: '通知列' },
          { id: 'APP', name: '對話視窗' },
          { id: 'INTRO', name: '前情提要' },
          { id: 'WELCOME', name: '歡迎頁面' },
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

const Title = ({ record }) => {
    return <span>動作{record && record.name ? `："${record.name}"` : ''}</span>;
};

export const ActionList = (props) => (
  <List title={<Title />} {...props} filters={<ActionFilter/>}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <SelectField label="觸發條件" source="conditionType" choices={conditionTypes} />
      <EditButton label="編輯" />
      <NextButton source="id" label="下一步" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

function inputForm(props, showId) {
  return (
  <SimpleForm>
    {showId ? <TextInput source="id" options={{ disabled: true }}/> : <></> }
          <BooleanInput label="開頭" source="firstAction" />
          <FormDataConsumer>
               {({ formData, ...rest }) => 
                !formData.firstAction &&
              <ReferenceInput label="上一步" source="parent" reference="actions">
                <AutocompleteInput optionText="name" />
              </ReferenceInput>
                }
          </FormDataConsumer>
          <TextInput label="名稱" source="name" validate={requiredField}/>
          <NumberInput label="延遲時間 (千分之一秒)" source="delay" />
          <SelectInput label="觸發條件" source="conditionType" choices={conditionTypes} initialValue={'ALWAYS'} />
          <FormDataConsumer>
              {({ formData, ...rest }) => formData.conditionType === 'GEOFENCE' &&
              <div>
                <LocationReferenceInput label="中心點" source="geofenceCenter" reference="locations" >
                  <AutocompleteInput optionText="name" />
                </LocationReferenceInput>
                <NumberInput label="範圍" source="geofenceRadius" />公尺
              </div>
              }
          </FormDataConsumer>
          <FormDataConsumer>
              {({ formData, ...rest }) => formData.conditionType === 'BEACON' &&
              <div>
                <ReferenceInput label="Beacon" source="beacon" reference="beacons" >
                  <AutocompleteInput optionText="name" />
                </ReferenceInput>
                <SelectInput label="模式" source="beaconType" choices={beaconTypes} initialValue={'ENTER'} />&nbsp;
                <NumberInput label="訊號值" source="beaconThreshold" />
              </div>
              }
          </FormDataConsumer>
          <FormDataConsumer>
              {({ formData, ...rest }) => formData.conditionType === 'TEXT' &&
              <TextInput multiline label="文字" source="userReply" />
              }
          </FormDataConsumer>
          <BooleanInput label="聲音" source="hasSound" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasSound &&
                <>
                    <SoundReferenceInput label="音檔" source="soundId" reference="sounds">
                      <AutocompleteInput optionText="name" />
                    </SoundReferenceInput>
                    <SelectInput label="聲音類型" source="soundType" choices={soundTypes} initialValue={'MAIN'}  />
                    <SelectInput label="音量模式" source="mode" choices={soundModes} initialValue={'STATIC_VOLUME'}  />
                    <FormDataConsumer>
                    {({ formData, ...rest }) => formData.mode === 'STATIC_VOLUME' &&
                        <div>
                          <NumberInput label="淡出秒數" source="fadeOutSeconds" /><br/>
                          <NumberInput label="淡入秒數" source="fadeInSeconds" /><br/>
                          <NumberInput label="正文秒數" source="speechLength" />
                        </div>
                    }
                    </FormDataConsumer>
                    <FormDataConsumer>
                    {({ formData, ...rest }) => formData.mode === 'DYNAMIC_VOLUME' &&
                        <div>
                        <LocationReferenceInput label="中心點" source="locationId" reference="locations" >
                          <AutocompleteInput optionText="name" />
                        </LocationReferenceInput>
                        <NumberInput label="最小音量" source="minVolume" /> 0-1之間<br/>
                        <NumberInput label="範圍" source="range"  />公尺
                        </div>
                    }
                    </FormDataConsumer>
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
                        <ImageReferenceInput label="圖檔" source="pictureId" reference="images" />
                      </SimpleFormIterator>
                    </ArrayInput>
                    <ArrayInput label="回應按鈕" source="choices">
                      <SimpleFormIterator>
                        <TextInput source="choice" label="選擇" />
                      </SimpleFormIterator>
                    </ArrayInput>
                    <BooleanInput label="允許文字回應" source="allowTextReply" initialValue={false} />
                    <SelectArrayInput label="顯示於" source="destinations" choices={destinations} />
                </>
                }
          </FormDataConsumer>
          <BooleanInput label="新圖釘" source="hasMarker" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasMarker &&
                <>
                <TextInput label="標題" source="title" /><br/>
                <ImageReferenceInput label="圖示檔案" source="markerIcon" reference="images" />
                <LocationReferenceInput label="座標" source="locationId" reference="locations" >
                  <AutocompleteInput optionText="name" />
                </LocationReferenceInput>
                </>
                }
          </FormDataConsumer>
          <BooleanInput label="移除圖釘" source="hasMarkerRemoval" />
          <FormDataConsumer>
               {({ formData, ...rest }) => formData.hasMarkerRemoval &&
                <ReferenceInput label="圖釘" source="markerId" reference="actions" filter={{ hasMarker: true }}>
                    <SelectInput optionText="name" />
                </ReferenceInput>
                }
          </FormDataConsumer>
      </SimpleForm>
  )  
}

export const ActionCreate = (props) => (
  <Create title={<Title/>} {...props} >
    { inputForm(props, false) }
  </Create>
);

export const ActionEdit = (props) => (
  <Edit title={<Title/>} {...props}>
    { inputForm(props, true) }
  </Edit>
);

function NextButton(props) {
  return (
    <CreateButton label="下一步"
      to={{
        pathname: '/actions/create',
        state: { record: { parent: props.record.id  } }
      }}
    />
  )
}