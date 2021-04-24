import * as React from "react";
import { ActionList, ActionCreate, ActionShow, ActionEdit } from "./actions";
import { NodeList, NodeShow, NodeCreate, NodeEdit } from "./nodes";
import { LocationList, LocationShow, LocationCreate, LocationEdit } from "./locations";
import { Admin, Resource } from "react-admin";
import {
  FirebaseDataProvider,
  FirebaseAuthProvider
} from "react-admin-firebase";
import CommentIcon from '@material-ui/icons/Comment';
import CustomLoginPage from './CustomLoginPage';

import { firebaseConfig as config } from './FIREBASE_CONFIG';

const options = {
  logging: true,
  rootRef: 'root_collection/some_document'
}
const dataProvider = FirebaseDataProvider(config, options);
const authProvider = FirebaseAuthProvider(config, options);

class App extends React.Component {
  render() {
    return (
      <Admin
        loginPage={CustomLoginPage} 
        dataProvider={dataProvider}
        authProvider={authProvider}
      >
        <Resource
          name="locations"
          options={{ label: '地點' }}
          list={LocationList}
          create={LocationCreate}
          edit={LocationEdit}
        />
        <Resource
          name="actions"
          options={{ label: '動作' }}
          list={ActionList}
          create={ActionCreate}
          edit={ActionEdit}
        />
        <Resource
          name="nodes"
          options={{ label: '小節' }}
          list={NodeList}
          create={NodeCreate}
          edit={NodeEdit}
        />
      </Admin>
    );
  }
}

export default App;
