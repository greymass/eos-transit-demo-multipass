import React, { Component } from 'react'
import { Header, Segment } from 'semantic-ui-react';
import ReactJson from 'react-json-view';
import { CodeBlock, monokai } from 'react-code-blocks'


class Transaction extends Component {
  render() {
    const { response } = this.props;
    return (
      <React.Fragment>
        <Segment>
          <Header dividing size="large" style={{ borderBottom: '1px solid white' }}>
            Transaction
          </Header>
          <ReactJson
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            iconStyle="square"
            name={null}
            src={response.transaction}
            style={{
              marginTop: '1em',
              overflow: 'scroll',
            }}
          />
        </Segment>
      </React.Fragment>
    );
  }
}

export default Transaction;
