import { useEffect, useMemo, useState } from 'react'
import { Autocomplete, CircularProgress, TextField, Typography, Box } from '@mui/material'
import axiosInstance from '../../services/axiosInstance'
import { EntityOption, EntityType } from '../../types/entity'
import { ENTITY_CONFIG } from '../../utils/entityConfig'

interface EntitySelectProps {
  entityType: EntityType
  value: string
  onChange: (id: string, option: EntityOption | null) => void
  required?: boolean
  disabled?: boolean
  refreshToken?: number
  label?: string
  onOptionsChange?: (options: EntityOption[]) => void
}

function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay])
  return debounced
}

export default function EntitySelect({
  entityType,
  value,
  onChange,
  required = false,
  disabled = false,
  refreshToken = 0,
  label,
  onOptionsChange,
}: EntitySelectProps) {
  const config = ENTITY_CONFIG[entityType]
  const [options, setOptions] = useState<EntityOption[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const debouncedSearch = useDebouncedValue(inputValue, 300)

  const selectedOption = useMemo(() => {
    return options.find((item) => item.id === value) || null
  }, [options, value])

  useEffect(() => {
    let cancelled = false
    const fetchOptions = async () => {
      setLoading(true)
      try {
        const response: any = await axiosInstance.get(config.endpoint, {
          params: {
            page: 1,
            limit: 25,
            search: debouncedSearch,
          },
        })
        const payload = Array.isArray(response.data) ? response.data : []
        const normalized = payload.map(config.toOption)
        if (!cancelled) {
          setOptions(normalized)
          onOptionsChange?.(normalized)
        }
      } catch (_error) {
        if (!cancelled) {
          setOptions([])
          onOptionsChange?.([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchOptions()
    return () => {
      cancelled = true
    }
  }, [config, debouncedSearch, refreshToken, onOptionsChange])

  return (
    <Autocomplete
      fullWidth
      options={options}
      value={selectedOption}
      loading={loading}
      disabled={disabled}
      onChange={(_event, selected) => onChange(selected?.id || '', selected)}
      inputValue={inputValue}
      onInputChange={(_event, text) => setInputValue(text)}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      noOptionsText={
        debouncedSearch
          ? `No ${config.plural.toLowerCase()} found`
          : `No ${config.plural.toLowerCase()} available`
      }
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.name}</Typography>
          {option.subtitle ? (
            <Typography variant="caption" color="text.secondary">{option.subtitle}</Typography>
          ) : null}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          required={required}
          label={label || config.selectLabel}
          placeholder={config.searchPlaceholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
