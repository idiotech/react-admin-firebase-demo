import * as React from "react";
import { ActionList, ActionCreate, ActionShow, ActionEdit } from "./actions";
import { ScenarioList, ScenarioCreate, ScenarioEdit, scenarioReducer } from "./scenarios";
import { NodeList, NodeShow, NodeCreate, NodeEdit } from "./nodes";
import { LocationList, LocationCreate, LocationEdit } from "./locations";
import { BeaconList, BeaconCreate, BeaconEdit } from "./beacons";
import { ImageList, ImageCreate, ImageEdit} from "./images";
import { SoundList, SoundCreate, SoundEdit} from "./sounds";
import { Admin, Resource } from "react-admin";
import {
  FirebaseDataProvider,
  FirebaseAuthProvider
} from "react-admin-firebase";
import { useSelector, Provider } from 'react-redux';
import { createStore } from 'redux';

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
  const baseProvider = FirebaseDataProvider(config, scenarioOtions)
  return {
    dataProvider: {
      ...baseProvider,
      getList: (resource, params) => {
        if (resource !== 'nodes') return baseProvider.getList(resource, params);
        else {
          console.log('getting nodes with params', params)
          const newParams = JSON.parse(JSON.stringify(params))
          newParams.pagination.page = 1
          newParams.pagination.perPage = 10000
          return baseProvider.getList(resource, newParams).then(list =>
            {
              console.log('list', list)
              const nodes = list.data
              const initial = list.data.find(n => n.initial)
              const nodeMap = new Map(list.data.map(n => [n.id, n]))
              console.log('node map', nodeMap)
              function createTree(root) {
                const children = root.children || []
                const childNodes = children.map(c => nodeMap.get(c))
                console.log('children', children)
                console.log('childNodes', childNodes)
                return {
                  node: root,
                  children: children.map(c => nodeMap.get(c)).filter(c => c).map(c => createTree(c))
                }
              }
              function getMembers(tree) {
                return tree.children.reduce((agg, c) => [...agg, ...getMembers(c)], [tree.node])
              }
              if (initial) {
                const tree = createTree(initial)
                console.log('tree', tree)
                const members = getMembers(tree)
                const memberIds = new Set(members.map(m => m.id))
                const page = params.pagination.page - 1
                const perPage = params.pagination.perPage
                console.log('members', getMembers(tree))
                return {
                  data: [...members, ...list.data.filter(n => !memberIds.has(n.id))].slice(page * perPage, (page + 1) * perPage),
                  total: list.data.length
                }
              } else return list
            }
          );
        }
      }
    },
    resources: ["locations", "actions", "nodes", "beacons", "images", "sounds"],
    name: scenario
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
          name="images"
          options={{ label: '圖片' }}
          list={ImageList}
          create={ImageCreate}
          edit={ImageEdit}
        />
        <Resource
          name="sounds"
          options={{ label: '聲音' }}
          list={SoundList}
          create={SoundCreate}
          edit={SoundEdit}
        />
        <Resource
          name="beacons"
          options={{ label: 'Beacon' }}
          list={BeaconList}
          create={BeaconCreate}
          edit={BeaconEdit}
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
  const store = createAdminStore({authProvider, dataProvider, history, customReducers})
  store.subscribe(() => {
    console.log('listener', store.getState())
    const scenario = store.getState().currentScenario.value
    if (scenario) {
      console.log('setting data provider', store.getState())
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
