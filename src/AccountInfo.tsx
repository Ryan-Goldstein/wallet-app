import React, { memo, useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native'
import { useLazyQuery } from '@apollo/client'
import Input from './Input'
import { DATA_QUERY } from './graphql/account'
import { AccountData } from './graphql/__generated__/AccountData'

const AccountInfo = () => {
  const [address, setAddress] = useState('')
  const [cursor, setCursor] = useState('')
  const [getData, { loading, data, fetchMore, error }] =
    useLazyQuery<AccountData>(DATA_QUERY, {
      notifyOnNetworkStatusChange: true,
    })

  useEffect(() => {
    if (!data?.accountActivity) {
      return
    }
    const {
      accountActivity: { cursor: nextCursor },
    } = data

    setCursor(nextCursor || '')
  }, [cursor, data])

  const handleTextChange = useCallback((text) => {
    setAddress(text)
    setCursor('')
  }, [])

  const handleDataRequest = useCallback(() => {
    getData({ variables: { address, cursor } })
  }, [address, cursor, getData])

  const handleFetchMore = useCallback(() => {
    fetchMore?.({ variables: { address, cursor } })
  }, [address, cursor, fetchMore])

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Input
          title="Enter Account Address"
          style={styles.inputContainer}
          inputProps={{
            editable: !loading,
            onChangeText: handleTextChange,
            value: address,
            placeholder: 'Address',
            style: styles.input,
            multiline: true,
          }}
        />
        <Button title="Get Account Data" onPress={handleDataRequest} />
        <Button title="Fetch More Activity" onPress={handleFetchMore} />
        {loading && <ActivityIndicator color="black" />}
        <Text>{JSON.stringify(data, null, 2)}</Text>
        <Text style={styles.error}>{error?.message}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    margin: 24,
  },
  inputContainer: { marginVertical: 24 },
  input: {},
  error: { color: 'red' },
})

export default memo(AccountInfo)
