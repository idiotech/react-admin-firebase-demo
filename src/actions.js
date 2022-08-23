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
  CreateButton,
  SelectInput,
  ReferenceInput,
  ReferenceArrayInput,
  ChipField,
  FormDataConsumer,
  required,
  FunctionField,
  AutocompleteArrayInput,
  ArrayField,
  ReferenceField,
  Toolbar,
  SaveButton,
  useRecordContext,
  DeleteWithConfirmButton,
  NumberInput,
} from "react-admin";

import {
  conditionTypes,
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
  introImageInput,
  buttonStyleInput,
  variableUpdateInput,
  modalImage,
  validateBeforeSubmit,
  comparisonTypes,
  endgameInput,
  guideImageInput,
  guideImageRemovalInput,
  silenceInput,
} from "./actionCommon";

import { getRecordField } from "./utils";
import { DummyList } from "./dummy";

const ActionFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
  return (
    <span>
      《{localStorage.getItem("scenarioName")}》動作
      {record && record.name ? `："${record.name}"` : ""}
    </span>
  );
};
const getRowIndex = (record) => {
  const key = `a-${record.id}`;
  if (record.rowIndex) {
    localStorage.setItem(key, record.rowIndex);
    return <div>{record.rowIndex}</div>;
  } else {
    return <div>{localStorage.getItem(key)}</div>;
  }
};

export const ActionList = (props) => {
  if (localStorage.getItem("scenario"))
    return (
      <List
        title={<Title />}
        {...props}
        perPage={100}
        filters={<ActionFilter />}
      >
        <Datagrid>
          <FunctionField label="編號" render={getRowIndex} />
          <TextField label="名稱" source="name" />
          <FunctionField label="條件" render={getConditionIcon} />
          <FunctionField label="內容" render={getContentIcon} />
          <EditButton label="編輯" />
          <ArrayField label="上一步" source="prevs">
            <Datagrid>
              <ReferenceField label="" source="prev" reference="actions">
                <ChipField source="name" />
              </ReferenceField>
            </Datagrid>
          </ArrayField>
          <NextButton source="id" label="下一步" />
          <DeleteButton />
        </Datagrid>
      </List>
    );
  else return DummyList(props);
};

const DeleteButton = (props) => {
  const record = useRecordContext();
  return (
    <DeleteWithConfirmButton
      {...props}
      label="刪除"
      confirmContent="將刪除此動作，確定嗎？"
      confirmTitle={`確認刪除《${record.name}》`}
      translateOptions={{ name: record.name }}
    />
  );
};

const ActionSaveButton = (props) => {
  if (props.record && props.record.id) {
    const redirect = `/actions/create/?source={"prevs": [{"prev" : "${props.record.id}", "conditionType": "ALWAYS" }]}`;
    return <SaveButton {...props} redirect={redirect} />;
  } else {
    return <SaveButton {...props} />;
  }
};

const EditToolbar = (props) => {
  return (
    <Toolbar {...props}>
      <span>
        <SaveButton label="儲存" {...props} /> &nbsp;
        {props.record && props.record.id && (
          <ActionSaveButton label="儲存並建下一步" {...props} />
        )}
      </span>
    </Toolbar>
  );
};

