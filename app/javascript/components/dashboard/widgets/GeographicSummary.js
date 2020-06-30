import React from 'react';
import axios from 'axios';
import _ from 'lodash';
import { PropTypes } from 'prop-types';
import { Row, Col, Button } from 'react-bootstrap';
import moment from 'moment';
import Slider from 'rc-slider/lib/Slider';
import 'rc-slider/assets/index.css';
import { stateOptions } from '../../data';
import CountyLevelMaps from './CountyLevelMaps';

const MAX_DAYS_OF_HISTORY = 10; // only allow the user to scrub back N days from today
const INITIAL_SELECTED_DATE_INDEX = 0; // Maybe at some point, we would want to show the latest day initially
const TERRITORY_GEOJSON_FILE = 'usaTerritories.json';
let JURISDICTIONS_NOT_IN_USE = {
  states: [],
  insularAreas: [],
};

class GeographicSummary extends React.Component {
  constructor(props) {
    super(props);
    this.analyticsData = this.parseAnalyticsStatistics();
    this.jurisdictionsPermittedToView = this.obtainjurisdictionsPermittedToView();
    this.state = {
      selectedDateIndex: INITIAL_SELECTED_DATE_INDEX,
      showBackButton: false,
      jurisdictionToShow: {
        category: 'fullCountry',
        name: 'USA',
        eventValue: null,
      },
      mapObject: null,
      showSpinner: false,
      exposureMapData: this.analyticsData.exposure[Number(INITIAL_SELECTED_DATE_INDEX)].value,
      isolationMapData: this.analyticsData.isolation[Number(INITIAL_SELECTED_DATE_INDEX)].value,
    };

    // A lot of times, the CountyLevelMaps functions will take time to render some new jurisdiction map.
    // We want the Spinner to spin until they report back that they're done. Therefore, we set spinnerState to 2
    // and subtract 1 every time they report back. When they each report back, 2 - 1 - 1 = 0 then we set `showSpinner` to false
    // Because calls to setState are asynchronous, this value must be on the component itself
    this.spinnerState = 0;

    // this.analyticsData.exposure is the same as this.analyticsData.isolation (in terms of dates) so it doesnt matter which you use
    this.dateSubset = this.analyticsData.exposure.map(x => x.date);
    this.dateRange = this.analyticsData.exposure.map(x => moment(x.date).format('MM/DD'));
  }

  parseAnalyticsStatistics = () => {
    // internal function for parsing the two workflow types
    const obtainAnalyticsValue = (values, workflowType) => {
      let returnVal = {
        stateData: {},
        countyData: {},
      };
      stateOptions.forEach(jurisdiction => {
        let jurisdictionValue = 0;
        let countyList = [];
        values.forEach(value => {
          if (value.workflow === workflowType) {
            if (value.level === 'State' && value.state === jurisdiction.name) {
              jurisdictionValue = value.total;
            }
            if (value.level === 'County' && value.state === jurisdiction.name) {
              countyList.push({ countyName: value.county || 'Unknown', value: value.total });
            }
          }
        });
        returnVal.stateData[jurisdiction.isoCode] = jurisdictionValue;
        countyList.push({ countyName: 'Franklin', value: parseInt(Math.random() * 69) });
        returnVal.countyData[jurisdiction.isoCode] = countyList;
      });

      return returnVal;
    };

    let analyticsObject = {
      exposure: [],
      isolation: [],
    };

    _.takeRight(
      this.props.stats.monitoree_maps.sort((a, b) => b.day - a.day),
      MAX_DAYS_OF_HISTORY
    ).forEach(dayMapsPair => {
      analyticsObject.exposure.push({ date: dayMapsPair.day, value: obtainAnalyticsValue(dayMapsPair.maps, 'Exposure') });
      analyticsObject.isolation.push({ date: dayMapsPair.day, value: obtainAnalyticsValue(dayMapsPair.maps, 'Isolation') });
    });
    return analyticsObject;
  };

