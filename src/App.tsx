import React, { useEffect, useMemo } from 'react'
import { ApolloProvider } from '@apollo/client'
import {
  Text,
  useColorScheme,
  LogBox,
  Platform,
  StatusBar,
  UIManager,
} from 'react-native'
import { ThemeProvider } from '@shopify/restyle'
import {
  DarkTheme,
  LinkingOptions,
  NavigationContainer,
} from '@react-navigation/native'
import useAppState from 'react-native-appstate-hook'
import * as SplashScreen from 'expo-splash-screen'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { useApolloClient } from './graphql/useApolloClient'
import { theme, darkThemeColors, lightThemeColors } from './theme/theme'
import RootNavigator from './navigation/RootNavigator'
import { useAccountStorage } from './storage/AccountStorageProvider'
import LockScreen from './features/lock/LockScreen'
import SecurityScreen from './features/security/SecurityScreen'
import useMount from './utils/useMount'
import OnboardingProvider from './features/onboarding/OnboardingProvider'
import { RootNavigationProp } from './navigation/rootTypes'
import AccountSelector from './components/AccountSelector'
import TransactionProvider from './features/onboarding/TransactionProvider'
import SafeAreaBox from './components/SafeAreaBox'

SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
})

const linking = {
  prefixes: ['nova://'],
  config: {
    screens: {
      HomeNavigator: {
        initialRouteName: 'AccountsScreen',
        screens: {
          WifiOnboard: 'wifi',
        },
      },
    },
  },
} as LinkingOptions<RootNavigationProp>

const App = () => {
  LogBox.ignoreLogs([
    'Module iCloudStorage',
    'EventEmitter.removeListener',
    'componentWillReceiveProps has been renamed',
    'AsyncStorage has been extracted from react-native core and will be removed in a future release.',
  ])

  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  const { appState } = useAppState()
  const { restored: accountsRestored } = useAccountStorage()

  const { client, clientReady, loading } = useApolloClient()

  const colorScheme = useColorScheme()
  const colorAdaptedTheme = useMemo(
    () => ({
      ...theme,
      colors: colorScheme === 'light' ? lightThemeColors : darkThemeColors,
    }),
    [colorScheme],
  )

  const navTheme = useMemo(
    () => ({
      ...DarkTheme,
      dark: colorScheme === 'light',
      colors: {
        ...DarkTheme.colors,
        background:
          colorScheme === 'light'
            ? lightThemeColors.primaryBackground
            : darkThemeColors.primaryBackground,
      },
    }),

    [colorScheme],
  )

  useMount(() => {
    GoogleSignin.configure({
      iosClientId:
        '605970674117-ll6b47atjj62m8i7j698pojgrbdf3ko1.apps.googleusercontent.com',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    })
  })

  useEffect(() => {
    if (!accountsRestored) return

    SplashScreen.hideAsync()
  }, [accountsRestored])

  if (!client || loading) {
    return (
      <ThemeProvider theme={colorAdaptedTheme}>
        <SafeAreaBox flex={1} backgroundColor="white">
          <Text>Splash Screen</Text>
        </SafeAreaBox>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={colorAdaptedTheme}>
      <OnboardingProvider>
        <ApolloProvider client={client}>
          <TransactionProvider clientReady={clientReady}>
            <LockScreen>
              {accountsRestored && (
                <AccountSelector>
                  {Platform.OS === 'android' && (
                    <StatusBar translucent backgroundColor="transparent" />
                  )}
                  <NavigationContainer theme={navTheme} linking={linking}>
                    <RootNavigator />
                  </NavigationContainer>
                  <SecurityScreen
                    visible={appState !== 'active' && appState !== 'unknown'}
                  />
                </AccountSelector>
              )}
            </LockScreen>
          </TransactionProvider>
        </ApolloProvider>
      </OnboardingProvider>
    </ThemeProvider>
  )
}

export default App
