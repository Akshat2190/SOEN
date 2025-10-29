import React, { createContext, useState } from 'react'

// create user context
// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

// create a provider provider
export const UserProvider = ({children}) => {
    const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{user, setUser}}>
        {children}
    </UserContext.Provider>
  )
}

export default UserContext;