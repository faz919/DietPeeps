import React, { useState } from 'react'
import { TouchableOpacity, ImageBackground, View, StyleSheet } from 'react-native'
import SkeletonPlaceholder from 'react-native-skeleton-placeholder'
import Icon from 'react-native-vector-icons/Ionicons'

const CourseImage = ({ item, userCourseData, navigation }) => {

    const [loading, setLoading] = useState(false)

    return (
        <View style={{ width: 140, height: 140, overflow: 'hidden', borderRadius: 16 }}>
            {/* don't allow user to select course if it's after the course after the last completed course (2 or more courses after their latest completed course) */}
            <TouchableOpacity disabled={item.UniqueCourseNumber - userCourseData.latestCourseCompleted > 1} onPress={() => navigation.navigate('Course', { courseData: item, courseCompleted: userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ? true : false })}>
                <ImageBackground onLoadStart={() => setLoading(true)} onLoad={() => setLoading(false)}
                    style={{ width: '100%', height: '100%', borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}
                    imageStyle={{opacity: userCourseData.latestCourseCompleted >= item.UniqueCourseNumber ? 0.3 : 1}}
                    resizeMode={'cover'}
                    source={{ uri: `${item.CoverLink}` }}
                >
                        {/* if they've completed the course, show the checkmark overlay */}
                        {userCourseData.latestCourseCompleted >= item.UniqueCourseNumber &&
                        <View style={{ position: 'absolute' }}>
                            <Icon
                                name='checkmark-circle-outline'
                                size={100}
                                color='#43CD3F'
                                style={styles.checkmarkStyle}
                            />
                        </View>}
                        {/* {loading && <SkeletonPlaceholder backgroundColor='#BDB9DB' highlightColor='#e6e7fa' speed={1000}>
                            <View style={{ width: 140, height: 140, borderRadius: 6, position: 'absolute' }} />
                        </SkeletonPlaceholder>} */}
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