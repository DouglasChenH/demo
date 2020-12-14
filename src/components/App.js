import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch,
  useHistory,
} from "react-router-dom";
import { PatientTable } from './patient_table';
import { PatientFrame } from './patient_frame';
import {
    Table,
    ConfigProvider,
    Layout,
    Menu,
    Breadcrumb,
    Icon
} from 'antd';
import { db } from '../db/database';
import img_logo_placeholder from '../imgs/logo-placeholder.jpg';
import zhCN from 'antd/es/locale/zh_CN';
import '../styles/main.scss';
const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;


export class App extends React.Component {
    render() {
        return (
            <ConfigProvider
                locale={zhCN}
                // getPopupContainer={node => {
                //     if (node) {
                //       return node.parentNode;
                //     }
                //     return document.body;
                // }}
            >
                 <Router>
                      <Layout>
                          <Header className="header" style={{ position: 'fixed', zIndex: 999, width: '100%' }}>
                              <div className="logo" >
                                
                              </div>
                          </Header>

                          <Switch>
                              <Route
                                  path="/patients/:id"
                                  render={() => <Frame db={db} />} />
                              <Route
                                  path="/"
                                  render={() => <PatientTableWrapper db={db} />}
                              />
                          </Switch>
                      </Layout>
                  </Router>
            </ConfigProvider>
        );
    }
}

function Frame({db}) {
  let { id } = useParams();
  let history = useHistory();

  return (
      <PatientFrame id={id} history={history} db={db} />
  );
}

function PatientTableWrapper({db}) {
  let history = useHistory();

  return (
      <PatientTable history={history} db={db} />
  )
}

function Home() {
  return <h2>Home</h2>;
}


export default App;
