import React, { Suspense } from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { IndeterminateProgressOverlay } from '../components/';
import * as Pages from '../pages';

import { AppContainer, LeftNav } from '../components';

const AppNavigator = () => {
  const { showProgressOverlay } = useSelector(store => store.app);
  return (
    <AppContainer>
      <LeftNav>
        <Router>
          {showProgressOverlay && <IndeterminateProgressOverlay />}
          <Suspense fallback={<IndeterminateProgressOverlay />}>
            <Route exact path="/">
              <Pages.Projects />
            </Route>
            <Route exact path="/co-benefits">
              <Pages.CoBenefits />
            </Route>
            <Route exact path="/locations">
              <Pages.Locations />
            </Route>
            <Route exact path="/qualifications">
              <Pages.Qualifications />
            </Route>
            <Route exact path="/ratings">
              <Pages.Ratings />
            </Route>
            <Route exact path="/related-projects">
              <Pages.RelatedProjects />
            </Route>
            <Route exact path="/units">
              <Pages.Units />
            </Route>
            <Route exact path="/vintages">
              <Pages.Vintages />
            </Route>
            <Route exact path="/projects">
              <Pages.Projects />
            </Route>
            <Route exact path="/storybook">
              <Pages.StoryBook />
            </Route>
          </Suspense>
        </Router>
      </LeftNav>
    </AppContainer>
  );
};

export { AppNavigator };
