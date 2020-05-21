// React and UI components for demo
import React, { Component } from 'react'
import { Button, Container, Header, Segment } from 'semantic-ui-react'

// The required eos-transit includes
import * as transit from 'eos-transit'
import ScatterProvider from 'eos-transit-scatter-provider'
import AnchorLinkProvider from 'eos-transit-anchorlink-provider'

// React components for this demo, not required
import { find, reject, remove } from 'lodash'
import blockchains from './assets/blockchains.json'
import Accounts from './Accounts.js'
import Blockchains from './Blockchains.js'
import Response from './Response.js'

interface TransitSession {
  chainId: string,
  actor: string,
  permission: string,
  provider: string,
}

class App extends Component {
  // Demo initialization code
  constructor(props) {
    super(props)
    // Add the ability to retrieve the chainId from the URL
    const search = window.location.search
    const params = new URLSearchParams(search)
    const chainId = params.get('chainId') || '0db13ab9b321c37c0ba8481cb4681c2788b622c3abfd1f12f0e5353d44ba6e72'
    // Set initial blank application state
    this.state = {
      chainId,
      response: undefined,
      session: undefined,
      sessions: [],
      transacting: false,
      wallet: undefined,
    }
  }
  // Configure eos-transit when this component mounts
  componentDidMount() {
    this.setupTransit()
  }
  // If the chainId changes in state, reconfigure eos-transit for that chain
  componentDidUpdate(prevProps, prevState) {
    if (this.state.chainId !== prevState.chainId) {
      // reconfigure eos-transit
      this.setupTransit()
    }
  }
  // React State Helper to update chainId while switching blockchains
  setChainId = (e, { value }) => this.setState({
    chainId: value,
    response: undefined,
  }, () => {
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set('chainId', value)
    window.history.pushState(null, null, `?${searchParams.toString()}`)
  })
  // Setup transit for use with a specific blockchain
  setupTransit = async () => {
    // Load the current chainId from state
    const { chainId } = this.state
    // Find the blockchain and retrieve the appropriate API endpoint for the demo
    const blockchain = find(blockchains, { chainId })
    const rpc = blockchain.rpcEndpoints[0]
    const { host, port, protocol } = rpc
    // Initialize eos-transit wallet providers
    const walletProviders = [
      AnchorLinkProvider('eos-transit-demo-multipass', {}),
      ScatterProvider(),
    ]
    // Initialize eos-transit itself
    this.transit = transit.initAccessContext({
      appName: 'eos-transit-demo-multipass',
      network: {
        host,
        port,
        protocol,
        chainId,
      },
      walletProviders,
    })
    // Determine the most recently used session for this chain
    const session: TransitSession = await this.getRecentSession(chainId)
    // If a recent session exists, use it
    if (session) {
      // Use the first session immediately
      this.useSession(session)
    }
    // Get all sessions for this chain
    let sessions: TransitSession[] = await this.getSessions(chainId)
    // Save current chainId and session into application state
    this.setState({
      chainId,
      session,
      sessions,
    })
  }
  // Initialize and return an eos-transit wallet
  getWallet = async (provider: string) => {
    // Find the wallet provider
    const walletProvider = this.getWalletProvider(provider)
    // Initialize the wallet for a new account
    const wallet = this.transit.initWallet(walletProvider)
    // Ensure the wallet is connected
    if (!wallet.connected) {
      await wallet.connect()
    }
    return wallet
  }
  // Get a specific wallet provider by ID
  getWalletProvider = (provider: string) => {
    const walletProviders = this.transit.getWalletProviders();
    return find(walletProviders, { id: provider })
  }
  // Add an additional account for use with a specific provider
  addAccount = async (provider: string) => {
    // Load the current chainId from state
    const { chainId } = this.state
    try {
      // Initialize the wallet for this provider
      const wallet = await this.getWallet(provider)
      // Generic login without actor or permission
      await wallet.login()
      // Establish a new session object
      const session: TransitSession = {
        actor: wallet.auth.accountName,
        chainId,
        permission: wallet.auth.permission,
        provider,
      }
      // Add this session to localStorage
      const sessions = await this.addSession(session)
      // Set this session as the most recently used
      this.setRecentSession(session)
      // Update state with the current session, all available sessions, and the wallet
      this.setState({
        response: undefined,
        session,
        sessions,
        wallet,
      })
    } catch(e) {
      console.log(e)
    }
  }
  // Retrieve the most recently used session for this chain
  getRecentSession = async (chainId: string): TransitSession => {
    let recentSession: TransitSession
    try {
      recentSession = JSON.parse(await localStorage.getItem(`eos-transit-recent-session-${chainId}`))
    } catch(e) {
      // no catch
    }
    return recentSession
  }
  // Set this session as the most recently used for this chain
  setRecentSession = (session: TransitSession) => {
    localStorage.setItem(`eos-transit-recent-session-${session.chainId}`, JSON.stringify(session))
  }
  // Remove this session as the most recently used for this chain
  removeRecentSession = (session: TransitSession) => {
    localStorage.removeItem(`eos-transit-recent-session-${session.chainId}`)
  }
  // Load the sessions for this chain from localStorage
  getSessions = async (chainId: string): TransitSession[] => {
    // Extract the first one for use
    const recentSessions = localStorage.getItem(`eos-transit-sessions-${chainId}`)
    // Return it or an empty array
    return JSON.parse(recentSessions) || []
  }
  // React State Helper to update sessions while switching accounts
  useSession = async (session: TransitSession) => {
    // Restore a specific session based on chainId, actor, and permission
    const { actor, chainId, permission, provider } = session
    // Initialize the wallet for this provider
    const wallet = await this.getWallet(provider)
    // Login using the specific wallet, actor and permission
    await wallet.login(actor, permission)
    // Save this as the most recently used session
    this.setRecentSession(session)
    // Update application state with new session and reset response data
    this.setState({
      chainId,
      response: undefined,
      session,
      wallet,
    })
  }
  addSession = async (session: TransitSession): TransitSession[] => {
    // Load the current chainId from state
    const { chainId } = this.state
    // Load the recent sessions from local storage
    const recentSessionsKey = `eos-transit-sessions-${chainId}`
    const recentSessions = localStorage.getItem(recentSessionsKey)
    // Establish an array of sessions
    let sessions: TransitSession[] = []
    // If recent sessions are found
    if (recentSessions) {
      // parse and set recent sessions
      sessions = JSON.parse(recentSessions)
      // remove the added entry if it exists (to ensure unique)
      remove(sessions, session)
      // add session as first element (the most recent)
      sessions.unshift(session)
    } else {
      sessions = [session]
    }
    // store new sessions
    localStorage.setItem(recentSessionsKey, JSON.stringify(sessions))
    // return sessions
    return sessions
  }
  setSessions = async (sessions: TransitSession[]) => {
    // Load the current chainId from state
    const { chainId } = this.state
    // Set the sessions within local storage
    const sessionsKey = `eos-transit-sessions-${chainId}`
    localStorage.setItem(sessionsKey, JSON.stringify(sessions))
  }
  // React State Helper to remove/delete a session
  removeSession = async (auth: TransitSession) => {
    // Retreive current session
    let { session } = this.state
    // Find all remaining sessions
    const sessions = reject(this.state.sessions, auth)
    // Set our local storage sessions without the removed session
    this.setSessions(sessions)
    // Determine if this is the current session
    const isCurrentSession = (session.actor === auth.actor && session.permission === auth.permission)
    if (isCurrentSession) {
      // perform eos-transit logout on the wallet in state
      await this.state.wallet.provider.logout(auth.actor, auth.permission)
      // If more exist, use the next one
      if (sessions.length > 0) {
        [ session ] = sessions
        this.useSession(session)
      } else {
        // Remove the current session for local state
        session = undefined
        // Otherwise ensure its removed from the recent list
        this.removeRecentSession(auth)
      }
      this.setState({
        wallet: undefined,
      })
    } else {
      // If not the current session, setup the specific wallet for a logout call (to hook into their session handlers)
      const wallet = await this.getWallet(auth.provider)
      // Call logout for this provider to allow the secondary parameter
      await wallet.provider.logout(auth.actor, auth.permission)
    }
    // update local state
    this.setState({
      session,
      sessions,
    })
  }
  // Sign (but not broadcast) a test transaction
  signTransaction = async () => {
    // Retrieve current session from state
    const { session, wallet } = this.state
    this.setState({
      // Reset our response state to clear any previous transaction data
      response: undefined,
      // Set loading flag
      transacting: true,
    })
    try {
      // Retrieve current user information from transit
      const { actor, permission } = session
      // Call transact on the session (compatible with eosjs.transact)
      const response = await wallet.eosApi.transact({
        actions: [
          {
            account: 'eosio',
            name: 'voteproducer',
            authorization: [{ actor, permission }],
            data: {
              producers: [],
              proxy: 'greymassvote',
              voter: actor
            }
          }
        ],
      }, {
        // Optional: Prevent anchor-link from broadcasting this transaction (default: True)
        //
        //    The wallet/signer connected to this app will NOT broadcast the transaction
        //    as is defined by the anchor-link protocol. Broadcasting is the responsibility
        //    of anchor-link running inside an application (like this demo).
        //
        //    For this demo specifically we do NOT want the transaction to ever be broadcast
        //    to the blockchain, so we're disabling it here.
        //
        //    For all normal applications using anchor-link, you can omit this.
        broadcast: false,
        // TAPOS values
        blocksBehind: 3,
        expireSeconds: 120,
      })
      // Update application state with the results of the transaction
      this.setState({
        response,
        transacting: false
      });
    } catch(e) {
      console.log(e)
      this.setState({
        transacting: false
      })
    }
  }
  render() {
    // Load state for rendering
    const {
      chainId,
      session,
      sessions,
      response,
      transacting,
    } = this.state
    // Find the blockchain information (rpc, name, etc) for UI purposes
    const chain = find(blockchains, { chainId })
    // Return the UI
    return (
      <Container
        style={{ paddingTop: '2em' }}
      >
        <Header attached="top" block size="huge">
          eos-transit-demo-multipass
          <Header.Subheader>
            <p>An eos-transit demo that allows multiple persistent logins from different blockchains, accounts, and wallets.</p>
            <p>Source code: <a href="https://github.com/greymass/eos-transit-demo-multipass">https://github.com/greymass/eos-transit-demo-multipass</a></p>
          </Header.Subheader>
        </Header>
        <Segment attached padded>
          <p>Switch to a specific blockchain.</p>
          <Blockchains
            chain={chain}
            onChange={this.setChainId}
          />
        </Segment>
        <Segment attached padded>
          <Header>Available Accounts</Header>
          <Accounts
            addAccount={this.addAccount}
            chain={chain}
            session={session}
            sessions={sessions}
            removeSession={this.removeSession}
            useSession={this.useSession}
          />
        </Segment>
        <Segment attached padded>
          <Header>Transact with eos-transit</Header>
          <Button
            content="Sign Test Transaction"
            disabled={!session || transacting}
            icon="external"
            loading={transacting}
            onClick={this.signTransaction}
            primary
            size="huge"
          />
          {(!session)
            ? <p style={{ marginTop: '0.5em'}}>Login using your preferred wallet to sign a test transaction.</p>
            : false
          }
        </Segment>
        <Segment attached="bottom" padded>
          {(response)
            ? (
              <Response
                response={response}
              />
            )
            : false
          }
        </Segment>
      </Container>
    )
  }
}

export default App
