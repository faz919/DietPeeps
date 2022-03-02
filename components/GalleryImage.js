import React, { PureComponent, useEffect } from 'react';
import { View, TouchableOpacity, ImageBackground, StyleSheet, Text } from 'react-native'
import PieChart from 'react-native-pie-chart'
import { windowWidth } from '../utils/Dimensions'
import storage from '@react-native-firebase/storage'

class GalleryImage extends PureComponent {

    constructor(props) {
        super(props)
        this.state = { thumbnailURL: null }
    }

    async componentDidMount() {
        const thumbnailRef = this.props.item.thumbnail ? storage().ref(`chat-pictures/${this.props.item.thumbnail}`) : null
            if(thumbnailRef) {
                this.setState({ thumbnailURL: await thumbnailRef.getDownloadURL() })
            }
    }

    render() {
        return (
            <TouchableOpacity key={this.props.item.url} onPress={this.props.onPress}>
                <ImageBackground imageStyle={{ opacity: this.props.item.graded ? 0.4 : 1 }} style={styles.photoDisplay} source={{ uri: this.state.thumbnailURL ? this.state.thumbnailURL : this.props.item.url }}>
                    {this.props.item.graded ?
                    <View style={styles.pieChartContainer}>
                        <Text style={{fontSize: windowWidth * 0.32 * 0.3 * 0.7, color: '#202060'}}>{this.props.item.grade}</Text>
                        <PieChart
                            style={{ borderWidth: windowWidth * 0.32 * 0.015, borderRadius: windowWidth * 0.32 * 0.15, borderColor: '#fff' }}
                            widthAndHeight={windowWidth * 0.32 * 0.3}
                            series={[this.props.item.red * 10, this.props.item.yellow * 10, this.props.item.green * 10]}
                            sliceColor={['#C70039', '#EBD32E', '#43CD3F']}
                        />
                    </View>
                        : null}
                </ImageBackground>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    photoDisplay: {
        width: windowWidth * (0.32),
        height: windowWidth * (0.32),
        marginLeft: windowWidth * (0.01),
        marginBottom: windowWidth * (0.01),
        justifyContent:'flex-end',
    },
    pieChartContainer: {
        elevation: 10,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 3,
        shadowOpacity: 0.4,
        flexDirection: 'row', 
        padding: 5, 
        justifyContent: 'space-between', 
        alignItems:'flex-end',
    }
})

export default GalleryImage