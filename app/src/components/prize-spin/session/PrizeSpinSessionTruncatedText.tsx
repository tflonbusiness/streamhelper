import { Tooltip } from '@mui/material'
import { styled } from '@mui/material/styles'

const TruncatedText = styled('span')({
  display: 'block',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

type PrizeSpinSessionTruncatedTextProps = {
  text: string
}

export const PrizeSpinSessionTruncatedText = (
  props: PrizeSpinSessionTruncatedTextProps,
) => {
  return (
    <Tooltip title={props.text} placement="top" enterDelay={400}>
      <TruncatedText>{props.text}</TruncatedText>
    </Tooltip>
  )
}
