// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  CardActions,
  Datagrid,
  List,
  TextField,
} from "react-admin";


const Title = () => {
  return (
    <span>
      請先設定目前劇本
    </span>
  );
};

export const NoneActions = () => (
  <CardActions />
);

const EmptyPage = () => 
  <div>
    <h1>請先設定目前劇本 ;-)</h1>
    <img width={540} height={960} src="http://daqiaotou-storage.floraland.tw/images/nothing.jpg"/>
  </div>

export const DummyList = (props) => (
  <List title={<Title />} empty={<EmptyPage/>} {...props} actions={<NoneActions />}>
    <Datagrid>
      <TextField label="請先設定目前劇本" source="name" />
    </Datagrid>
  </List>
);