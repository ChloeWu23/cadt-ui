import _ from 'lodash';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { withRouter, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { FormattedMessage, useIntl } from 'react-intl';
import { downloadTxtFile } from '../../utils/csvUtils';
import constants from '../../constants';
import { getUpdatedUrl } from '../../utils/urlUtils';
import { useWindowSize } from '../../components/hooks/useWindowSize';

import {
  getStagingData,
  deleteStagingData,
  commitStagingData,
  getPaginatedData,
} from '../../store/actions/climateWarehouseActions';
import { setPendingError } from '../../store/actions/app';

import {
  H3,
  APIDataTable,
  AddIcon,
  SearchInput,
  SelectSizeEnum,
  SelectTypeEnum,
  PrimaryButton,
  CreateUnitsForm,
  DownloadIcon,
  Tab,
  Tabs,
  TabPanel,
  StagingDataGroups,
  SelectOrganizations,
  Message,
  UploadCSV,
  Alert,
} from '../../components';

const headings = [
  'projectLocationId',
  'unitOwner',
  'countryJurisdictionOfOwner',
  'inCountryJurisdictionOfOwner',
  'serialNumberBlock',
  'serialNumberPattern',
  'marketplace',
  'marketplaceLink',
  'marketplaceIdentifier',
  'unitTags',
  'unitStatusReason',
  'vintageYear',
  'unitRegistryLink',
  'unitType',
  'unitStatus',
  'correspondingAdjustmentDeclaration',
  'correspondingAdjustmentStatus',
];

const StyledSectionContainer = styled('div')`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledHeaderContainer = styled('div')`
  display: flex;
  align-items: center;
  padding: 30px 24px 14px 16px;
`;

const StyledSearchContainer = styled('div')`
  max-width: 25.1875rem;
`;

const StyledFiltersContainer = styled('div')`
  margin: 0rem 1.2813rem;
`;

const StyledButtonContainer = styled('div')`
  margin-left: auto;
`;

const StyledSubHeaderContainer = styled('div')`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 27.23px;
`;

const StyledBodyContainer = styled('div')`
  flex-grow: 1;
`;

const StyledCreateOneNowContainer = styled('div')`
  margin-left: 0.3125rem;
  display: inline-block;
  cursor: pointer;
  color: #1890ff;
`;

const NoDataMessageContainer = styled('div')`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const StyledCSVOperationsContainer = styled('div')`
  display: flex;
  justify-content: flex-end;
  gap: 20px;
`;

const PendingMessageContainer = styled('div')`
  display: flex;
  justify-content: center;
  width: 100%;
  gap: 20px;
`;

const Units = withRouter(() => {
  const dispatch = useDispatch();
  const [create, setCreate] = useState(false);
  const { notification } = useSelector(store => store.app);
  const intl = useIntl();
  let history = useHistory();
  const climateWarehouseStore = useSelector(store => store.climateWarehouse);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  let searchParams = new URLSearchParams(history.location.search);
  const unitsContainerRef = useRef(null);
  const [modalSizeAndPosition, setModalSizeAndPosition] = useState(null);
  const windowSize = useWindowSize();

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const switchTabBySuccessfulRequest = {
      'unit-deleted': 1,
      'unit-successfully-created': 1,
      'unit-successfully-edited': 1,
      'unit-successfully-split': 1,
      'transactions-committed': 2,
    };
    if (switchTabBySuccessfulRequest[notification?.id]) {
      setTabValue(switchTabBySuccessfulRequest[notification.id]);
    }
  }, [notification]);

  useEffect(() => {
    if (unitsContainerRef && unitsContainerRef.current) {
      setModalSizeAndPosition({
        left: unitsContainerRef.current.getBoundingClientRect().x,
        top: unitsContainerRef.current.getBoundingClientRect().y,
        width: unitsContainerRef.current.getBoundingClientRect().width,
        height: unitsContainerRef.current.getBoundingClientRect().height,
      });
    }
  }, [
    unitsContainerRef,
    unitsContainerRef.current,
    windowSize.height,
    windowSize.width,
  ]);

  const pageIsMyRegistryPage =
    searchParams.has('myRegistry') && searchParams.get('myRegistry') === 'true';

  const onSearch = useMemo(
    () =>
      _.debounce(event => {
        if (event.target.value !== '') {
          history.replace({
            search: getUpdatedUrl(window.location.search, {
              param: 'search',
              value: event.target.value,
            }),
          });
        } else {
          history.replace({
            search: getUpdatedUrl(window.location.search, {
              param: 'search',
              value: null,
            }),
          });
        }
        setSearchQuery(event.target.value);
      }, 300),
    [dispatch],
  );

  useEffect(() => {
    return () => {
      onSearch.cancel();
    };
  }, []);

  useEffect(() => {
    const options = {
      type: 'units',
      page: 1,
      resultsLimit: constants.MAX_TABLE_SIZE,
    };
    if (searchQuery) {
      options.searchQuery = searchQuery;
    }
    if (selectedOrganization && selectedOrganization !== 'all') {
      options.orgUid = selectedOrganization;
    }
    if (pageIsMyRegistryPage) {
      options.orgUid = searchParams.get('orgUid');
    }
    dispatch(getPaginatedData(options));
    dispatch(getStagingData({ useMockedResponse: false }));
  }, [
    dispatch,
    tabValue,
    searchQuery,
    selectedOrganization,
    pageIsMyRegistryPage,
  ]);

  const filteredColumnsTableData = useMemo(() => {
    if (!climateWarehouseStore.units) {
      return null;
    }

    return climateWarehouseStore.units.map(unit =>
      _.pick(unit, [
        'warehouseUnitId',
        'projectLocationId',
        'unitOwner',
        'countryJurisdictionOfOwner',
        'inCountryJurisdictionOfOwner',
        'serialNumberBlock',
        'serialNumberPattern',
        'vintageYear',
        'marketplace',
        'marketplaceLink',
        'marketplaceIdentifier',
        'unitTags',
        'unitStatus',
        'unitStatusReason',
        'unitType',
        'unitRegistryLink',
        'unitMarketplaceLink',
        'correspondingAdjustmentStatus',
        'correspondingAdjustmentDeclaration',
        'electedCorrespondingAdjustmentStatus',
        'unitCount',
      ]),
    );
  }, [climateWarehouseStore.units]);

  if (!filteredColumnsTableData) {
    return null;
  }

  const onCommit = () => {
    dispatch(commitStagingData());
  };

  const onOrganizationSelect = selectedOption => {
    const orgUid = selectedOption[0].orgUid;
    setSelectedOrganization(orgUid);
    history.replace({
      search: getUpdatedUrl(window.location.search, {
        param: 'orgUid',
        value: orgUid,
      }),
    });
  };

  return (
    <>
      <StyledSectionContainer ref={unitsContainerRef}>
        <StyledHeaderContainer>
          <StyledSearchContainer>
            <SearchInput
              size="large"
              onChange={onSearch}
              disabled={tabValue !== 0}
              outline
            />
          </StyledSearchContainer>
          {tabValue === 0 && !pageIsMyRegistryPage && (
            <StyledFiltersContainer>
              <SelectOrganizations
                size={SelectSizeEnum.large}
                type={SelectTypeEnum.basic}
                placeholder={intl.formatMessage({ id: 'filters' })}
                width="200px"
                onChange={onOrganizationSelect}
                displayAllOrganizations
              />
            </StyledFiltersContainer>
          )}
          <StyledButtonContainer>
            {tabValue === 0 && pageIsMyRegistryPage && (
              <PrimaryButton
                label={intl.formatMessage({ id: 'create' })}
                size="large"
                icon={<AddIcon width="16.13" height="16.88" fill="#ffffff" />}
                onClick={() => {
                  if (
                    _.isEmpty(
                      climateWarehouseStore.stagingData.units.pending,
                    ) &&
                    _.isEmpty(
                      climateWarehouseStore.stagingData.projects.pending,
                    )
                  ) {
                    setCreate(true);
                  } else {
                    dispatch(setPendingError(true));
                  }
                }}
              />
            )}
            {tabValue === 1 &&
              climateWarehouseStore.stagingData.units.staging.length > 0 && (
                <PrimaryButton
                  label={intl.formatMessage({ id: 'commit' })}
                  size="large"
                  onClick={onCommit}
                />
              )}
          </StyledButtonContainer>
        </StyledHeaderContainer>
        <StyledSubHeaderContainer>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label={intl.formatMessage({ id: 'committed' })} />
            {pageIsMyRegistryPage && (
              <Tab
                label={`${intl.formatMessage({ id: 'staging' })} (${
                  climateWarehouseStore.stagingData &&
                  climateWarehouseStore.stagingData.units.staging.length
                })`}
              />
            )}
            {pageIsMyRegistryPage && (
              <Tab
                label={`${intl.formatMessage({ id: 'pending' })} (${
                  climateWarehouseStore.stagingData &&
                  climateWarehouseStore.stagingData.units.pending.length
                })`}
              />
            )}
          </Tabs>
          <StyledCSVOperationsContainer>
            <span onClick={() => downloadTxtFile(climateWarehouseStore.units)}>
              <DownloadIcon />
            </span>
            {pageIsMyRegistryPage && (
              <span>
                <UploadCSV type="units" />
              </span>
            )}
          </StyledCSVOperationsContainer>
        </StyledSubHeaderContainer>
        <StyledBodyContainer>
          <TabPanel value={tabValue} index={0}>
            {climateWarehouseStore.units &&
              climateWarehouseStore.units.length === 0 && (
                <NoDataMessageContainer>
                  <H3>
                    {!searchQuery && pageIsMyRegistryPage && (
                      <>
                        <FormattedMessage id="no-units-created" />
                        <StyledCreateOneNowContainer
                          onClick={() => {
                            if (
                              _.isEmpty(
                                climateWarehouseStore.stagingData.units.pending,
                              ) &&
                              _.isEmpty(
                                climateWarehouseStore.stagingData.projects
                                  .pending,
                              )
                            ) {
                              setCreate(true);
                            } else {
                              dispatch(setPendingError(true));
                            }
                          }}
                        >
                          <FormattedMessage id="create-one-now" />
                        </StyledCreateOneNowContainer>
                      </>
                    )}
                    {!searchQuery && !pageIsMyRegistryPage && (
                      <FormattedMessage id="no-search-results" />
                    )}
                    {searchQuery && <FormattedMessage id="no-search-results" />}
                  </H3>
                </NoDataMessageContainer>
              )}
            {climateWarehouseStore.units &&
              climateWarehouseStore.units.length > 0 && (
                <>
                  <APIDataTable
                    headings={Object.keys(filteredColumnsTableData[0])}
                    data={filteredColumnsTableData}
                    actions={'Units'}
                    modalSizeAndPosition={modalSizeAndPosition}
                    actionsAreDisplayed={pageIsMyRegistryPage}
                  />
                </>
              )}
            {create && (
              <CreateUnitsForm
                onClose={() => setCreate(false)}
                modalSizeAndPosition={modalSizeAndPosition}
              />
            )}
          </TabPanel>
          {pageIsMyRegistryPage && (
            <>
              <TabPanel value={tabValue} index={1}>
                {climateWarehouseStore.stagingData &&
                  climateWarehouseStore.stagingData.units.staging.length ===
                    0 && (
                    <NoDataMessageContainer>
                      <H3>
                        <FormattedMessage id="no-staged" />
                      </H3>
                    </NoDataMessageContainer>
                  )}
                {climateWarehouseStore.stagingData && (
                  <StagingDataGroups
                    headings={headings}
                    data={climateWarehouseStore.stagingData.units.staging}
                    deleteStagingData={uuid =>
                      dispatch(deleteStagingData(uuid))
                    }
                  />
                )}
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                {climateWarehouseStore.stagingData &&
                  climateWarehouseStore.stagingData.units.pending.length ===
                    0 && (
                    <NoDataMessageContainer>
                      <H3>
                        <FormattedMessage id="no-pending" />
                      </H3>
                    </NoDataMessageContainer>
                  )}
                {climateWarehouseStore.stagingData && (
                  <>
                    <PendingMessageContainer>
                      <Alert
                        type="info"
                        showIcon
                        alertTitle={intl.formatMessage({ id: 'pending-info' })}
                        alertBody={intl.formatMessage({
                          id: 'pending-stuck-info',
                        })}
                      />
                    </PendingMessageContainer>
                    <StagingDataGroups
                      headings={headings}
                      data={climateWarehouseStore.stagingData.units.pending}
                      deleteStagingData={uuid =>
                        dispatch(deleteStagingData(uuid))
                      }
                    />
                  </>
                )}
              </TabPanel>
            </>
          )}
        </StyledBodyContainer>
      </StyledSectionContainer>
      {notification && (
        <Message id={notification.id} type={notification.type} />
      )}
    </>
  );
});

export { Units };
