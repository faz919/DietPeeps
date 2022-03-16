import React, { useState } from 'react'
import { ImageBackground, View, StyleSheet } from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'

const ProfilePic = ({ source, size, style, viewStyle, imageStyle }) => {

    const [loading, setLoading] = useState(true)

    return (
        <ImageBackground onLoad={() => setLoading(false)} source={source} style={[{ width: size, height: size, borderRadius: size/2 }, style]} imageStyle={[{ borderRadius: size/2 }, imageStyle]} >
            {loading && 
            <SkeletonPlaceholder backgroundColor='#BDB9DB' highlightColor='#e6e7fa' speed={100000/size}>
                <View style={[{ width: size, height: size, borderRadius: size/2 }, viewStyle]} />
            </SkeletonPlaceholder>}
        </ImageBackground>
    )
}

export default ProfilePic