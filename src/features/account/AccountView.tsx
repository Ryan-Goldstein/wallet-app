import React, { memo, useEffect, useMemo, useState } from 'react'
import { NetTypes } from '@helium/address'
import CurrencyFormatter from 'react-native-currency-format'
import { addMinutes } from 'date-fns'
import { BoxProps } from '@shopify/restyle'
import { GestureResponderEvent } from 'react-native'
import * as AccountUtils from '../../utils/accountUtils'
import { AccountBalance, AccountData } from '../../generated/graphql'
import Text from '../../components/Text'
import { useBalance } from '../../utils/Balance'
import FadeInOut from '../../components/FadeInOut'
import { useAppStorage } from '../../storage/AppStorageProvider'
import supportedCurrencies from '../../utils/supportedCurrencies'
import AccountActionBar from './AccountActionBar'
import useLayoutHeight from '../../hooks/useLayoutHeight'
import Box from '../../components/Box'
import DateModule from '../../utils/DateModule'
import { Theme } from '../../theme/theme'

type Props = {
  accountData?: AccountData | null
  hntPrice?: number
  selectedBalance?: AccountBalance
  onTouchStart?: (event: GestureResponderEvent) => void
} & BoxProps<Theme>

const AccountView = ({
  accountData,
  hntPrice,
  selectedBalance,
  ...boxProps
}: Props) => {
  const [balanceString, setBalanceString] = useState('')
  const [selectedDate, setSelectedDate] = useState('')

  const { toCurrencyString, networkBalance, networkStakedBalance } =
    useBalance()
  const { currency } = useAppStorage()
  const [formattedHntPrice, setFormattedHntPrice] = useState('')
  const [actionBarHeight, setActionBarHeight] = useLayoutHeight()

  const accountNetType = useMemo(
    () => AccountUtils.accountNetType(accountData?.address),
    [accountData],
  )

  useEffect(() => {
    if (!selectedBalance) {
      setSelectedDate('')
      return
    }
    const date = new Date(selectedBalance.date)
    const utc = addMinutes(date, date.getTimezoneOffset())
    DateModule.formatDate(utc.toISOString(), 'dd MMMM yyyy').then(
      setSelectedDate,
    )
  }, [selectedBalance])

  useEffect(() => {
    if (accountNetType !== NetTypes.MAINNET) {
      setFormattedHntPrice('Testnet')
      return
    }

    if (!hntPrice && !selectedBalance) return

    let price = hntPrice

    if (selectedBalance) {
      price = selectedBalance.hntPrice
    }

    CurrencyFormatter.format(price || 0, currency).then((p) =>
      setFormattedHntPrice(`1 HNT = ${p}`),
    )
  }, [accountNetType, currency, hntPrice, selectedBalance])

  useEffect(() => {
    if (accountNetType !== NetTypes.MAINNET) {
      setBalanceString('Testnet')
      return
    }

    if (selectedBalance) {
      CurrencyFormatter.format(selectedBalance.balance, currency).then(
        setBalanceString,
      )
    } else if (hntPrice) {
      let bal = networkBalance
      if (networkStakedBalance) {
        bal = networkBalance?.plus(networkStakedBalance)
      }
      toCurrencyString(bal).then(setBalanceString)
    } else {
      setBalanceString('')
    }
  }, [
    accountNetType,
    currency,
    networkBalance,
    networkStakedBalance,
    hntPrice,
    selectedBalance,
    toCurrencyString,
  ])

  return (
    <Box
      flexDirection="column"
      alignItems="center"
      marginTop="xxxl"
      {...boxProps}
    >
      <Text
        variant="body1"
        color="secondaryText"
        numberOfLines={1}
        adjustsFontSizeToFit
        maxFontSizeMultiplier={1.2}
        textAlign="center"
        marginBottom="s"
      >
        {supportedCurrencies[currency]}
      </Text>
      {!balanceString && (
        <Text
          maxFontSizeMultiplier={1.1}
          variant="h0"
          color="primaryText"
          numberOfLines={1}
          adjustsFontSizeToFit
          textAlign="center"
        >
          {' '}
        </Text>
      )}
      {!!balanceString && (
        <FadeInOut>
          <Text
            maxFontSizeMultiplier={1.1}
            variant="h0"
            color="primaryText"
            numberOfLines={1}
            adjustsFontSizeToFit
            textAlign="center"
          >
            {balanceString}
          </Text>
        </FadeInOut>
      )}
      <Text
        variant="body2"
        textAlign="center"
        marginTop="s"
        marginBottom="m"
        color="secondaryText"
      >
        {formattedHntPrice}
      </Text>
      {!selectedBalance && (
        <FadeInOut>
          <AccountActionBar onLayout={setActionBarHeight} />
        </FadeInOut>
      )}
      {selectedBalance && (
        <FadeInOut>
          <Box minHeight={actionBarHeight}>
            <Text
              variant="body3"
              color="secondaryText"
              marginLeft="xs"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {selectedDate}
            </Text>
          </Box>
        </FadeInOut>
      )}
    </Box>
  )
}

export default memo(AccountView)
