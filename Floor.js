import React, {Component} from 'react'
import {View} from 'react-native'
import Images from './assets/Images'

export default class Floor extends Component {
    render() {
        const width = this.props.bounds.max.x - this.props.bounds.min.x
        const height = this.props.bounds.max.y - this.props.bounds.min.y
        const x = this.props.body.position.x - width / 2
        const y = this.props.body.position.y - height / 2

        const imageIteration = Math.ceil(width/height )

        return (
            <View
                style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: width,
                    height:height,
                    overflow: 'hidden',
                    flexDirection: 'row'
                }} 
            >
            {
                Array.apply(null, Array(imageIteration)).map((el, idx) => {
                    return <Image
                        style={{width: width, height: height}}
                        key={{idx}}
                        resizeMode="stretch"
                        source={Images.floor}
                    ></Image>
                })
            }
            </View>
        )
    }
}