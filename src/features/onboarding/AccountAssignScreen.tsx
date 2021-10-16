import React, { memo, useCallback, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Jazzicon from 'react-native-jazzicon'
import Box from '../../components/Box'
import SafeAreaBox from '../../components/SafeAreaBox'
import TextInput from '../../components/TextInput'
import { OnboardingNavigationProp } from './onboardingTypes'
import { useAccountStorage } from '../../storage/AccountStorageProvider'
import useMount from '../../utils/useMount'
import FabButton from '../../components/FabButton'
import { useSpacing } from '../../theme/themeHooks'
import { useOnboarding } from './OnboardingProvider'

const AccountAssignScreen = () => {
  const onboardingNav = useNavigation<OnboardingNavigationProp>()
  const { t } = useTranslation()
  const [alias, setAlias] = useState('')
  const {
    reset,
    setOnboardingData,
    onboardingData: { secureAccount },
  } = useOnboarding()
  const insets = useSafeAreaInsets()
  const spacing = useSpacing()
  const { upsertAccount, hasAccounts } = useAccountStorage()
  const [jazzIcon] = useState(Math.round(Math.random() * 10000000))

  useMount(() => {
    setOnboardingData((prev) => ({ ...prev, onboardingType: 'assign' }))
  })

  const handlePress = useCallback(() => {
    if (!secureAccount) return

    if (hasAccounts) {
      upsertAccount({ alias, jazzIcon, ...secureAccount })
      onboardingNav.popToTop()
      reset()
      return
    }

    onboardingNav.navigate('AccountCreatePinScreen', {
      pinReset: false,
      account: { ...secureAccount, alias, jazzIcon },
    })
  }, [
    secureAccount,
    hasAccounts,
    onboardingNav,
    alias,
    jazzIcon,
    upsertAccount,
    reset,
  ])

  return (
    <SafeAreaBox
      backgroundColor="primaryBackground"
      flex={1}
      paddingHorizontal={{ smallPhone: 'l', phone: 'xxxl' }}
    >
      <KeyboardAvoidingView
        keyboardVerticalOffset={insets.top + spacing.l}
        behavior={Platform.OS === 'android' ? 'height' : 'padding'}
        style={styles.container}
      >
        <Box alignItems="center" flex={1}>
          <Jazzicon size={84} seed={jazzIcon} />

          <TextInput
            onChangeText={setAlias}
            variant="regular"
            value={alias}
            placeholder={t('accountAssign.AccountNamePlaceholder')}
            autoCorrect={false}
            autoCompleteType="off"
            marginTop="xl"
            autoCapitalize="words"
            width="100%"
          />

          <Box flex={1} />

          <FabButton
            onPress={handlePress}
            icon="arrowRight"
            disabled={!alias}
            backgroundColor="surface"
            backgroundColorPressed="surfaceContrast"
            backgroundColorOpacityPressed={0.1}
          />
        </Box>
      </KeyboardAvoidingView>
    </SafeAreaBox>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%', flex: 1 },
})

export default memo(AccountAssignScreen)
