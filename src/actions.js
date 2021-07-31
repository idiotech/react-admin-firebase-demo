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
  ReferenceArrayInput,
  ReferenceArrayField,
  SingleFieldList,
  ChipField,
  ShowView,
  FormDataConsumer,
  AutocompleteInput,
  TabbedForm,
  FormTab,
  required,
  ImageField
} from "react-admin";

import { Link } from 'react-router-dom';
import { useForm } from 'react-final-form';

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
      <ReferenceArrayField label="上一步" source="parents" reference="actions">
        <SingleFieldList>
            <ChipField source="name" />
        </SingleFieldList>
      </ReferenceArrayField>
      <EditButton label="編輯" />
      <NextButton source="id" label="下一步" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

function shouldShow(formData, parent, t) {
  console.log('compare', parent, 'triggers_' + parent + '_conditionType', formData['triggers_' + parent + '_conditionType'], t)
  return formData['triggers_' + parent + '_conditionType'] === t
}

function createTrigger(parent, formData) {
  console.log('trigger parent', parent)
  function content() {
    if (shouldShow(formData, parent, 'GEOFENCE')) {
     return <div>
        <LocationReferenceInput label="中心點" source={'triggers_' + parent + '_geofenceCenter'} reference="locations" >
          <AutocompleteInput optionText="name" />
        </LocationReferenceInput>
        <NumberInput label="範圍" source={'triggers_' + parent + '_geofenceRadius'} />公尺
      </div>
    } else if (shouldShow(formData, parent, 'BEACON')) {
      return <div>
        <ReferenceInput label="Beacon" source={'triggers_' + parent + '_beacon'} reference="beacons" >
          <AutocompleteInput optionText="name" />
        </ReferenceInput>
        <SelectInput label="模式" source={'triggers_' + parent + '_beaconType'}  choices={beaconTypes} initialValue={'ENTER'} />&nbsp;
        <NumberInput label="訊號值" source={'triggers_' + parent + '_beaconThreshold'}  />
      </div>
    } else if (shouldShow(formData, parent, 'TEXT')) {
      return <TextInput multiline label="文字" source={'triggers_' + parent + '_userReply'}  />
    }
  }
  return <div key={'triggers_' + parent}>
    <ReferenceInput label="接續" source={'triggers_' + parent + '_id'} reference="actions" initialValue={parent} disabled>
      <SelectInput optionText="name"  initialValue={parent} />
    </ReferenceInput>
    <SelectInput label="類型" source={'triggers_' + parent + '_conditionType'} choices={conditionTypes} initialValue="ALWAYS" />
    { content() }
    <br/>
  </div>
}

const InputForm = (props) => {
  console.log('props =', props)
  return (
  <SimpleForm {...props}>
    {props.showid ? <TextInput source="id" options={{ disabled: true }}/> : <></> }
          <BooleanInput label="開頭" source="firstAction" />
          <FormDataConsumer>
               {({ formData, ...rest }) => 
                !formData.firstAction &&
                  <ReferenceArrayInput label="上一步" source="parents" reference="actions">
                    <SelectArrayInput optionText="name" />
                  </ReferenceArrayInput>
                }
          </FormDataConsumer>
          <TextInput label="名稱" source="name" validate={requiredField}/>
          <NumberInput label="延遲時間 (千分之一秒)" source="delay" />
          <FormDataConsumer>
            {({ formData, ...rest }) => {
              console.log('trigger formData.parents', props)
              return <>
                { (formData.parents) 
                  ? formData.parents.map(p => {
                    if (!formData['triggers_' + p + '_id']) {
                      props.record['triggers_' + p + '_id'] = p
                    }
                    if (!formData['triggers_' + p + '_conditionType']) {
                      props.record['triggers_' + p + '_conditionType'] = 'ALWAYS'
                    }
                    return createTrigger(p, formData)
                  })
                  : []
                }
              </>
            }}
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