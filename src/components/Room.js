import React, { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import '../styles/Room.css'
import { Button ,Label, Dropdown, Modal, Input, TextArea } from 'semantic-ui-react'
import {Controlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/darcula.css';
import { io } from "socket.io-client";
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/clike/clike');
require('codemirror/mode/python/python');
require('codemirror/mode/php/php')

let socket;
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


// function useWindowSize() {
//     const [windowSize, setWindowSize] = useState({
//       width: undefined,
//       height: undefined,
//     });
//     useEffect(() => {
//       function handleResize() {
//         setWindowSize({
//           width: window.innerWidth,
//           height: window.innerHeight,
//         });
//       }
//       window.addEventListener("resize", handleResize);
//       handleResize();
//       return () => window.removeEventListener("resize", handleResize);
//     }, []);
//     return windowSize;
// }

const Room = (props) => {
    // const windowSize = useWindowSize()
    // console.log(windowSize)
    const [chat, setChat] = useState([])
    const [input, setInput] = useState('')
    const [username, setUsername] = useState(useLocation().username)
    const [loadingUsername, setLoadingUsername] = useState('')
    const [room, setRoom] = useState(useLocation().pathname)
    const [users, setUsers] = useState([])
    const [code, setCode] = useState('')
    const [language, setLanguage] = useState('javascript')
    const [state, dispatch] = React.useReducer(exampleReducer, {
        open: true,
        dimmer: undefined,
        size: undefined
    })
    const { open, dimmer, size } = state
    const [error, setError] = useState(false)

    const onChange = (e) => {
        setLoadingUsername(e.target.value)
        setError(false)
    }

    const handleSubmit = (e) => {
        if (loadingUsername == ''){
            e.preventDefault()
            setError(true)
        }
        else 
            setUsername(loadingUsername)
    }

    const sendMessage = () => {
        if (input !== '')   socket.emit('message-send', {user: username, type: 'message', text: input})
        setInput('')
    }

    useEffect(() => {
        if (username) {
            socket = io('http://localhost:5000', {
                transports: ['websocket'],
                query: {
                    room,
                    username: username
                }
            })

            socket.on('user-joined', msg => {
                setChat(prevState => [
                    ...prevState,
                    msg
                ])
            })

            socket.on('user-left', msg => {
                setChat(prevState => [
                    ...prevState,
                    msg
                ])
            })

            socket.on('usersList', msg => {
                setUsers(msg.users)
            })

            socket.on('code-receive', msg => {
                setCode(msg)
            })

            socket.on('lang-receive', msg => {
                setLanguage(msg)
            })

            socket.on('message-receive', msg => {
                setChat(prevState => [
                    ...prevState,
                    msg
                ])
            })
        }

        return () => {
            if (username)
                socket.close()
        }

    }, [username])

    const options = [
        {
            key: 0,
            text: 'JavaScript',
            value: 'javascript'
        },
        {
            key: 1,
            text: 'Python',
            value: 'python'
        },
        {
            key: 2,
            text: 'Java',
            value: 'java'
        },
        {
            key: 3,
            text: 'C++',
            value: 'clike'
        },
        {
            key: 4,
            text: 'PHP',
            value: 'php'
        }
    ]

    return (
        <>{ !username ? 
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
                    <Button positive onClick={handleSubmit} >
                        Join Room
                    </Button>
                </Modal.Actions>
            </Modal>
            :
            <div className='mainContainer' style={{backgroundColor:'white'}}>
                <div className='menu'>
                    <div className="title">
                        <text>Coding Interview</text>
                    </div>
                    <div className='users'>
                        <div style={{width:'100%',display:'flex',flexDirection:'column'}}>{users.map((username) => <Label size='large' color='violet' image={true} className='label' style={{margin:'15px',display: 'flex',flexDirection:'row',justifyContent:'left',alignItems:'center',textAlign:'center'}}>
                            <img src='https://semantic-ui.com/images/avatar/small/elliot.jpg' />
                            {username}
                        </Label>
                        )}
                        </div>
                    </div>
                    <div className="leave">
                        <Link to='/'><Button content='Leave Room' icon='log out' color='red' labelPosition='right'/></Link>
                    </div>
                </div>
                <div className="editor">
                    <Dropdown style={{marginBottom: '10px'}} placeholder='Choose a language' value={language} selection options={options} onChange={(event, data) => {
                        setLanguage(data.value)
                        socket.emit('lang-send', data.value)
                        }
                    } />
                    <CodeMirror
                        className='CodeMirror'
                        value={code}
                        options={{
                            mode: language == 'java'  ? 'clike' : language,
                            theme: 'darcula',
                            lineNumbers: true
                        }}
                        onBeforeChange={(editor, data, value) => {
                            socket.emit('code-send', value)
                            setCode(value)
                        }}
                    />
                </div>
                <div className="chat">
                    {/* <div className='message-white'>
                        aaaaaaa
                    </div>
                    <div className='message-grey'>
                        aaaaaaa
                    </div>
                    <div className='message-white'>
                        aaaaaaa
                    </div> */}
                    <div style={{height: '90%', overflowY : 'scroll'}}>{chat.map((item) => <div className={item.type === 'message' ? 'message-white' : 'message-grey'}>
                        {item.type === 'joined' && <p style={{color: 'green', fontSize: '1.15em', fontWeight: 'bold'}}>{item.text}</p>}
                        {item.type === 'left' && <p style={{color: 'red', fontSize: '1.15em', fontWeight: 'bold'}}>{item.text}</p>}
                        {item.type === 'message' && <p><span  style={{fontSize: '1.15em', fontWeight: 'bold'}}>{`${item.user}: `}</span>{item.text}</p>}
                    </div>)}</div>
                    <div style={{position: 'absolute', display: 'flex', flexDirection: 'row', alignItems: 'center', bottom: '0px', margin: '5px'}}>
                        <div><TextArea placeholder='Type Here...' value={input} onChange={(event, data) => setInput(data.value)} /></div>
                        <div style={{margin: '5px'}}><Button content='Send' icon='send' color='violet' labelPosition='right' onClick={sendMessage} /></div>
                    </div>
                </div>
            </div>
        }</>
    )
}

export default Room;