  obtainjurisdictionsPermittedToView = () => {
    // This function iterates over monitoree_maps and pulls out all the state names where counties are referenced
    // This is used to determine what the user has permission to view (as the server only provides the data they are able to view)
    // For example, an epi in Virgina will only be served county-level data for virginia (and possibly bordering states depending on what `address_state` is set)
    // and this epi will not be able to zoom in on Arizona's data for example
    // The function then returns the isoCode for each state the current_user is allowed to expand
    let dateSubset = _.takeRight(
      this.props.stats.monitoree_maps.sort((a, b) => b.day - a.day),
      MAX_DAYS_OF_HISTORY
    );
    let statesReferenced = _.uniq(
      _.flatten(
        dateSubset.map(x =>
          x.maps
            .filter(data => data.level === 'County')
            .map(x => x.state)
            .filter(x => x)
        )
      )
    );
    return statesReferenced.map(x => stateOptions.find(y => y.name === x).isoCode);
  };

  decrementSpinnerCount = () => {
    if (this.spinnerState > 0) {
      if (this.spinnerState === 1) {
        this.setState({
          showSpinner: false,
        });
        this.spinnerState = 0;
      } else {
        this.spinnerState--;
      }
    }
  };

  renderSpinner = () =>
    this.state.showSpinner && (
      <div className="county-maps-loading">
        <span className="fa-stack fa-2x">
          <i className="fas fa-circle fa-stack-2x" style={{ color: '#305473' }}></i>
          <i className="fas fa-spinner fa-spin fa-stack-1x fa-inverse"></i>
        </span>
      </div>
    );

  handleDateRangeChange = value => {
    this.spinnerState = 2;
    this.setState(
      {
        selectedDateIndex: value,
        showSpinner: true,
      },
      () => {
        // The CountyLevelMaps components hang when re-rendering, so we first want to
        // show the spinner and update the date value to provide responsive UI
        setTimeout(() => {
          this.setState({
            exposureMapData: this.analyticsData.exposure[Number(value)].value,
            isolationMapData: this.analyticsData.isolation[Number(value)].value,
          });
        }, 25);
      }
    );
  };

  backToFullCountryMap = () => {
    this.spinnerState = 2;
    this.setState(
      {
        showSpinner: true,
      },
      () => {
        this.handleJurisdictionChange('USA');
      }
    );
  };

  handleJurisdictionChange = jurisdiction => {
    this.spinnerState = 2;
    if (jurisdiction === 'USA') {
      this.setState({
        showBackButton: false,
        jurisdictionToShow: {
          category: 'fullCountry',
          name: 'USA',
          eventValue: null,
        },
        exposureMapData: this.analyticsData.exposure[Number(this.state.selectedDateIndex)].value,
        isolationMapData: this.analyticsData.isolation[Number(this.state.selectedDateIndex)].value,
        mapObject: null,
      });
    } else if (jurisdiction === 'territory') {
      this.setState({ showBackButton: true, showSpinner: true });
      let mapFile = TERRITORY_GEOJSON_FILE;
      this.loadJurisdictionData(mapFile, jurisdictionData => {
        this.setState({
          showBackButton: true,
          jurisdictionToShow: {
            category: 'territory',
            name: jurisdiction.name,
            eventValue: null,
          },
          exposureMapData: this.analyticsData.exposure[Number(this.state.selectedDateIndex)].value,
          isolationMapData: this.analyticsData.isolation[Number(this.state.selectedDateIndex)].value,
          mapObject: jurisdictionData.mapObject,
        });
      });
    } else {
      this.setState({ showBackButton: true, showSpinner: true });
      this.loadJurisdictionData(jurisdiction.target.dataItem.dataContext.map, jurisdictionData => {
        this.setState({
          showBackButton: true,
          jurisdictionToShow: {
            category: 'state',
            name: jurisdiction.target.dataItem.dataContext.name,
            eventValue: jurisdiction, // this is actually an eventObject from am4Charts
          },
          exposureMapData: this.analyticsData.exposure[Number(this.state.selectedDateIndex)].value,
          isolationMapData: this.analyticsData.isolation[Number(this.state.selectedDateIndex)].value,
          mapObject: jurisdictionData.mapObject,
        });
      });
    }
  };

