import React, { useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { Image } from 'react-native'
import { FadeIn, FadeOut } from 'react-native-reanimated'
import Box from '../../components/Box'
import Text from '../../components/Text'
import TouchableOpacityBox from '../../components/TouchableOpacityBox'
import { CollectableNavigationProp } from './collectablesTypes'
import { useBorderRadii } from '../../theme/themeHooks'
import { Collectable } from '../../types/solana'
import { ww } from '../../utils/layout'
import CircleLoader from '../../components/CircleLoader'
import { ReAnimatedBox } from '../../components/AnimatedBox'

const COLLECTABLE_HEIGHT = ww / 2
const NftListItem = ({
  item,
  collectables,
}: {
  item: string
  collectables: Record<string, Collectable[]>
}) => {
  const { lm } = useBorderRadii()
  const { json } = collectables[item][0]
  const navigation = useNavigation<CollectableNavigationProp>()

  const handleCollectableNavigation = useCallback(
    (collection: Collectable[]) => () => {
      if (collection.length > 1) {
        navigation.navigate('CollectionScreen', {
          collection,
        })
      } else if (collection[0]?.json?.image) {
        // TODO: Cache image so we don't need to fetch uri in all the different nft screens
        navigation.navigate('NftDetailsScreen', {
          collectable: collection[0],
        })
      }
    },
    [navigation],
  )

  return (
    <ReAnimatedBox style={{ width: '50%' }} entering={FadeIn} exiting={FadeOut}>
      <TouchableOpacityBox
        marginHorizontal="s"
        marginVertical="s"
        alignItems="center"
        backgroundColor="surfaceSecondary"
        borderRadius="xxl"
        onPress={handleCollectableNavigation(collectables[item])}
      >
        <Image
          borderRadius={lm}
          style={{ height: COLLECTABLE_HEIGHT, width: '100%' }}
          source={{
            uri: json?.image,
            cache: 'force-cache',
          }}
        />
        <Box
          padding="s"
          position="absolute"
          justifyContent="center"
          alignItems="center"
          backgroundColor="white"
          borderRadius="round"
          bottom={20}
          right={16}
          flexDirection="row"
        >
          <Text variant="subtitle4" color="black" marginRight="xs">
            {item}
          </Text>
          <Text variant="body2" color="secondaryText">
            {collectables[item].length}
          </Text>
        </Box>
      </TouchableOpacityBox>
    </ReAnimatedBox>
  )
}

export const CollectableSkeleton = () => {
  return (
    <ReAnimatedBox style={{ width: '50%' }} entering={FadeIn} exiting={FadeOut}>
      <TouchableOpacityBox
        marginHorizontal="s"
        marginVertical="s"
        alignItems="center"
      >
        <Box
          backgroundColor="surface"
          borderRadius="xl"
          height={COLLECTABLE_HEIGHT}
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          <CircleLoader loaderSize={80} />
        </Box>
      </TouchableOpacityBox>
    </ReAnimatedBox>
  )
}

export default NftListItem
