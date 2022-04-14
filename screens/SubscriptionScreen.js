// import React, { useEffect, useState } from 'react'
// import Purchases from 'react-native-purchases'

// const SubscriptionScreen = () => {

//     const [subscription, setSubscription] = useState(null)

//     const fetchOfferings = async () => {
//         try {
//             const subscriptions = await Purchases.getOfferings()
//             console.log(subscriptions.current.availablePackages[0].product)
//             subscriptions.current != null && setSubscription(subscriptions.current)
//         } catch (e) {
//             console.error('error while retrieving subscriptions: ', e)
//         }
//     }

//     const buySubscription = async (subscription) => {
//         try {
//             const { purchaserInfo, productIdentifier } = await Purchases.purchasePackage(subscription)
//             if (typeof purchaserInfo.entitlements.active.my_entitlement_identifier !== 'undefined') {
//                 console.log('Success!')
//             }
//         } catch (e) {
//             console.error('error while making purchase: ', e)
//         }
//     }

//     useEffect(() => {
//         fetchOfferings()
//     }, [])

//     return null
// }

// export default SubscriptionScreen