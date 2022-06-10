import React from 'react'
import { AuthProvider } from './AuthProvider'
import Routes from './Routes'

const Providers = () => {
    // wrap routes in auto provider
    return (
        <AuthProvider>
            <Routes />
        </AuthProvider>
    )
}

export default Providers