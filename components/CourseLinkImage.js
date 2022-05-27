import React, { useContext, useState } from 'react'
import { TouchableOpacity, ImageBackground, View, Text, StyleSheet } from 'react-native'
import { windowWidth } from '../utils/Dimensions'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import { MotiText, MotiView } from 'moti'
import Icon from 'react-native-vector-icons/Ionicons'
import { AuthContext } from '../navigation/AuthProvider'

const CourseLinkImage = ({ user, messageData, userCourseData, courseInfo, navigation }) => {

    const { mixpanel } = useContext(AuthContext)

    const [loading, setLoading] = useState(true)

    const handlePress = () => {
        mixpanel.track('Button Press', { 'Button': 'CourseLinkImage' }) 
        navigation.navigate('Main Menu', { screen: 'Courses', params: { courseInfo: courseInfo, courseCompleted: userCourseData?.latestCourseCompleted >= courseInfo?.UniqueCourseNumber } })
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <ImageBackground onLoad={() => setLoading(false)} imageStyle={{ borderRadius: 10, opacity: userCourseData?.latestCourseCompleted >= courseInfo?.UniqueCourseNumber ? 0.4 : 1 }} style={styles.textImage} source={{ uri: courseInfo?.CoverLink }}>
                {!loading ?
                    <View style={{
                        justifyContent: 'flex-end', alignItems: 'flex-start', height: windowWidth * 0.65, padding: 10, 
                        elevation: 10,
                        shadowColor: '#000000',
                        shadowOffset: { width: 0, height: 0 },
                        shadowRadius: 10,
                        shadowOpacity: 0.4,
                    }}>
                        {userCourseData?.latestCourseCompleted >= courseInfo?.UniqueCourseNumber &&
                        <MotiView from={{ opacity: 0, rotate: '180deg' }} animate={{ opacity: 1, rotate: '0deg' }} style={{ position: 'absolute', top: (windowWidth * 0.65) / 6, left: (windowWidth * 0.65) / 4 }}>
                            <Icon
                                name='checkmark-circle-outline'
                                size={(windowWidth * 0.65) / 2}
                                color='#43CD3F'
                                style={styles.checkmarkStyle}
                            />
                        </MotiView>}
                        <MotiText from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing' }} style={{ color: '#fff', fontSize: 25, fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal' }}>{courseInfo?.Title}</MotiText>
                        <MotiText from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing' }} style={{ marginBottom: -5, color: '#fff', fontSize: 20, fontWeight: Platform.OS === 'ios' ? 'bold' : 'normal' }}>{courseInfo?.Subtitle}</MotiText>
                    </View>
                :
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
    checkmarkStyle: {
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
        left: 3
    }
})

export default CourseLinkImage