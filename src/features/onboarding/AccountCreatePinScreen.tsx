import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import Text from '../../components/Text'
import PinDisplay from '../../components/PinDisplay'
import Keypad from '../../components/Keypad'
import Box from '../../components/Box'
import {
  OnboardingNavigationProp,
  OnboardingStackParamList,
} from './onboardingTypes'

type Route = RouteProp<OnboardingStackParamList, 'AccountCreatePinScreen'>
const AccountCreatePinScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const navigation = useNavigation<OnboardingNavigationProp>()

  const [pin, setPin] = useState('')

  useEffect(() => {
    if (pin.length === 6) {
      navigation.navigate('AccountConfirmPinScreen', {
        ...params,
        pin,
      })
    }
  }, [pin, navigation, params])

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      setPin('')
    })

    return unsubscribe
  }, [navigation])

  const handleBackspace = useCallback(() => {
    setPin((val) => val.slice(0, -1))
  }, [])

  const handleNumber = useCallback((num: number) => {
    setPin((val) => (val.length < 6 ? val + num : val))
  }, [])

  return (
    <Box
      backgroundColor="primaryBackground"
      flex={1}
      paddingHorizontal="xl"
      justifyContent="center"
      alignItems="center"
    >
      <Box flex={1} />
      <Text
        marginBottom="m"
        variant="h1"
        maxFontSizeMultiplier={1}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {t('accountSetup.createPin.title')}
      </Text>

      <Text variant="body1" maxFontSizeMultiplier={1.2}>
        {t('accountSetup.createPin.subtitle')}
      </Text>
      <PinDisplay length={pin.length} marginVertical="xl" />
      <Keypad
        onBackspacePress={handleBackspace}
        onNumberPress={handleNumber}
        onCustomButtonPress={params?.pinReset ? navigation.goBack : undefined}
        customButtonTitle={t('generic.cancel')}
      />
      <Box flex={1} />
    </Box>
  )
}

export default AccountCreatePinScreen
