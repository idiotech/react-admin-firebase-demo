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
  ShowButton,
  EditButton,
  DeleteButton,
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
  required
} from "react-admin";


const ActionFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const requiredField = []

const actionTypes = [
          { id: 'SOUND', name: '聲音' },
          { id: 'POPUP', name: '圖文訊息' },
          { id: 'MARKER_ADD', name: '新增圖釘' },
          { id: 'MARKER_REMOVAL', name: '刪除圖釘' },
]

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
const conditionTypes = [
          { id: 'ALWAYS', name: '立刻觸發' },
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
      <SelectField label="類型" source="category" choices={actionTypes} />
      <SelectField label="觸發條件" source="conditionType" choices={conditionTypes} />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);


export const ActionShow = props => (
    <ShowController {...props}>
        {controllerProps =>
            <ShowView {...props} {...controllerProps}>
                <SimpleShowLayout>
                    <TextField source="id" />
                    <TextField source="name" />
                    <SelectField source="category" choices={actionTypes} />
                    {
                        controllerProps.record && controllerProps.record.category === 'MARKER_ADD' &&
                        <SimpleShowLayout label="details">
                          <TextField source="title"/>
                          <TextField source="icon"/>
                          <ReferenceField label="Location" source="locationId" reference="locations">
                            <TextField source="name" />
                          </ReferenceField>
                        </SimpleShowLayout>
                    }
                    {
                        controllerProps.record && controllerProps.record.category === 'SOUND' &&
                        <TextField source="url" />
                    }
                    {
                        controllerProps.record && controllerProps.record.category === 'POPUP' &&
                        <TextField source="text" />
                    }
                    <TextField multiline source="description" />
                </SimpleShowLayout>
            </ShowView>
        }
    </ShowController>
);


export const ActionCreate = (props) => (
  <Create {...props} >
      <TabbedForm>
        <FormTab label="基本資料">
          <TextInput label="名稱" source="name" validate={requiredField}/>
          <TextInput multiline label="說明" source="description" />
        </FormTab>
        <FormTab label="內容">
          <SelectInput label="類型" source="category" initialValue="SOUND" choices={actionTypes} validate={requiredField} />
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.category === 'MARKER_ADD' &&
                <div>
                <TextInput label="標題" source="title" /><br/>
                <TextInput source="圖示網址" /><br/>
                <ReferenceInput label="座標" source="locationId" reference="locations">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                </div>
                }
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.category === 'MARKER_REMOVAL' &&
                <ReferenceInput label="圖釘" source="markerId" reference="actions" filter={{ category: 'MARKER_ADD' }}>
                    <SelectInput optionText="name" />
                </ReferenceInput>
                }
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.category === 'POPUP' &&
                <div>
                    <TextInput multiline label="文字" source="text" />
                    <ArrayInput label="圖片" source="pictures">
                      <SimpleFormIterator>
                        <TextInput source="picture" label="圖片" />
                      </SimpleFormIterator>
                    </ArrayInput>
                    <ArrayInput label="回應按鈕" source="choices">
                      <SimpleFormIterator>
                        <TextInput source="choice" label="選擇" />
                      </SimpleFormIterator>
                    </ArrayInput>
                    <BooleanInput label="允許文字回應" source="allowTextReply" initialValue={false} />
                    <SelectArrayInput label="顯示於" source="destinations" choices={destinations} />
                </div>
                }
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.category === 'SOUND' &&
                <div>
                    <TextInput multiline label="音檔網址" source="url" /><br/>
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
                        <ReferenceInput label="中心點" source="locationId" reference="locations">
                            <AutocompleteInput optionText="name" />
                        </ReferenceInput>
                        <NumberInput label="最小音量" source="minVolume" /> 0-1之間<br/>
                        <NumberInput label="範圍" source="range"  />公尺
                        </div>
                    }
                    </FormDataConsumer>
                </div>
                }
            </FormDataConsumer>
        </FormTab>
        <FormTab label="觸發條件">
            <SelectInput label="觸發條件" source="conditionType" choices={conditionTypes} initialValue={'ALWAYS'} />
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.conditionType === 'GEOFENCE' &&
                <div>
                  <ReferenceInput label="中心點" source="geofenceCenter" reference="locations" >
                    <AutocompleteInput optionText="name" />
                  </ReferenceInput>
                  <NumberInput label="範圍" source="geofenceRadius" />公尺
                </div>
                }
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.conditionType === 'BEACON' &&
                <div>
                    <SelectInput label="模式" source="beaconType" choices={beaconTypes} initialValue={'ENTER'} />&nbsp;
                    <NumberInput label="訊號值" source="beaconThreshold" />
                </div>
                }
            </FormDataConsumer>
        </FormTab>
      </TabbedForm>
  </Create>
);

