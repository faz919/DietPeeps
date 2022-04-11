import React, { useState } from 'react'
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet, Share } from 'react-native'
import PieChart from 'react-native-pie-chart'
import { windowWidth } from '../utils/Dimensions'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { MotiText, MotiView } from 'moti'

const ChatImage = ({ user, item, i, navigation }) => {

    const pieChartDimensions = windowWidth * 0.65 * 0.25
    const [loading, setLoading] = useState(true)

    return (
        <TouchableOpacity key={i.url} onPress={() => navigation.navigate('Main Menu', { screen: 'Gallery', params: { imageInfo: i } })} 
        // onLongPress={() => Share.share({ message: item.msg, url: i.url })}
        >
            <ImageBackground onLoad={() => setLoading(false)} imageStyle={{ borderRadius: 10, opacity: i.graded ? item.userID !== user.uid ? 0.4 : 1 : 1 }} style={styles.textImage} source={{ uri: i.url }}>
                {!loading && i.graded && item.userID != user.uid &&
                    <View style={{
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: windowWidth * 0.65, padding: 10, elevation: 10,
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowRadius: 5,
                        shadowOpacity: 0.4,
                    }}>
                        <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: -15, color: '#202060', fontSize: 60, fontWeight: 'bold' }}>{i.grade}</MotiText>
                        <View style={styles.pieChartContainer}>
                            <MotiView
                                from={{
                                    rotate: "0deg",
                                }}
                                animate={{
                                    rotate: "360deg",
                                }}
                            >
                            <PieChart
                                style={{ borderWidth: pieChartDimensions * 0.05, borderRadius: pieChartDimensions * 0.5, borderColor: '#fff' }}
                                widthAndHeight={pieChartDimensions}
                                series={[i.red * 10, i.yellow * 10, i.green * 10]}
                                sliceColor={['#ECF0E6', '#FFC482', '#67BB3A']}
                            />
                            </MotiView>
                        </View>
                    </View>
                }
                {loading &&
                <SkeletonPlaceholder backgroundColor='#e6e7fa' highlightColor='#fff' speed={1000}>
                    <View style={[styles.textImage, { borderRadius: 10, marginVertical: 0 }]} />
                </SkeletonPlaceholder>}
            </ImageBackground>
        </TouchableOpacity>
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

export default ChatImage