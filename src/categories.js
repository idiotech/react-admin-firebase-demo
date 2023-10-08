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
  DeleteButton,
  CreateButton,
  ExportButton,
  NumberField,
  NumberInput,
  DateTimeInput,
  BooleanField,
  BooleanInput,
  TopToolbar,
  Button,
  Confirm,
  fetchStart,
  fetchEnd,
  useGetList,
  useNotify,
  SelectInput,
} from "react-admin";

import { useState } from "react";
import { useDispatch } from "react-redux";

const displayTypes = [
  { id: "CAROUSEL", name: "左右滑動" },
  { id: "TWO_IN_A_ROW", name: "兩個一列" },
  { id: "ONE_IN_A_ROW", name: "一個一列" },
  { id: "LIST", name: "列表" },
];

const CategoryFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

const Title = ({ record }) => {
  return (
    <span>
      分類
      {record && record.name ? `："${record.name}"` : ""}
    </span>
  );
};

function CatPublishButton() {
  const notify = useNotify();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const handleClick = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);
  const categoryResult = useGetList(
    "categories",
    { page: 1, perPage: 500 },
    { field: "order", order: "ASC" }
  );
  const categories = categoryResult.data;
  const [open, setOpen] = useState(false);

  function handleConfirm() {
    setOpen(false);
    setLoading(true);
    dispatch(fetchStart());
    try {
      console.log("cats", categories);
      const urlString = "https://ghostspeak.floraland.tw/agent/v1/category";
      const url = new URL(urlString);
      const metadata = { categories: Object.values(categories) };
      fetch(url, {
        method: "PUT",
        body: JSON.stringify(metadata),
        headers: {
          "content-type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            notify("成功發佈分類", "success");
          } else {
            notify(
              "發佈失敗；原因 =" + response.body + " " + response.status,
              "error"
            );
          }
        })
        .catch((e) => {
          notify("發佈失敗；原因 =" + e, "error");
        })
        .finally(() => {
          setLoading(false);
          setOpen(false);
          dispatch(fetchEnd());
        });
    } catch (e) {
      notify(e, "error");
      setLoading(false);
      setOpen(false);
      dispatch(fetchEnd());
    }
  }

  return (
    <>
      <Button
        label="發佈"
        onClick={handleClick}
        disabled={loading}
        primary="true"
      />
      <Confirm
        isOpen={open}
        title="確認發佈"
        content={`你即將發佈分類；使用者的進度將被中斷。確定嗎？`}
        onConfirm={handleConfirm}
        onClose={handleDialogClose}
        confirm="確認發佈"
        cancel="取消"
      />
    </>
  );
}

const ListActions = (props) => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
    <CatPublishButton {...props} />
  </TopToolbar>
);

// TODO: sort by order
export const CategoryList = (props) => {
  return (
    <List
      title={<Title />}
      actions={<ListActions />}
      filters={<CategoryFilter />}
      sort={{ field: "order", order: "ASC" }}
      {...props}
    >
      <Datagrid>
        <NumberField label="順序" source="order" />
        <TextField label="名稱" source="name" />
        <TextField label="說明" source="description" />
        <BooleanField label="隱藏" source="hidden" />
        <EditButton label="" />
        <DeleteButton label="" redirect={false} />
      </Datagrid>
    </List>
  );
};

export const CategoryCreate = (props) => (
  <Create title={<Title />} {...props}>
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <TextInput label="簡介" source="description" />
      <SelectInput
        label="顯示方式"
        source="displayType"
        choices={displayTypes}
        initialValue="ONE_IN_A_ROW"
      />
      <NumberInput label="顯示個數" source="displayCount" initialValue={3} />
      <NumberInput label="順序" source="order" initialValue={1} />
      <BooleanInput label="隱藏" source="hidden" initialValue={false} />
    </SimpleForm>
  </Create>
);

export const CategoryEdit = (props) => (
  <Edit title={<Title />} {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <TextInput label="名稱" source="name" />
      <TextInput label="簡介" source="description" />
      <SelectInput
        label="顯示方式"
        source="displayType"
        choices={displayTypes}
        initialValue="ONE_IN_A_ROW"
      />
      <NumberInput label="顯示個數" source="displayCount" initialValue={3} />
      <NumberInput label="順序" source="order" />
      <BooleanInput label="隱藏" source="hidden" />
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
    </SimpleForm>
  </Edit>
);