export const ActionEdit = (props) => (
  <Edit {...props}>
      <TabbedForm>
        <FormTab label="基本資料">
          <TextInput source="id" options={{ disabled: true }}/>
          <TextInput label="名稱" source="name" validate={requiredField}/>
          <TextInput multiline label="說明" source="description" />
        </FormTab>
        <FormTab label="內容">
          <SelectInput label="類型" source="category" initialValue="SOUND" choices={actionTypes} validate={requiredField} />
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.category === 'MARKER_ADD' &&
                <div>
                <TextInput label="標題" source="title" /><br/>
                <TextInput source="圖示網址" /><br/>
                <ReferenceInput label="座標" source="locationId" reference="locations">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                </div>
                }
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.category === 'MARKER_REMOVAL' &&
                <ReferenceInput label="圖釘" source="markerId" reference="actions" filter={{ category: 'MARKER_ADD' }}>
                    <SelectInput optionText="name" />
                </ReferenceInput>
                }
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.category === 'POPUP' &&
                <div>
                    <TextInput multiline label="文字" source="text" />
                    <ArrayInput label="圖片" source="pictures">
                      <SimpleFormIterator>
                        <TextInput source="picture" label="圖片" />
                      </SimpleFormIterator>
                    </ArrayInput>
                    <ArrayInput label="回應按鈕" source="choices">
                      <SimpleFormIterator>
                        <TextInput source="choice" label="選擇" />
                      </SimpleFormIterator>
                    </ArrayInput>
                    <BooleanInput label="允許文字回應" source="allowTextReply" initialValue={false} />
                    <SelectArrayInput label="顯示於" source="destinations" choices={destinations} />
                </div>
                }
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.category === 'SOUND' &&
                <div>
                    <TextInput multiline label="音檔網址" source="url" /><br/>
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
                        <ReferenceInput label="中心點" source="locationId" reference="locations">
                            <AutocompleteInput optionText="name" />
                        </ReferenceInput>
                        <NumberInput label="最小音量" source="minVolume" /> 0-1之間<br/>
                        <NumberInput label="範圍" source="range"  />公尺
                        </div>
                    }
                    </FormDataConsumer>
                </div>
                }
            </FormDataConsumer>
        </FormTab>
        <FormTab label="觸發條件">
            <SelectInput label="觸發條件" source="conditionType" choices={conditionTypes} initialValue={'ALWAYS'} />
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.conditionType === 'GEOFENCE' &&
                <div>
                  <ReferenceInput label="中心點" source="geofenceCenter" reference="locations" >
                    <AutocompleteInput optionText="name" />
                  </ReferenceInput>
                  <NumberInput label="範圍" source="geofenceRadius" />公尺
                </div>
                }
            </FormDataConsumer>
            <FormDataConsumer>
                {({ formData, ...rest }) => formData.conditionType === 'BEACON' &&
                <div>
                    <SelectInput label="模式" source="beaconType" choices={beaconTypes} initialValue={'ENTER'} />&nbsp;
                    <NumberInput label="訊號值" source="beaconThreshold" />
                </div>
                }
            </FormDataConsumer>
        </FormTab>
      </TabbedForm>
  </Edit>
);
