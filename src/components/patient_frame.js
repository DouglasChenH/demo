import Immutable from "immutable";
import moment from 'moment';
import PropTypes from "prop-types";
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams,
  useRouteMatch,
} from "react-router-dom";
// import { Link } from "react-router-dom";
import {
    FORM_NAME_MAP,
    FORM_GROUP_MAP,
    FORM_NAME_TRANSLATOR,
} from './tabs/form_list';
import {
    Patient,
} from './tabs/main';
// import { UpdatingOverlay } from "../generics/updating_overlay";
import { Layout, Menu, Breadcrumb, Icon } from 'antd';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;


function dynamicallyGenerateLinks(id) {
    let routes = [];
    let FormComponent;
    
    Object.keys(FORM_NAME_MAP).map(key => {
        Object.keys(FORM_NAME_MAP[key]).map(subKey => {
            FormComponent = React.createElement(FORM_NAME_MAP[key][subKey].component, {
                id: id,
                path: subKey,
                title: FORM_NAME_MAP[key][subKey].name,
            });

            routes.push(
                <Route path={`/patients/:id/${subKey}`} key={subKey}>
                    {FormComponent}
                </Route>
            )
        });
    });

    return routes;
}

export class PatientFrame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedKeys: ["basic_info"],
            openKeys: ["main"],
            // configs: Immutable.Map(),
            // isLoading: true,
        };
    }

    componentDidMount() {
        this.updateSelectedKey(this.props.history.location.pathname);
    }

    componentWillReceiveProps(nextProps) {
        this.updateSelectedKey(nextProps.history.location.pathname);
    }

    updateSelectedKey = (pathname) => {
        const parts = pathname.split("/");
        const selectedKey = parts.pop();
        this.setState({ selectedKeys: [selectedKey] });
    };

    handleClick = ({ item, key, keyPath, domEvent }) => {
        this.setState({ selectedKeys: keyPath })
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.props.history.push(`/patients/${this.props.id}/${key}`);
    };

    handleOpenChange = (openKeys) => {
        this.setState({ openKeys: openKeys });
    };

    render() {
        return (
            <Layout style={{paddingTop: 64}}>
                <Sider
                    width={300}
                    style={{ background: '#fff' }}
                >
                    <Menu
                        mode="inline"
                        style={{ height: '100%', borderRight: 0 }}
                        openKeys={this.state.openKeys}
                        selectedKeys={this.state.selectedKeys}
                        onClick={this.handleClick}
                        onOpenChange={this.handleOpenChange}
                    >   
                        {Object.keys(FORM_NAME_MAP).map(key => 
                            <SubMenu
                                key={key}
                                title={FORM_GROUP_MAP[key]}
                            >
                                {Object.keys(FORM_NAME_MAP[key]).map(subKey =>
                                    <Menu.Item key={subKey}>  
                                        {FORM_NAME_MAP[key][subKey].name}
                                    </Menu.Item>
                                )}
                            </SubMenu>
                        )}
                    </Menu>
                  </Sider>
                  <Layout style={{ padding: '0 24px 24px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>
                            <Link to="/">
                                病案
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            {FORM_NAME_TRANSLATOR[this.state.selectedKeys[0]]}
                        </Breadcrumb.Item>
                    </Breadcrumb>
                    <Content
                        style={{
                            background: '#fff',
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                        }}
                    >   
                        <Switch>
                            <Route exact path="/patients/:id">
                                <Patient
                                    id={this.props.id}
                                    path="basic_info"
                                    title="基本信息"
                                />
                            </Route>
                            {dynamicallyGenerateLinks(this.props.id)}
                        </Switch>
                    </Content>
                  </Layout>
            </Layout>
        );
    }
}

PatientFrame.propTypes = {
    id: PropTypes.string,
};

PatientFrame.defaultProps = {
    id: 'new',
};

export default PatientFrame;