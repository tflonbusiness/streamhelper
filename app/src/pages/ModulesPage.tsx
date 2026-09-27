import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { alpha, styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconTile } from '@/components/IconTile'
import { PageHeader } from '@/components/PageHeader'
import {
  MODULE_CATALOG,
  moduleDescriptionKey,
  moduleNameKey,
} from '@/lib/modules'

const PageStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(4),
}))

const ModuleCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'unavailable',
})<{ unavailable?: boolean }>(({ theme, unavailable }) => ({
  backgroundColor: theme.palette.background.paper,
  border: '1px solid',
  borderColor: theme.palette.divider,
  borderRadius: theme.spacing(1),
  boxShadow: 'none',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  ...(unavailable ? { opacity: 0.8 } : {}),
}))

const ModuleCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2.5),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  '&:last-child': {
    paddingBottom: theme.spacing(2.5),
  },
}))

const ModuleHeaderStack = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}))

const ModuleInfo = styled(Box)({
  minWidth: 0,
  flex: 1,
})

const ModuleTitleRow = styled(Stack)(({ theme }) => ({
  marginBottom: theme.spacing(0.5),
  flexWrap: 'wrap',
  alignItems: 'center',
}))

const ModuleTitle = styled(Typography)({
  fontWeight: 600,
})

const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.text.primary, 0.08),
}))

const ModuleFooter = styled(Box)(({ theme }) => ({
  marginTop: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
}))

export function ModulesPage() {
  const { t } = useTranslation()

  return (
    <PageStack>
      <PageHeader
        title={t('modules.pageTitle')}
        description={t('modules.pageDescription')}
        icon={SportsEsportsIcon}
        iconVariant="primary"
      />
      <Grid container spacing={2}>
        {MODULE_CATALOG.map((module) => {
          const isAvailable = module.status === 'available'

          return (
            <Grid key={module.id} size={{ xs: 12, md: 6 }}>
              <ModuleCard elevation={0} unavailable={!isAvailable}>
                <ModuleCardContent>
                  <ModuleHeaderStack direction="row" spacing={1.5}>
                    <IconTile
                      icon={module.icon}
                      variant={module.iconVariant}
                    />
                    <ModuleInfo>
                      <ModuleTitleRow direction="row" spacing={1}>
                        <ModuleTitle variant="subtitle1">
                          {t(moduleNameKey(module.id))}
                        </ModuleTitle>
                        <StatusChip
                          label={
                            isAvailable ? t('common.available') : t('common.soon')
                          }
                          size="small"
                        />
                      </ModuleTitleRow>
                      <Typography variant="body2" color="text.secondary">
                        {t(moduleDescriptionKey(module.id))}
                      </Typography>
                    </ModuleInfo>
                  </ModuleHeaderStack>
                  <ModuleFooter>
                    {isAvailable && module.widgetRoute ? (
                      <Button
                        component={Link}
                        to={module.widgetRoute}
                        variant="contained"
                      >
                        {t('common.open')}
                      </Button>
                    ) : (
                      <Button variant="contained" disabled>
                        {t('common.comingSoon')}
                      </Button>
                    )}
                  </ModuleFooter>
                </ModuleCardContent>
              </ModuleCard>
            </Grid>
          )
        })}
      </Grid>
    </PageStack>
  )
}