const InputForm = (props) => {
  return (
    <SimpleForm
      {...props}
      validate={validateBeforeSubmit}
      toolbar={<EditToolbar />}
    >
      <FormDataConsumer>
        {({ formData }) => {
          const enableDelay =
            formData.prevs &&
            !formData.prevs.some(
              (c) =>
                !c ||
                c.conditionType == "GEOFENCE" ||
                c.conditionType == "BEACON"
            );
          return (
            <>
              {props.showid === "true" ? (
                <TextInput source="id" options={{ disabled: true }} />
              ) : (
                <></>
              )}{" "}
              <br />
              <TextInput
                label="名稱"
                source="name"
                validate={[required()]}
              />{" "}
              <br />
              <h3>觸發順序</h3>
              <hr />
              <BooleanInput label="開頭" source="firstAction" /> <br />
              {formData.firstAction || (
                <ArrayInput label="前一步" source="prevs">
                  <SimpleFormIterator>
                    <ReferenceInput
                      label="接續"
                      source="prev"
                      reference="actions"
                      sort={{ field: "lastupdate", order: "DESC" }}
                      perPage={1000}
                    >
                      <SelectInput optionText="name" />
                    </ReferenceInput>
                    <SelectInput
                      label="觸發條件"
                      source="conditionType"
                      choices={conditionTypes}
                    />
                    <FormDataConsumer>
                      {({
                        scopedFormData, // The data for this item of the ArrayInput
                        getSource, // A function to get the valid source inside an ArrayInput
                      }) => (
                        <>
                          {scopedFormData &&
                            scopedFormData.conditionType === "GEOFENCE" &&
                            locationCondition(getSource)}
                          {scopedFormData &&
                            scopedFormData.conditionType === "BEACON" &&
                            beaconCondition(getSource)}
                          {scopedFormData &&
                            scopedFormData.conditionType === "TEXT" && (
                              <>
                                {!scopedFormData.fallback && (
                                  <TextInput
                                    multiline
                                    label="文字"
                                    source={getSource("userReply")}
                                    validate={[required()]}
                                  />
                                )}
                                {
                                  <BooleanInput
                                    label="任意文字"
                                    source={getSource("fallback")}
                                    defaultValue={
                                      scopedFormData.userReply === "fallback:"
                                    }
                                  />
                                }
                              </>
                            )}
                        </>
                      )}
                    </FormDataConsumer>
                  </SimpleFormIterator>
                </ArrayInput>
              )}
              {!formData.firstAction && (
                <BooleanInput label="進階流程控制" source="advancedFlow" />
              )}
              {!formData.firstAction && formData.advancedFlow && (
                <>
                  <ReferenceArrayInput
                    label="互斥於"
                    source="exclusiveWith"
                    reference="actions"
                    sort={{ field: "lastupdate", order: "DESC" }}
                    perPage={1000}
                  >
                    <AutocompleteArrayInput optionText="name" />
                  </ReferenceArrayInput>
                  <ArrayInput label="附加條件" source="preconditions">
                    <SimpleFormIterator>
                      <ReferenceInput
                        label="變數"
                        source="variable"
                        reference="variables"
                        sort={{ field: "lastupdate", order: "DESC" }}
                        perPage={1000}
                      >
                        <SelectInput optionText="name" />
                      </ReferenceInput>
                      <SelectInput
                        label="比較"
                        source="comparison"
                        choices={comparisonTypes}
                      />
                      <NumberInput label="數值" source="value" />
                    </SimpleFormIterator>
                  </ArrayInput>
                </>
              )}
              <h3>常用內容</h3>
              <hr />
              {modalImage}
              <BooleanInput label="聲音" source="hasSound" />
              {formData.hasSound && soundInput(formData, enableDelay)}
              <hr />
              <BooleanInput label="圖文訊息" source="hasPopup" />
              {formData.hasPopup && popupInput(formData, enableDelay)}
              <hr />
              <BooleanInput label="關閉圖文框" source="hasPopupDismissal" />
              {formData.hasPopupDismissal && popupDismissalInput(enableDelay)}
              <hr />
              <BooleanInput label="新圖釘" source="hasMarker" />
              {formData.hasMarker && markerInput(enableDelay)}
              <hr />
              <BooleanInput label="移除圖釘" source="hasMarkerRemoval" />
              {formData.hasMarkerRemoval && markerRemovalInput(enableDelay)}
              <hr />
              {endgameInput(enableDelay)}
              <hr />
              <h3>進階內容</h3>
              <BooleanInput label="開啟進階內容" source="advancedActionType" />
              <hr />
              {formData.advancedActionType && (
                <>
                  <BooleanInput label="停止聲音" source="hasSilence" />
                  {formData.hasSilence && silenceInput(enableDelay)}
                  <hr />
                  <BooleanInput label="指示圖" source="hasGuideImage" />
                  {formData.hasGuideImage && guideImageInput(enableDelay)}
                  <hr />
                  <BooleanInput
                    label="移除指示圖"
                    source="hasGuideImageRemoval"
                  />
                  {formData.hasGuideImageRemoval &&
                    guideImageRemovalInput(enableDelay)}
                  <hr />
                  <BooleanInput label="來電" source="hasIncomingCall" />
                  {formData.hasIncomingCall && incomingCallInput(enableDelay)}
                  <hr />
                  <BooleanInput label="掛電話" source="hasHangUp" />
                  {formData.hasHangUp && hangUpInput(enableDelay)}
                  <hr />
                  <BooleanInput label="地圖樣式" source="hasMapStyle" />
                  {formData.hasMapStyle && mapStyleInput(enableDelay, formData)}
                  <hr />
                  <BooleanInput label="首頁背景" source="hasIntroImage" />
                  {formData.hasIntroImage &&
                    introImageInput(formData, enableDelay)}
                  <hr />
                  <BooleanInput label="按鈕顏色" source="hasButtonStyle" />
                  {formData.hasButtonStyle && buttonStyleInput(enableDelay)}
                  <hr />
                  <BooleanInput label="更新變數" source="hasVariableUpdate" />
                  {formData.hasVariableUpdate && variableUpdateInput()}
                </>
              )}
            </>
          );
        }}
      </FormDataConsumer>
    </SimpleForm>
  );
};

export const ActionCreate = (props) => {
  return (
    <Create title={<Title />} mutationMode="pessimistic" {...props}>
      <InputForm {...props} showid="false" />
    </Create>
  );
};

export const ActionEdit = (props) => {
  return (
    <Edit title={<Title />} {...props}>
      <InputForm {...props} showid="true" />
    </Edit>
  );
};

function NextButton(props) {
  return (
    <CreateButton
      label="下一步"
      to={{
        pathname: "/actions/create",
        state: {
          record: {
            prevs: [
              { prev: getRecordField(props, "id"), conditionType: "ALWAYS" },
            ],
          },
        },
      }}
    />
  );
}
