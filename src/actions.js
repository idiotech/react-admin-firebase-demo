import * as React from "react";
import {
  ArrayInput,
  BooleanInput,
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
  ReferenceInput,
  ReferenceArrayInput,
  ChipField,
  FormDataConsumer,
  required,
  FunctionField,
  AutocompleteArrayInput,
  useLoading,
  ArrayField,
  ReferenceField
} from "react-admin";

import { 
    destinations, soundModes, soundTypes, conditionTypes, beaconTypes, 
    callTypes, getConditionIcon, getContentIcon, locationCondition, beaconCondition,
    soundInput, popupInput, popupDismissalInput, incomingCallInput, hangUpInput,
    markerInput, markerRemovalInput, mapStyleInput, validateDestinations
} from './actionCommon'


const ActionFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
    return <span>《{localStorage.getItem('scenarioName')}》動作{record && record.name ? `："${record.name}"` : ''}</span>;
};

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
  <SimpleForm {...props} validate={validateDestinations}>
      <FormDataConsumer>
      {({ formData, ...rest }) => {
        const enableDelay = formData.prevs && !formData.prevs.some(c =>
          c.conditionType == 'GEOFENCE' || c.conditionType == 'BEACON'
        )
        return <>
          {props.showid === "true" ? <TextInput source="id" options={{ disabled: true }}/> : <></> } <br/>
          <TextInput label="名稱" source="name" validate={[required()]}/> <br/>
          <h3>觸發順序</h3><hr/>
          <BooleanInput label="開頭" source="firstAction" /> <br/>
          {formData.firstAction || <ArrayInput label="前一步" source="prevs">
            <SimpleFormIterator>
              <ReferenceInput label="接續" source="prev" reference="actions" sort={{ field: 'lastupdate', order: 'DESC' }} perPage={1000}>
                <SelectInput optionText="name" />
              </ReferenceInput>
              <SelectInput label="觸發條件" source="conditionType" choices={conditionTypes} />
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
                      locationCondition(getSource)
                    }
                    {
                      scopedFormData && scopedFormData.conditionType === 'BEACON' &&
                      beaconCondition(getSource)
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
          <h3>內容</h3><hr/>
          <BooleanInput label="聲音" source="hasSound" />
          {
            formData.hasSound && soundInput(formData, enableDelay)
          }
          <hr/>
          <BooleanInput label="圖文訊息" source="hasPopup" />
          {
            formData.hasPopup && popupInput(enableDelay)
          }
          <hr/>
          <BooleanInput label="關閉圖文框" source="hasPopupDismissal" />
          {
            formData.hasPopupDismissal && popupDismissalInput(enableDelay)
          }
          <hr/>
          <BooleanInput label="來電" source="hasIncomingCall" />
          {
            formData.hasIncomingCall && incomingCallInput(enableDelay)
          }
          <hr/>
          <BooleanInput label="掛電話" source="hasHangUp" />
          {
            formData.hasHangUp && hangUpInput(enableDelay)
          }
          <hr/>
          <BooleanInput label="新圖釘" source="hasMarker" />
          {
            formData.hasMarker && markerInput(enableDelay)
          }
          <hr/>
          <BooleanInput label="移除圖釘" source="hasMarkerRemoval" />
          {
            formData.hasMarkerRemoval && markerRemovalInput(enableDelay)
          }
          <hr/>
          <BooleanInput label="地圖樣式" source="hasMapStyle" />
          {
            formData.hasMapStyle && mapStyleInput(enableDelay)
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