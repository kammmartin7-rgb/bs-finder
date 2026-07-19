// Shared sales tracking inputs for the lead edit dialog.
import { useLanguage } from '../../context/LanguageContext'
import {
  SALES_STATUS_I18N_KEYS,
  SALES_STATUS_VALUES,
  normalizeSalesStatus,
} from '../../services/leadSalesTracking'

export default function LeadSalesTrackingFields({ values, onChange, onPersistField }) {
  const { t } = useLanguage()

  function persistField(field, value) {
    onChange(field, value)
    onPersistField?.(field, value)
  }

  return (
    <fieldset className="manual-lead-wide manual-lead-sales" data-testid="lead-sales-tracking">
      <legend>{t('salesTrackingSection')}</legend>
      <div className="manual-lead-grid manual-lead-grid--sales">
        <label>{t('salesStatusLabel')}
          <select
            value={values.salesStatus}
            onChange={(event) => persistField('salesStatus', normalizeSalesStatus(event.target.value))}
          >
            {SALES_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>{t(SALES_STATUS_I18N_KEYS[status] || status)}</option>
            ))}
          </select>
        </label>
        <label>{t('messageVersionLabel')}
          <input
            value={values.messageVersion}
            onChange={(event) => onChange('messageVersion', event.target.value)}
            onBlur={(event) => persistField('messageVersion', event.target.value)}
          />
        </label>
        <label>{t('nextActionLabel')}
          <input
            value={values.nextAction}
            onChange={(event) => onChange('nextAction', event.target.value)}
            onBlur={(event) => persistField('nextAction', event.target.value)}
          />
        </label>
        <label>{t('nextActionDateLabel')}
          <input
            type="date"
            value={values.nextActionDate}
            onChange={(event) => persistField('nextActionDate', event.target.value)}
          />
        </label>
        <label>{t('lastContactLabel')}
          <input
            type="date"
            value={values.lastContactAt}
            onChange={(event) => persistField('lastContactAt', event.target.value)}
          />
        </label>
      </div>
    </fieldset>
  )
}