  loadJurisdictionData = async (jurisdictionFileName, callback) => {
    callback({
      mapObject: await axios.get(`${window.location.origin}/county_level_maps/${jurisdictionFileName}`).then(res => res.data),
    });
  };

  render() {
    let backButton = this.state.showBackButton && (
      <Button variant="primary" size="md" className="ml-auto btn-square" onClick={() => this.backToFullCountryMap()}>
        <i className="fas fa-arrow-left mr-2"> </i>
        Back to Country View
      </Button>
    );
    return (
      <div style={{ width: '100%' }}>
        <Row className="mb-4 mx-2 px-0">
          <Col md="24">
            <div className="text-center display-5 mb-1 mt-1 pb-4">{moment(this.dateSubset[this.state.selectedDateIndex]).format('MMMM DD, YYYY')}</div>
            <div className="mx-5 mb-4 pb-2">
              <Slider
                max={MAX_DAYS_OF_HISTORY - 1}
                marks={this.dateRange}
                railStyle={{ backgroundColor: '#666', height: '3px', borderRadius: '10px' }}
                trackStyle={{ backgroundColor: '#666', height: '3px', borderRadius: '10px' }}
                handleStyle={{ borderColor: '#595959', backgroundColor: 'white' }}
                dotStyle={{ borderColor: '#333', backgroundColor: 'white' }}
                onChange={this.handleDateRangeChange}
              />
            </div>
          </Col>
        </Row>
        <div style={{ width: '100%', height: '450px' }}>
          <div className="map-panel-mount-point">
            {this.renderSpinner()}
            <Row>
              <Col md="12" className="pr-0">
                <div className="map-title text-center">Active Records in Exposure Workflow</div>
                <CountyLevelMaps
                  id={1} // Some code requires a specific id (e.g. which div to mount the chart on)
                  style={{ borderRight: '1px solid #dcdcdc' }}
                  jurisdictionToShow={this.state.jurisdictionToShow}
                  jurisdictionData={this.state.exposureMapData}
                  mapObject={this.state.mapObject}
                  handleJurisdictionChange={this.handleJurisdictionChange}
                  decrementSpinnerCount={this.decrementSpinnerCount}
                  jurisdictionsNotInUse={JURISDICTIONS_NOT_IN_USE}
                  jurisdictionsPermittedToView={this.jurisdictionsPermittedToView}
                />
              </Col>
              <Col md="12" className="pl-0">
                <div className="map-title text-center">Active Records in Isolation Workflow</div>
                <CountyLevelMaps
                  id={2}
                  jurisdictionToShow={this.state.jurisdictionToShow}
                  jurisdictionData={this.state.isolationMapData}
                  mapObject={this.state.mapObject}
                  handleJurisdictionChange={this.handleJurisdictionChange}
                  decrementSpinnerCount={this.decrementSpinnerCount}
                  jurisdictionsNotInUse={JURISDICTIONS_NOT_IN_USE}
                  jurisdictionsPermittedToView={this.jurisdictionsPermittedToView}
                />
              </Col>
            </Row>
          </div>
          <Row className="mx-0 map-panel-controls">
            <Button
              variant="primary"
              size="md"
              className="mr-auto btn-square"
              disabled={this.state.jurisdictionToShow.category === 'territory'}
              title="View Insular Jurisdictions"
              onClick={() => this.handleJurisdictionChange('territory')}
              style={{ cursor: this.state.jurisdictionToShow.category === 'territory' ? 'not-allowed' : 'pointer' }}>
              View Insular Areas
              <i className="fas fa-search-location ml-2"> </i>
            </Button>
            {backButton}
          </Row>
        </div>
      </div>
    );
  }
}

GeographicSummary.propTypes = {
  stats: PropTypes.object,
  current_user: PropTypes.object,
};

export default GeographicSummary;
