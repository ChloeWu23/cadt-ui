import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import {
  Modal,
  Body,
  InputSizeEnum,
  InputStateEnum,
  StandardInput,
  InputVariantEnum,
  LocalMessageTypeEnum,
  LocalMessage,
  ModalFormContainerStyle,
  modalTypeEnum,
  FormContainerStyle,
  BodyContainer,
  LabelContainer,
  ToolTipContainer,
  DescriptionIcon,
  FieldRequired,
  StyledFieldRequired,
  StyledLabelContainer,
  StyledFieldContainer,
  InputContainer,
  SimpleSelectSizeEnum,
  SimpleSelectTypeEnum,
  SimpleSelectStateEnum,
  SimpleSelect,
} from '..';
import { splitUnits } from '../../store/actions/climateWarehouseActions';

const SplitUnitForm = ({ onClose, record }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState([
    {
      unitCount: '',
      unitOwner: '',
      countryJurisdictionOfOwner: '',
      inCountryJurisdictionOfOwner: '',
    },
    {
      unitCount: '',
      unitOwner: '',
      countryJurisdictionOfOwner: '',
      inCountryJurisdictionOfOwner: '',
    },
  ]);
  const intl = useIntl();
  const [validationErrors, setValidationErrors] = useState([]);
  const { notification, showProgressOverlay: apiResponseIsPending } =
    useSelector(state => state.app);

  const { units, pickLists } = useSelector(store => store.climateWarehouse);
  const fullRecord = units.filter(
    unit => unit.warehouseUnitId === record.warehouseUnitId,
  )[0];

  const unitIsSplittable = fullRecord.unitCount !== 1;

  const validationSchema = yup
    .array()
    .of(
      yup.object().shape({
        unitCount: yup.number().required().positive().integer(),
        unitOwnerOrgUid: yup.string().nullable(),
      }),
    )
    .test({
      message: 'units do not add up',
      test: value =>
        value[0].unitCount + value[1].unitCount === fullRecord.unitCount,
    });

  const onSubmit = () => {
    if (!apiResponseIsPending) {
      validationSchema
        .validate(data, { abortEarly: false, recursive: true })
        .then(() => {
          setValidationErrors([]);
          dispatch(
            splitUnits({
              warehouseUnitId: fullRecord.warehouseUnitId,
              records: data.map(splittedUnit => {
                const newUnit = {};
                newUnit.unitCount = splittedUnit.unitCount;

                if (splittedUnit.unitOwner !== '') {
                  newUnit.unitOwner = splittedUnit.unitOwner;
                }

                if (splittedUnit.countryJurisdictionOfOwner !== '') {
                  newUnit.countryJurisdictionOfOwner =
                    splittedUnit.countryJurisdictionOfOwner;
                }

                if (splittedUnit.inCountryJurisdictionOfOwner !== '') {
                  newUnit.inCountryJurisdictionOfOwner =
                    splittedUnit.inCountryJurisdictionOfOwner;
                }

                return newUnit;
              }),
            }),
          );
        })
        .catch(err => {
          setValidationErrors([...err.errors]);
        });
    }
  };

  const unitWasSuccessfullySplit =
    notification && notification.id === 'unit-successfully-split';
  useEffect(() => {
    if (unitWasSuccessfullySplit) {
      onClose();
    }
  }, [notification]);

  const getInputFieldState = index => {
    if (_.includes(validationErrors, 'units do not add up')) {
      return InputVariantEnum.error;
    }
    if (
      validationErrors.findIndex(element => element.includes(`${index}`)) !== -1
    ) {
      return InputVariantEnum.error;
    }
    return InputVariantEnum.default;
  };

  const getValidationLocalMessage = () => {
    if (
      validationErrors.findIndex(element => element.includes('0')) !== -1 ||
      validationErrors.findIndex(element => element.includes('1')) !== -1
    ) {
      return intl.formatMessage({
        id: 'unit-count-must-be-a-valid-integer',
      });
    }
    if (_.includes(validationErrors, 'units do not add up')) {
      return `
        ${intl.formatMessage({
          id: 'units-dont-add-up',
        })} ${fullRecord.unitCount}.
        `;
    }
    return '';
  };

  return (
    <>
      {validationErrors.length > 0 && (
        <LocalMessage
          msg={getValidationLocalMessage()}
          type={LocalMessageTypeEnum.error}
          onClose={() => setValidationErrors([])}
        />
      )}
      {unitIsSplittable === false && (
        <LocalMessage
          msg={intl.formatMessage({
            id: 'unit-cannot-be-split',
          })}
          type={LocalMessageTypeEnum.error}
        />
      )}
      <Modal
        onOk={onSubmit}
        onClose={onClose}
        modalType={modalTypeEnum.basic}
        hideButtons={!unitIsSplittable}
        title={intl.formatMessage({
          id: 'split',
        })}
        label={intl.formatMessage({
          id: 'split',
        })}
        body={
          <ModalFormContainerStyle>
            <Body size="Bold">
              <FormattedMessage id="total-units-available" />:{' '}
              {fullRecord.unitCount}
            </Body>
            <FormContainerStyle>
              {data.map((unit, index) => (
                <>
                  {index === 1 && <StyledFieldRequired />}
                  {index === 0 && <FieldRequired />}
                  <StyledLabelContainer>
                    <Body size="Bold">
                      <FormattedMessage id="record" /> {index + 1}
                    </Body>
                  </StyledLabelContainer>
                  <BodyContainer key={index}>
                    <StyledFieldContainer>
                      <StyledLabelContainer>
                        <Body>
                          <LabelContainer>
                            * <FormattedMessage id="nr-of-units" />
                          </LabelContainer>
                          <ToolTipContainer
                            tooltip={intl.formatMessage({
                              id: 'unit-count',
                            })}
                          >
                            <DescriptionIcon height="14" width="14" />
                          </ToolTipContainer>
                        </Body>
                      </StyledLabelContainer>
                      <InputContainer>
                        <StandardInput
                          size={InputSizeEnum.large}
                          placeholderText={intl.formatMessage({
                            id: 'nr-of-units',
                          })}
                          state={
                            unitIsSplittable
                              ? InputStateEnum.default
                              : InputStateEnum.disabled
                          }
                          variant={getInputFieldState(index)}
                          value={unit.unitCount}
                          onChange={value =>
                            setData(prevData => {
                              const newData = [...prevData];
                              newData[index].unitCount = value;
                              return newData;
                            })
                          }
                        />
                      </InputContainer>
                    </StyledFieldContainer>
                    <StyledFieldContainer>
                      <StyledLabelContainer>
                        <Body>
                          <LabelContainer>
                            <FormattedMessage id="unit-owner" />
                          </LabelContainer>
                          <ToolTipContainer
                            tooltip={intl.formatMessage({
                              id: 'units-unit-owner-description',
                            })}
                          >
                            <DescriptionIcon height="14" width="14" />
                          </ToolTipContainer>
                        </Body>
                      </StyledLabelContainer>
                      <InputContainer>
                        <StandardInput
                          size={InputSizeEnum.large}
                          placeholderText={intl.formatMessage({
                            id: 'unit-owner',
                          })}
                          state={
                            unitIsSplittable
                              ? InputStateEnum.default
                              : InputStateEnum.disabled
                          }
                          value={unit.unitOwner}
                          onChange={value =>
                            setData(prevData => {
                              const newData = [...prevData];
                              newData[index].unitOwner = value;
                              return newData;
                            })
                          }
                        />
                      </InputContainer>
                    </StyledFieldContainer>
                    <StyledFieldContainer>
                      <StyledLabelContainer>
                        <Body>
                          <LabelContainer>
                            <FormattedMessage id="country-jurisdiction-of-owner" />
                          </LabelContainer>
                          <ToolTipContainer
                            tooltip={intl.formatMessage({
                              id: 'units-country-jurisdiction-of-owner-description',
                            })}
                          >
                            <DescriptionIcon height="14" width="14" />
                          </ToolTipContainer>
                        </Body>
                      </StyledLabelContainer>
                      <InputContainer>
                        <SimpleSelect
                          size={SimpleSelectSizeEnum.large}
                          type={SimpleSelectTypeEnum.basic}
                          options={pickLists.countries}
                          state={
                            unitIsSplittable
                              ? SimpleSelectStateEnum.default
                              : SimpleSelectStateEnum.disabled
                          }
                          onChange={selectedOptions =>
                            setData(prevData => {
                              const newData = [...prevData];
                              newData[index].countryJurisdictionOfOwner =
                                selectedOptions[0];
                              return newData;
                            })
                          }
                        />
                      </InputContainer>
                    </StyledFieldContainer>
                    <StyledFieldContainer>
                      <StyledLabelContainer>
                        <Body>
                          <LabelContainer>
                            <FormattedMessage id="in-country-jurisdiction-of-owner" />
                          </LabelContainer>
                          <ToolTipContainer
                            tooltip={intl.formatMessage({
                              id: 'units-in-country-jurisdiction-of-owner-description',
                            })}
                          >
                            <DescriptionIcon height="14" width="14" />
                          </ToolTipContainer>
                        </Body>
                      </StyledLabelContainer>
                      <InputContainer>
                        <StandardInput
                          size={InputSizeEnum.large}
                          placeholderText={intl.formatMessage({
                            id: 'in-country-jurisdiction-of-owner',
                          })}
                          state={
                            unitIsSplittable
                              ? InputStateEnum.default
                              : InputStateEnum.disabled
                          }
                          value={unit.inCountryJurisdictionOfOwner}
                          onChange={value =>
                            setData(prevData => {
                              const newData = [...prevData];
                              newData[index].inCountryJurisdictionOfOwner =
                                value;
                              return newData;
                            })
                          }
                        />
                      </InputContainer>
                    </StyledFieldContainer>
                  </BodyContainer>
                </>
              ))}
            </FormContainerStyle>
          </ModalFormContainerStyle>
        }
      />
    </>
  );
};

export { SplitUnitForm };
