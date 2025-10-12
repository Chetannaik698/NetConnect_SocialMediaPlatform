import NavbarComponent from '@/components/Navbar'
import React from 'react'

const UserLayout = ({ children }) => {
  return (
    <div>
     <NavbarComponent />
     { children }
    </div>
  )
}

export default UserLayout
