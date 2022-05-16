import React, { useContext, useState } from 'react'
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Share } from 'react-native'
import PieChart from 'react-native-pie-chart'
import { windowWidth } from '../utils/Dimensions'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { streakGifURLs } from '../utils/StreakGifURLs'

const StreakGif = ({ item }) => {

    const [loading, setLoading] = useState(true)

    const gifImport = streakGifURLs[item.streakDay - 1]

    return (
        <ImageBackground key={item.id} onLoad={() => setLoading(false)} imageStyle={{ borderRadius: 10 }} style={styles.textImage} source={gifImport}>
            {loading &&
            <SkeletonPlaceholder backgroundColor='#e6e7fa' highlightColor='#fff' speed={1000}>
                <View style={[styles.textImage, { borderRadius: 10, marginVertical: 0 }]} />
            </SkeletonPlaceholder>}
        </ImageBackground>
    )
}

const styles = StyleSheet.create({
    textImage: {
        minHeight: windowWidth * 0.65,
        width: windowWidth * 0.65,
        marginVertical: 10,
    },
    pieChartContainer: {
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
    }
})

export default StreakGif