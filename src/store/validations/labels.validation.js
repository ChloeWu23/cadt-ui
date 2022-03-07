import * as yup from 'yup';

export const labelSchema = yup.object().shape({
  label: yup.string().required('Required Field'),
  labelType: yup.string().required('Required Field'),
  creditingPeriodStartDate: yup
    .date()
    .typeError('Invalid Date')
    .required('Required Field'),
  creditingPeriodEndDate: yup
    .date()
    .min(
      yup.ref('creditingPeriodStartDate'),
      'End date should be greater than start date',
    )
    .typeError('Invalid Date')
    .required('Required Field'),
  validityPeriodStartDate: yup
    .date()
    .typeError('Invalid Date')
    .required('Required Field'),
  validityPeriodEndDate: yup
    .date()
    .min(
      yup.ref('validityPeriodStartDate'),
      'End date should be greater than start date',
    )
    .typeError('Invalid Date')
    .required('Required Field'),
  unitQuantity: yup
    .number()
    .integer()
    .typeError('Add a positive quantity')
    .test({
      message: 'Add a positive quantity',
      test: val => val >= 0,
    })
    .required('Required Field'),
  labelLink: yup.string().required('Required Field'),
});

export const labelsSchema = yup.array().of(labelSchema);