import * as React from "react"
import { Animated, View, Text, StyleSheet, Platform } from "react-native"
import { TouchableRipple } from "react-native-paper"
import MaskedView from "@react-native-masked-view/masked-view"

const ToggleButtonRow = ({
	values,
	value,
	onSelect,
	style,
	highlightBackgroundColor,
	highlightTextColor,
	inactiveBackgroundColor,
	inactiveTextColor,
	textStyle = {},
}) => {
	const [prevSelectedIndex, setPrevSelectedIndex] = React.useState(0)
	const [selectedIndex, setSelectedIndex] = React.useState(0)
	const selectedPanelLeft = React.useRef(new Animated.Value(0))

	const widthSize = 100 / values.length

	const interpolatedValuesInput = values.map((_, i) => {
		return widthSize * i
	})

	const interpolatedValuesOutput = values.map((_, i) => {
		return `${widthSize * i}%`
	})

	React.useEffect(() => {
		const left = widthSize * selectedIndex

		Animated.timing(selectedPanelLeft.current, {
			toValue: left,
			duration: 170,
			useNativeDriver: false,
		}).start(() => {
			setPrevSelectedIndex(selectedIndex)
		})
	}, [widthSize, selectedPanelLeft, selectedIndex])

	React.useEffect(() => {
		const newIndex = values.findIndex((v) => v === value)
		setPrevSelectedIndex(selectedIndex)
		setSelectedIndex(newIndex)
	}, [values, value, selectedIndex])

	const maxIndex =
		selectedIndex > prevSelectedIndex ? selectedIndex : prevSelectedIndex
	const minIndex =
		selectedIndex > prevSelectedIndex ? prevSelectedIndex : selectedIndex

	const highlightMask = {
		backgroundColor: highlightBackgroundColor,
	}

	const highlightText = {
		color: highlightTextColor,
	}

	const inactiveText = {
		color: inactiveTextColor,
	}

	const inactiveBackground = {
		backgroundColor: inactiveBackgroundColor,
	}

	/**
	 * For whatever reason, the `zIndex: -1` on Text works on Android, but does not work
	 * on iOS. However, when we can get away with only removing the Text from zIndex,
	 * the ripple effect continues to work on Android. As such, we conditionally
	 * apply the logic for Android vs iOS
	 */
	const inactiveContainerIOS = Platform.OS === "ios" ? { zIndex: -1 } : {}

	return (
		<View
			style={[styles.container, style]}
		>
			<MaskedView
				key={selectedIndex}
				style={styles.maskViewContainer}
				androidRenderingMode={"software"}
				maskElement={
					<Animated.View
						style={[
							styles.blueMaskContainer,
							{
								width: `${widthSize}%`,
								left: selectedPanelLeft.current.interpolate({
									inputRange: interpolatedValuesInput,
									outputRange: interpolatedValuesOutput,
								}),
								borderTopRightRadius: value === values[values.length - 1] ? 10 : 0,
								borderBottomRightRadius: value === values[values.length - 1] ? 10 : 0,
								borderTopLeftRadius: value === values[0] ? 10 : 0,
								borderBottomLeftRadius: value === values[0] ? 10 : 0,
							},
						]}
					/>
				}
			>
				<View style={[styles.baseButtonContainer, highlightMask]}>
					{values.map((value, i) => (
						<TouchableRipple
							key={i}
							onPress={() => {
								setSelectedIndex(i)
								onSelect(values[i])
							}}
							style={styles.baseTouchableRipple}
						>
							<Text
								style={[
									styles.baseButtonText,
									styles.highlightText,
									textStyle,
									highlightText,
								]}
								numberOfLines={1}
							>
								{value}
							</Text>
						</TouchableRipple>
					))}
				</View>
			</MaskedView>
			<View
				style={[
					styles.baseButtonContainer,
					styles.inactiveButtonContainer,
					inactiveContainerIOS,
				]}
			>
				{values.map((value, i) => (
					<TouchableRipple
						key={i}
						style={[
							styles.baseTouchableRipple,
							{
								zIndex: minIndex <= i && maxIndex >= i ? -1 : 0,
								borderRightWidth: i === values.length - 1? 0 : 1,
							},
							inactiveBackground,
						]}
						onPress={() => {
							setSelectedIndex(i)
							onSelect(values[i])
						}}
					>
						<Text
							style={[styles.baseButtonText, textStyle, inactiveText]}
							numberOfLines={1}
						>
							{value}
						</Text>
					</TouchableRipple>
				))}
			</View>
		</View>
	)
}

export default ToggleButtonRow

const styles = StyleSheet.create({
	container: {
		height: 48,
		position: "relative",
	},
	maskViewContainer: {
		width: "100%",
		height: "100%",
		position: "relative",
	},
	blueMaskContainer: {
		position: "absolute",
		backgroundColor: "black",
		borderRadius:10,
		height: "100%",
		left: 0,
		top: 0,
	},
	baseButtonContainer: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "nowrap",
		justifyContent: "space-around",
		alignItems: "center",
	},
	inactiveButtonContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#202060',
		width: "100%",
		height: "100%",
	},
	baseTouchableRipple: {
		height: "100%",
		flex: 1,
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	baseButtonText: {
		paddingHorizontal: 16,
	},
	highlightText: {
		zIndex: 1,
	},
})
