import '../styles/Home.css';
import React, { useState } from 'react'
import undraw from '../undraw.svg'
import 'semantic-ui-css/semantic.min.css'
import { Button, Icon, Modal, Input } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { uuid } from 'uuidv4'

function exampleReducer(state, action) {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { open: true, dimmer: action.dimmer, size: action.size }
    case 'CLOSE_MODAL':
      return { open: false }
    default:
      throw new Error()
  }
}

const Home = () => {

  const [state, dispatch] = React.useReducer(exampleReducer, {
    open: false,
    dimmer: undefined,
    size: undefined
  })
  const { open, dimmer, size } = state
  const [username, setUsername] = useState('')
  const [error, setError] = useState(false)

  const onChange = (e) => {
    setUsername(e.target.value)
    setError(false)
  }

  const handleSubmit = (e) => {
    if (username == ''){
      e.preventDefault()
      setError(true)
    }
  }

  return (
    <div className="container">
      <div className="header">
        <text>Coding Interview</text>
      </div>
      <div className="main">
        <div className="content">
          <div style={{width:"60%",marginBottom:'35px'}}>
            <h1 className='title'>Online Coding Interview</h1>
            <p className="desc">This project will allow you to do online coding interviews and share your code with anyone in real-time using a decent editor.</p>
          </div>
          <div style={{width:"60%",display:'flex',justifyContent:'flex-start'}}>
              <Button icon labelPosition='right' id='btn' size='large' onClick={() => dispatch({ type: 'OPEN_MODAL', dimmer: 'blurring', size: 'mini' })}>
                Get Started
                <Icon name='caret right' color='white'/>
              </Button>
          </div>
        </div>
        <div className="image">
          <img src={undraw} alt="" className='img' />
        </div>
      </div>
      <div className="footer">
      </div>
      <Modal
        dimmer={dimmer}
        open={open}
        size={size}
        onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
      >
        <Modal.Header>Choose A Username!</Modal.Header>
        <Modal.Content style={{display:'flex',justifyContent:'center'}}>
          <Input value={username} focus error={error} placeholder='Type Here...' onChange={onChange}/>
        </Modal.Content>
        <Modal.Actions style={{display:'flex',justifyContent:'center'}}>
          <Link to={{
            pathname:uuid(),
            username,
            }}
          >
            <Button positive onClick={handleSubmit} >
              Create Room
            </Button>
          </Link>
        </Modal.Actions>
      </Modal>
    </div>
  );
}

export default Home;
