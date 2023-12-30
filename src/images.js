// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  Datagrid,
  List,
  Create,
  Edit,
  Filter,
  SimpleForm,
  TextField,
  TextInput,
  EditButton,
  DateTimeInput,
  ImageInput,
} from "react-admin";

import { MyImageField } from "./MyImageField";
import { DummyList } from "./dummy";
import { getDeleteButton } from "./deleteResource";

const ImageFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
  return (
    <span>
      《{localStorage.getItem("scenarioName")}》圖片
      {record && record.name ? `："${record.name}"` : ""}
    </span>
  );
};

export const ImageList = (props) => {
  if (localStorage.getItem("scenario")) {
    return (
      <List title={<Title />} {...props} filters={<ImageFilter />}>
        <Datagrid>
          <TextField label="編號" source="rowIndex" />
          <TextField label="名稱" source="name" />
          <MyImageField label="圖片" source="image.src" />
          <EditButton label="" />
          <ImageDelete label="" redirect={false} />
        </Datagrid>
      </List>
    );
  } else return DummyList(props);
};

export const ImageDelete = (props) => {
  const paths = [
    "pictures.pictureId",
    "introBackground",
    "introLogo",
    "mapLogo",
    "portrait",
    "markerIcon",
    "guideImage",
  ];
  return getDeleteButton(props, "images", "圖片", paths.join(","));
};

export const ImageCreate = (props) => (
  <Create title={<Title />} {...props}>
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <ImageInput label="圖片" source="image">
        <MyImageField source="src" title="name" />
      </ImageInput>
      <>(圖釘建議大小： 150 x 150)</>
    </SimpleForm>
  </Create>
);

export const ImageEdit = (props) => (
  <Edit title={<Title />} {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput label="名稱" source="name" />
      <ImageInput label="圖片" source="image">
        <MyImageField source="src" title="name" />
      </ImageInput>
      <>(圖釘建議大小： 150 x 150)</>
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
    </SimpleForm>
  </Edit>
);
