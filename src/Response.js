import React, { Component } from 'react'
import { List, Segment } from 'semantic-ui-react';
import { Serialize } from 'eosjs'

const transactionAbi = require('eosjs/src/transaction.abi.json')
const transactionTypes: Map<string, Serialize.Type> = Serialize.getTypesFromAbi(Serialize.createInitialTypes(), transactionAbi)

class Transaction extends Component {
  testResponse = () => {
    const { response } = this.props
    const tests = [
      {
        name: "Returns Signature",
        desc: "The wallet has returned a signature in the response.",
        test: (r) => !!(r.signatures && r.signatures.length >= 1),
        data: (r) => JSON.stringify(r.signatures),
      },
      {
        name: "Returns Serialized Transaction",
        desc: "The wallet has returned the serialized transaction appropriately.",
        test: (r) => !!(r.serializedTransaction),
        data: (r) => JSON.stringify(r.serializedTransaction),
      },
      {
        name: "Transaction can be deserialized",
        desc: "The serialized transaction that the wallet returned successfully deserialized.",
        test: (r) => {
          try {
            const tx = this.deserialize(r.serializedTransaction)
            return (
              tx.expiration
              && tx.actions
              && tx.actions.length > 0
              && tx.ref_block_num > 0
              && tx.ref_block_prefix > 0
            )
          } catch (e) {
            return false
          }
        },
        data: (r) => {
          try {
            const tx = this.deserialize(r.serializedTransaction)
            return JSON.stringify(tx)
          } catch (e) {
            return JSON.stringify({})
          }
        }
      },
    ]
    return tests.map((testCase) => {
      return {
        ...testCase,
        res: testCase.test(response),
        val: testCase.data(response),
      }
    })
  }
  deserialize = (serialized) => {
    const buffer = new Serialize.SerialBuffer({
      array: serialized,
    })
    const type = transactionTypes.get('transaction')
    return type.deserialize(buffer)
  }
  render() {
    const tests = this.testResponse()
    return (
      <React.Fragment>
        <Segment style={{ overflowX: 'scroll' }}>
          <List divided relaxed>
            {tests.map(test => (
              <List.Item>
                <List.Icon
                  color={test.res ? "green" : "red"}
                  name={test.res ? "checkmark" : "x"}
                  size="large"
                  verticalAlign="top"
                />
                <List.Content>
                  <List.Header>{test.name}</List.Header>
                  <List.Description>{test.desc}</List.Description>
                  <List.Content style={{ margin: '0.5em 0' }}><code>{test.val}</code></List.Content>
                </List.Content>
              </List.Item>
            ))}
          </List>
        </Segment>

      </React.Fragment>
    );
  }
}

export default Transaction;
