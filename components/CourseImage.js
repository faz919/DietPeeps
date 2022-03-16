import React, { useState } from 'react'
import { TouchableOpacity, ImageBackground, View, StyleSheet } from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import Icon from 'react-native-vector-icons/Ionicons'

const CourseImage = ({ item, userCourseData, navigation }) => {

    const [loading, setLoading] = useState(true)

    return (
        <View style={{ width: 140, height: 140, overflow: 'hidden', borderRadius: 16 }}>
            <TouchableOpacity disabled={item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1} onPress={() => navigation.navigate('Course', { courseData: item, courseCompleted: userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ? true : false })}>
                <ImageBackground onLoad={() => setLoading(false)}
                    style={{ width: '100%', height: '100%', borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}
                    imageStyle={{opacity: userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ? 0.3 : 1}}
                    resizeMode={'cover'}
                    source={{ uri: `${item.CoverLink}` }}
                >
                    {!loading ?
                        userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ?
                            <Icon
                                name='checkmark-circle-outline'
                                size={100}
                                color='#4bb543'
                                style={styles.checkmarkStyle}
                            />
                            : null
                        : <SkeletonPlaceholder backgroundColor='#BDB9DB' highlightColor='#e6e7fa' speed={1000}>
                            <View style={{ width: 140, height: 140, borderRadius: 6 }} />
                        </SkeletonPlaceholder>}
                </ImageBackground>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    checkmarkStyle: {
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 5,
        shadowOpacity: 0.4,
        left: 3
    }
})

export default CourseImage