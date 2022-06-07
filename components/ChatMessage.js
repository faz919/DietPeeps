import { MotiView } from 'moti'
import React from 'react'
import { Pressable, Text, TouchableOpacity, View, StyleSheet } from 'react-native'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import ChatImage from './ChatImage'
import CourseLinkImage from './CourseLinkImage'
import StreakGif from './StreakGif'
import { windowHeight, windowWidth } from '../utils/Dimensions'

const ChatMessage = ({ style, item, handleLongPress, scrollToOriginal, SevenDayAvg, outgoingMessage, user, navigation, userCourseData, courseInfo, handleStatSummaryPress, msgTimeText, repliesToText, disablePress, disableItemReplyIndicator }) => {
    return (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.timeSent} style={{ ...style, alignItems: outgoingMessage ? 'flex-end' : 'flex-start' }}>
            {item.repliesTo != null && !disableItemReplyIndicator &&
                <TouchableOpacity style={{ marginBottom: -5, marginTop: 10, paddingHorizontal: 15, justifyContent: 'center' }} onPress={scrollToOriginal}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ transform: [{ scaleX: -1 }] }}>
                            <MaterialCommunityIcons name="reply" size={15} color="#BDB9DB" />
                        </View>
                        <Text style={{ fontWeight: 'bold', fontSize: 14, color: '#BDB9DB' }}>Replies to: </Text>
                        <Text numberOfLines={1} ellipsizeMode={'tail'} style={{ fontSize: 14, color: '#BDB9DB', maxWidth: item.msg != null && item.msg?.length > 0 ? windowWidth / 3 : 'auto' }}>{repliesToText}</Text>
                    </View>
                </TouchableOpacity>
            }
            <Pressable onLongPress={handleLongPress} style={outgoingMessage ? styles.outgoingMsg : styles.incomingMsg}>
                {item.img != null &&
                    item.img.map((i) => (
                        <ChatImage key={i.url} user={user} message={item} image={i} navigation={navigation} onLongPress={handleLongPress} disablePress={disablePress} />
                    ))
                }
                {item.msgType === 'courseLink' &&
                    <CourseLinkImage key={item.id} user={user} messageData={item} userCourseData={userCourseData} courseInfo={courseInfo} navigation={navigation} disablePress={disablePress} />
                }
                {item.msgType === 'streakCongrats' && item.streakDay <= 30 &&
                    <StreakGif item={item} />
                }
                {item.msgType === 'statSummary' ?
                    <Text style={outgoingMessage ? styles.outgoingMsgText : styles.incomingMsgText}>Good morning! This is your weekly check-in.{`\n\n`}{SevenDayAvg() === '-' ? `You did not send in any meal photos this week.` : `Your average meal score for the past week is ${SevenDayAvg()}.`}
                        {`\n`}<Text onPress={disablePress ? () => {} : handleStatSummaryPress} style={{ fontSize: 14, color: '#4D43BD', textDecorationLine: 'underline' }}>Click here</Text> to view more stats.
                        {`\n\n`}What are some of your victories you want to celebrate for the past week?</Text> :
                    <Text style={outgoingMessage ? styles.outgoingMsgText : styles.incomingMsgText}>{item.msg}</Text>}
            </Pressable>
            {msgTimeText != null && <Text style={[styles.msgTimeText, { alignSelf: outgoingMessage ? 'flex-end' : 'flex-start' }]}>
                {msgTimeText}
            </Text>}
        </MotiView>
    )
}

export default ChatMessage

const styles = StyleSheet.create({
    outgoingMsg: {
        justifyContent: 'center',
        backgroundColor: '#202060',
        borderRadius: 10,
        padding: 10,
        alignItems: 'flex-end',
        paddingHorizontal: 15,
        margin: 20,
        marginVertical: 10,
        marginLeft: '20%',
    },
    outgoingMsgText: {
        fontSize: 14,
        color: '#fff',
    },
    incomingMsg: {
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
        alignItems: 'flex-start',
        paddingHorizontal: 15,
        margin: 20,
        marginVertical: 10,
        marginRight: '20%',
    },
    incomingMsgText: {
        fontSize: 14,
        color: '#312A60',
    },
    msgTimeText: {
        fontSize: 12,
        color: '#BBBBC5',
        paddingHorizontal: 25,
        marginTop: -10,
        alignSelf: 'flex-end',
    }
})