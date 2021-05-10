import * as React from "react";
import { ActionList, ActionCreate, ActionShow, ActionEdit } from "./actions";
import { ScenarioList, ScenarioCreate, ScenarioEdit, scenarioReducer } from "./scenarios";
import { NodeList, NodeShow, NodeCreate, NodeEdit } from "./nodes";
import { LocationList, LocationShow, LocationCreate, LocationEdit } from "./locations";
import { Admin, Resource } from "react-admin";
import {
  FirebaseDataProvider,
  FirebaseAuthProvider
} from "react-admin-firebase";
import { useSelector, Provider } from 'react-redux';
import { createStore } from 'redux'

import CommentIcon from '@material-ui/icons/Comment';
import CustomLoginPage from './CustomLoginPage';
import CompositeDataProvider from './compositeDataProvider'
import { createHashHistory } from 'history';
import createAdminStore from './createAdminStore';

import { firebaseConfig as config } from './FIREBASE_CONFIG';

const adminOptions = {
  logging: true,
  rootRef: 'root_collection/admin'
}

const authProvider = FirebaseAuthProvider(config, adminOptions);

const adminProvider = {
  dataProvider: FirebaseDataProvider(config, adminOptions),
  resources: ["scenarios"],
}

function createDataProvider(scenario) {
  const scenarioOtions = {
    logging: true,
    rootRef: 'root_collection/' + scenario
  }
  return {
    dataProvider: FirebaseDataProvider(config, scenarioOtions),
    resources: ["locations", "actions", "nodes"]
  }
}

const dataProvider = new CompositeDataProvider([
  adminProvider, createDataProvider('test')
]);

const customReducers = { currentScenario: scenarioReducer }

const history = createHashHistory();
function Main(props) {
    // const active = useSelector(state => state.currentScenario.valued);
    return (
      <Admin
        loginPage={CustomLoginPage} 
        dataProvider={dataProvider}
        authProvider={authProvider}
        history={history}
        customReducers={customReducers}
      >
        <Resource
          name="scenarios"
          options={{ label: '劇本' }}
          list={ScenarioList}
          create={ScenarioCreate}
          edit={ScenarioEdit}
        />
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

function App() {
  console.log('history = ', history)
  const store = createAdminStore({authProvider, dataProvider, history, customReducers})
  store.subscribe(() => {
    console.log('listener', store.getState())
    const scenario = store.getState().currentScenario.value
    if (scenario) {
      dataProvider.dataProviders = [
        adminProvider, createDataProvider(scenario)
      ]
    }
  })
  return (
    <Provider store={store}>
      <Main/>
    </Provider>
  )
}

export default App;
