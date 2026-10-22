import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import { useTranslation } from 'react-i18next'
import {
  countValidFirstReactionCustomPoolWords,
  dedupeFirstReactionCustomWords,
  isFirstReactionPoolKeywordLength,
  normalizeFirstReactionKeywordToken,
} from '@/lib/first-reaction-custom-words'

type FirstReactionCustomWordsFieldProps = {
  words: string[]
  disabled: boolean
  showValidation: boolean
  onChange: (words: string[]) => void
}

export function FirstReactionCustomWordsField(
  props: FirstReactionCustomWordsFieldProps,
) {
  const { t } = useTranslation()
  const validCount = countValidFirstReactionCustomPoolWords(props.words)
  const hasError = props.showValidation && validCount === 0

  return (
    <Autocomplete
      multiple
      freeSolo
      disabled={props.disabled}
      options={[]}
      value={props.words}
      onChange={(_, newValue) => {
        props.onChange(dedupeFirstReactionCustomWords(newValue.map(String)))
      }}
      renderTags={(value, getTagProps) =>
        value.map((word, index) => {
          const { key, ...tagProps } = getTagProps({ index })
          const token = normalizeFirstReactionKeywordToken(word)
          const invalid =
            token.length > 0 && !isFirstReactionPoolKeywordLength(token)
          return (
            <Chip
              key={key}
              {...tagProps}
              label={word}
              size="small"
              color={invalid ? 'warning' : 'default'}
              variant={invalid ? 'outlined' : 'filled'}
            />
          )
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label={t('firstReaction.customWordsLabel')}
          placeholder={t('firstReaction.customWordsPlaceholder')}
          error={hasError}
          helperText={
            hasError
              ? t('firstReaction.customWordsEmptyError')
              : t('firstReaction.customWordsHelper', { count: validCount })
          }
        />
      )}
    />
  )
}
