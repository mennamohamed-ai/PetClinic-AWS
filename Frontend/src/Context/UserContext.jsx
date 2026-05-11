import React, { createContext, useState } from 'react'

export let UserContext = createContext()

export default function UserContextProvider(props) {
  let [UserData,  setUserDataState]  = useState(() => localStorage.getItem('userToken') || null)
  let [userName,  setUserNameState]  = useState(() => localStorage.getItem('userName')  || null)
  let [UserPhone, setUserPhoneState] = useState(() => localStorage.getItem('userPhone') || null)
  let [UserID,    setUserIDState]    = useState(() => localStorage.getItem('userID')    || null)
  let [userRole,  setUserRoleState]  = useState(() => localStorage.getItem('userRole')  || null)

  const setUserData  = v => { setUserDataState(v);  v ? localStorage.setItem('userToken', v)       : localStorage.removeItem('userToken')  }
  const setUserName  = v => { setUserNameState(v);  v ? localStorage.setItem('userName',  v)       : localStorage.removeItem('userName')   }
  const setUserPhone = v => { setUserPhoneState(v); v ? localStorage.setItem('userPhone', v)       : localStorage.removeItem('userPhone')  }
  const setUserID    = v => { setUserIDState(v);    v ? localStorage.setItem('userID',    String(v)): localStorage.removeItem('userID')    }
  const setUserRole  = v => { setUserRoleState(v);  v ? localStorage.setItem('userRole',  v)       : localStorage.removeItem('userRole')   }

  return (
    <UserContext.Provider value={{
      UserData, setUserData, userName, setUserName,
      UserPhone, setUserPhone, UserID, setUserID,
      userRole, setUserRole
    }}>
      {props.children}
    </UserContext.Provider>
  )
}