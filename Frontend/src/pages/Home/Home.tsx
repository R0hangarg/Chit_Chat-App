import { useContext, useEffect, useRef, useState } from "react";
import "./Home.css";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Avatar } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DuoIcon from "@mui/icons-material/Duo";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import AddIcon from "@mui/icons-material/Add";
import MicIcon from "@mui/icons-material/Mic";
import AddCommentIcon from "@mui/icons-material/AddComment";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
// import App from "../../App";
import { Socket, io } from "socket.io-client";
import AddNewContact from "../../pages/AddNewContact/AddNewContact";
import ClearIcon from "@mui/icons-material/Clear";
import AllContacts from "../../pages/AllContacts/AllContacts";
import { GlobalStateContext } from "../../components/ContextApi/GlobalStateProvide";
import { User } from "../../Interface/userInterface/user";
import { Contact } from "../../Interface/contactInterface/NewContactInterface";
import { ChatInterface } from "../../Interface/chatInterface";



const Home = () => {
  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isAllContact, setIsAllContact] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [vertIconClick, setVertIconClick] = useState(false);
  const socket = useRef<Socket | null>(null);
  // const socket = io("http://localhost:8000");

  useEffect(() => {
    // Initialize socket only once
    socket.current = io("http://localhost:8000");

    return () => {
      // Clean up socket connection when component unmounts
      socket.current?.disconnect();
    };
  }, []);


  useEffect(() => {
    if (user?.id && selectedContact?.contactId) {
      const roomId =
        String(user.id) < String(selectedContact.contactId)
          ? `${user.id}_${selectedContact.contactId}`
          : `${selectedContact.contactId}_${user.id}`;
  
      console.log("Generated Room ID:", roomId); // Debugging output
      socket.current?.emit("join-room", roomId);
    }
  }, [user, selectedContact]);

  
  function handleClick() {
    if (user?.id && selectedContact?.id) {
      const roomId =
        String(user.id) < String(selectedContact.contactId)
          ? `${user.id}_${selectedContact.contactId}`
          : `${selectedContact.contactId}_${user.id}`;
  
          
          socket.current?.emit("join-room", roomId);
          const timeStamp = new Date().toISOString();
          socket.current?.emit("send-message", { selectedContact: selectedContact, content: message, timeStamp: timeStamp }, roomId);
          setMessage("");
    }
  }
  useEffect(() => {
    if(user?.id && selectedContact?.contactId) {
      socket.current?.on("emit-message", (newMessage) => {
        if (newMessage?.selectedContact?.userId === user?.id) {
          const ul = document.getElementsByClassName('msgss')
          const li = document.createElement('li')
          li.className = 'sender'
          li.textContent = newMessage?.content 
          ul[0].appendChild(li)
        } 
        
        if (newMessage?.selectedContact?.contactId === user?.id) {
          const ul = document.getElementsByClassName('msgss')
          const li = document.createElement('li')
          li.className = 'receiver'
          li.textContent = newMessage?.content
          ul[0].appendChild(li)
        }
      });
    
      return () => {
        socket.current?.off("emit-message");
      };
    }
  }, [user, selectedContact]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await axios.get("http://localhost:8000/api/v1/user", {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setUser(data.data);
    };
    fetchData();
  }, []);

  
  useEffect(() => {
    if (user && selectedContact) {
      const fetchData = async () => {
        const result = await axios.get(
          `http://localhost:8000/api/v1/user/allMessages/${user?.id}/${selectedContact?.contactId}`
        );

        result?.data?.messages.forEach((item: ChatInterface) => {
          if (item?.senderId === user?.id) {
            const ul = document.getElementsByClassName('msgss')
            const li = document.createElement('li')
            li.className = 'sender'
            const span = document.createElement('span')
            span.className = 'senderSpan'
            const createdAtDate = new Date(item.createdAt);

            // Format the time as "hh:mm AM/PM"
            const formattedTime = createdAtDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            });

            span.textContent = formattedTime;
            li.appendChild(span)
            li.textContent = item?.content
            ul[0].appendChild(li)
          } 
          
          if (item?.receiverId === user?.id) {
            const ul = document.getElementsByClassName('msgss')
            const li = document.createElement('li')
            li.className = 'receiver'
            li.textContent = item?.content
            ul[0].appendChild(li)
          }
        })
      };
      fetchData();
    }
  }, [user, selectedContact]);

  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a GlobalStateProvider");
  }

  const { avatar } = context;
  console.log(avatar)

  const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${selectedContact?.name ? selectedContact?.name : 'username'}`;
  return (
    <div className="home">
      {/* Upper Panel  */}
      <div className="homeleft">
        <div className="leftUpperPanel">
          <h2>Chats</h2>
          <div className="sidebar">
            <AddCommentIcon
              color="action"
              className="add"
              sx={{ height: "4vh", width: "4vh" }}
            />
            <div
              onClick={() => setVertIconClick(!vertIconClick)}
              className="MoreVertIcon"
            >
              <MoreVertIcon sx={{ height: "4vh", width: "4vh" }} />
              {vertIconClick ? (
                <div className="vertIconSelectBox">
                  <div
                    className="vertIconItems"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    Add new contact
                  </div>
                  <div className="vertIconItems">Theme</div>
                  <div className="vertIconItems">Settings</div>
                  <div
                    className="vertIconItems"
                    onClick={() => setIsAllContact(!isAllContact)}
                  >
                    All Contacts
                  </div>
                </div>
              ) : (
                ""
              )}
            </div>
          </div>
        </div>
        <div className="leftSearch">
          <input type="text" placeholder=" Search" />
        </div>
        <div className="leftFilter">
          <p>All</p>
          <p>Unread</p>
          <p>Favourites</p>
          <p>Groups</p>
        </div>
        <div className="leftBottomPanel">Chatings</div>

        {isOpen ? (
          <div className="AddNewContact">
            <div
              onClick={() => setIsOpen(!isOpen)}
              style={{ position: "absolute", right: "30px", top: "30px" }}
            >
              <ClearIcon />
            </div>
            <AddNewContact user={user} setIsOpen={setIsOpen} />
          </div>
        ) : (
          ""
        )}
        {isAllContact ? (
          <div className="AllContacts">
            <div
              onClick={() => setIsAllContact(!isAllContact)}
              style={{ position: "absolute", right: "30px", top: "30px" }}
            >
              <ClearIcon />
            </div>
            <AllContacts
              user={user}
              setIsAllContact={setIsAllContact}
              setSelectedContact={setSelectedContact}
            />
          </div>
        ) : null}
      </div>

      <div className="homeright">
        <div className="upperPanel">
          <div className="upperPanelRight">
            <Avatar
              src={boyProfilePic}
              alt="User"
              sx={{ height: "5vh", width: "5vh" }}
            />
            <h3>
              {selectedContact?.name ? selectedContact?.name : "User Name"}
            </h3>
          </div>
          <div className="upperPanelLeft">
            <DuoIcon color="action" sx={{ height: "4vh", width: "4vh" }} />
            <SearchIcon sx={{ height: "4vh", width: "4vh" }} />
            <MoreVertIcon sx={{ height: "4vh", width: "4vh" }} />
          </div>
        </div>

        {/* Middel Panel For Messages */}
        <div className="rightMiddlePanel">
          <ul className='msgss'>   
          </ul>
        </div>
        <div className="rightBottomPanel">
          <div className="icons">
            <InsertEmoticonIcon
              sx={{ height: "4vh", width: "4vh" }}
              className="InsertEmoticonIcon"
            />
            <AddIcon sx={{ height: "4vh", width: "4vh" }} className="AddIcon" />
          </div>
          <input
            type="text"
            placeholder="Type a message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleClick();
              }
            }}
          />
          {message === "" ? (
            <MicIcon sx={{ height: "4vh", width: "4vh" }} className="MicIcon" />
          ) : (
            <span onClick={handleClick}>
              <SendIcon
                sx={{ height: "4vh", width: "4vh" }}
                className="SendIcon" // Call your send message function on click
              />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
