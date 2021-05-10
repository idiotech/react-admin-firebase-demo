// in src/posts.js
import * as React from "react";
// tslint:disable-next-line:no-var-requires
import {
  Datagrid,
  List,
  Show,
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
  DateTimeInput,
  Button
} from "react-admin";
import { createStore } from 'redux'
import { useSelector, useDispatch } from 'react-redux';

export function scenarioReducer(state = { value: '' }, action) {
  switch (action.type) {
    case 'setScenario':
      return { value: action.scenario }
    default:
      return state
  }
}

const store = createStore(scenarioReducer)

store.subscribe(() => console.log('listener', store.getState()))

const ScenarioFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Search" source="name" alwaysOn />
  </Filter>
);

function UseButton(props) {
  const active = useSelector(state => state.currentScenario.value  === props.record.id);
  const dispatch = useDispatch();
  function handleClick() {
    console.log('click', props)
    dispatch({ type: 'setScenario', scenario: props.record.id })
  }
  return (<Button label="設定為目前劇本"
                  onClick={handleClick}
                  disabled={ active }
                  primary="true"
                  />)
  
}

class PublishButton extends React.Component {
  constructor(props){
    super(props);
    this.state = { disabled: false };
  }

  handleClick = () => {
    const { editorAssign, record } = this.props
    // editorAssign(record.id) //call the action
    this.setState({
      disabled: true
    })
  }
  render() {
    // const editorAssignStyle = React.styles.editorAssignStyle;
    return (<Button label="發佈"
                          onClick={this.handleClick}
                          disabled={ this.state.disabled }
                          primary="true"
                          />)
  }
}

const Title = ({ record }) => {
    return <span>劇本：{record && record.name ? `："${record.name}"` : ''}</span>;
};

export const ScenarioList = (props) => (
  <List title={<Title/>} {...props}  filters={<ScenarioFilter />}>
    <Datagrid>
      <TextField label="名稱" source="name" />
      <TextField label="說明" source="description" />
      <UseButton source="id" />
      <PublishButton />
      <EditButton label="" />
      <DeleteButton label="" redirect={false}/>
    </Datagrid>
  </List>
);

export const ScenarioCreate = (props) => (
  <Create title={<Title />} {...props} >
    <SimpleForm>
      <TextInput label="名稱" source="name" />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Create>
);

export const ScenarioEdit = (props) => (
  <Edit title={<Title />}  {...props}>
    <SimpleForm>
      <TextInput disabled source="id" />
      <DateTimeInput label="建立時間" disabled source="createdate" />
      <DateTimeInput label="修改時間" disabled source="lastupdate" />
      <TextInput label="名稱"  source="name" />
      <TextInput label="說明" source="description" />
    </SimpleForm>
  </Edit>
);

