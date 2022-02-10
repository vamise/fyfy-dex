import { Col, Row, Menu } from 'antd';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import logo from '../assets/logo.svg';
import styled from 'styled-components';
import { ENDPOINTS, useConnectionConfig } from '../utils/connection';
import CustomClusterEndpointDialog from './CustomClusterEndpointDialog';
import { EndpointInfo } from '../utils/types';
import { notify } from '../utils/notifications';
import { Connection } from '@solana/web3.js';
import WalletConnect from './WalletConnect';
import { getTradePageUrl } from '../utils/markets';

const Wrapper = styled.div`
  // flex-direction: row;
  // justify-content: flex-end;
  // flex-wrap: wrap;
`;
const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  color: #006fe6;
  font-weight: bold;
  cursor: pointer;
  img {
    height: 30px;
    margin-right: 8px;
  }
`;

const MENU = [
   {
    'title': 'Trading',
    'link': '/',
  },
  {
    'title': 'Swap',
    'link': 'https://fyfy.app/swap/',
  },
  {
    'title': 'Liquidity',
    'link': 'https://fyfy.app/liquidity/',
  },
  {
    'title': 'Pools',
    'link': 'https://fyfy.app/pools/',
  },
  {
    'title': 'Farms',
    'link': 'https://fyfy.app/farms/',
  },
  {
    'title': 'Staking',
    'link': 'https://fyfy.app/staking/',
  },
  {
    'title': 'AcceleRaytor',
    'link': 'https://fyfy.app/acceleRaytor/',
  },
  {
    'title': 'DropZone',
    'link': 'https://dropzone.fyfy.app/',
  },
  {
    'title': 'NFTs',
    'child': [
      {
        'title': 'Browse NFTs',
        'link': 'https://nft.fyfy.app/marketplace'
      },
      {
        'title': 'Explore Collections',
        'link': 'https://nft.fyfy.app/collections'
      },
    ]
  },
  {
    'title': 'Migrate',
    'link': 'https://fyfy.app/migrate/',
  },
  
]

export default function TopBar() {
  const {
    endpointInfo,
    setEndpoint,
    availableEndpoints,
    setCustomEndpoints,
  } = useConnectionConfig();
  const [addEndpointVisible, setAddEndpointVisible] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const location = useLocation();
  const history = useHistory();

  const onAddCustomEndpoint = (info: EndpointInfo) => {
    const existingEndpoint = availableEndpoints.some(
      (e) => e.endpoint === info.endpoint,
    );
    if (existingEndpoint) {
      notify({
        message: `An endpoint with the given url already exists`,
        type: 'error',
      });
      return;
    }

    const handleError = (e) => {
      console.log(`Connection to ${info.endpoint} failed: ${e}`);
      notify({
        message: `Failed to connect to ${info.endpoint}`,
        type: 'error',
      });
    };

    try {
      const connection = new Connection(info.endpoint, 'recent');
      connection
        .getEpochInfo()
        .then((result) => {
          setTestingConnection(true);
          console.log(`testing connection to ${info.endpoint}`);
          const newCustomEndpoints = [
            ...availableEndpoints.filter((e) => e.custom),
            info,
          ];
          setEndpoint(info.endpoint);
          setCustomEndpoints(newCustomEndpoints);
        })
        .catch(handleError);
    } catch (e) {
      handleError(e);
    } finally {
      setTestingConnection(false);
    }
  };

  const endpointInfoCustom = endpointInfo && endpointInfo.custom;
  useEffect(() => {
    const handler = () => {
      if (endpointInfoCustom) {
        setEndpoint(ENDPOINTS[0].endpoint);
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [endpointInfoCustom, setEndpoint]);

  const tradePageUrl = location.pathname.startsWith('/market/')
    ? location.pathname
    : getTradePageUrl();
  
    const { SubMenu } = Menu;

  const menuDiv = 
  <Menu mode="horizontal" defaultSelectedKeys={['Trading']} style={{fontSize: '16px', display: 'flex', justifyContent: 'center',background: '#0F1429'}} selectable={false} >
    {MENU.map(item => {
      if (item.child === undefined) {
        return <Menu.Item key={item.title}><a href={item.link} target={item.link.startsWith('/') ? '_self' : '_blank'} rel="noopener noreferrer">{item.title}</a></Menu.Item>
      } else {
        return <SubMenu key={item.title} title={item.title}>
          {item.child.map(itemChild => <Menu.Item key={itemChild.title}><a href={itemChild.link} target={itemChild.link.startsWith('/') ? '_self' : '_blank'} rel="noopener noreferrer">{itemChild.title}</a></Menu.Item>)}
        </SubMenu>
      }
    }
    )}
    </Menu>

  return (
    <>
      <CustomClusterEndpointDialog
        visible={addEndpointVisible}
        testingConnection={testingConnection}
        onAddCustomEndpoint={onAddCustomEndpoint}
        onClose={() => setAddEndpointVisible(false)}
      />
      <Wrapper style={{ background: '#0F1429'}}>
        <Row wrap={false} style={{ paddingTop: 25, height: 70 }}>
          <Col flex="none">
            <LogoWrapper onClick={() => history.push(tradePageUrl)} style={{ paddingLeft: 40}}>
              <img src={logo} alt="" style={{ width: 145, height: 40 }} />
            </LogoWrapper>
          </Col>
          <Col flex="auto" style={{ textAlign: 'center'}}>
            {menuDiv}
          </Col>
          <Col flex="none" style={{ paddingRight: 20}}>
            <WalletConnect />
          </Col>
        </Row>
      </Wrapper>
    </>
  );
}
