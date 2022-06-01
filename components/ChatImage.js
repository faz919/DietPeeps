import React, { useContext, useState } from 'react'
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet } from 'react-native'
import Share from 'react-native-share'
import PieChart from 'react-native-pie-chart'
import { windowWidth } from '../utils/Dimensions'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { MotiText, MotiView } from 'moti'
import { AuthContext } from '../navigation/AuthProvider'

const ChatImage = ({ user, message, image, navigation, onLongPress }) => {

    const { mixpanel } = useContext(AuthContext)

    const pieChartDimensions = windowWidth * 0.65 * 0.25
    const [loading, setLoading] = useState(true)

    const handlePress = () => {
        image.graded ? mixpanel.track('Button Press', { 'Button': 'ChatImageGraded' }) : mixpanel.track('Button Press', { 'Button': 'ChatImage' })
        navigation.navigate('Main Menu', { screen: 'Gallery', params: { imageInfo: image } })
    }

    // temporary until sharing becomes a message-wide thing
    // const shareOptions = {
    //     message: message.msg || (message.userID === user.uid ? 'Check out this image from DietPeeps!' : image.graded ? `Check this out! My DietPeeps coach scored my meal and I got a ${image.grade}!` : 'Check out this image from my DietPeeps coach!'), 
    //     url: `data:${image.mime};base64,${image.base64}`
    // }

    // const handleLongPress = () => {
    //     Share.open(shareOptions)
    //     mixpanel.track('Button Press', { 'Button': 'LongPressChatImage' })
    // }

    return (
        <TouchableOpacity key={image.url} onPress={handlePress} onLongPress={onLongPress}>
            <ImageBackground onLoad={() => setLoading(false)} imageStyle={{ borderRadius: 10, opacity: image.graded ? message.userID !== user.uid ? 0.4 : 1 : 1 }} style={styles.textImage} source={{ uri: image.url }}>
                {!loading && image.graded && message.userID != user.uid &&
                    <View style={{
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: windowWidth * 0.65, padding: 10, elevation: 10,
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowRadius: 5,
                        shadowOpacity: 0.4,
                    }}>
                        <MotiText from={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: -15, color: '#202060', fontSize: 60, fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal' }}>{image.grade}</MotiText>
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
                                series={[image.red * 10, image.yellow * 10, image.green * 10]}
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