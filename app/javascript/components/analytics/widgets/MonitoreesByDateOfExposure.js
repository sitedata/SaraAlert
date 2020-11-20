import React from 'react';
import { PropTypes } from 'prop-types';
import { Card, Form, Col, Row } from 'react-bootstrap';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import _ from 'lodash';

const WORKFLOWS = ['Exposure', 'Isolation'];
let DATES_OF_INTEREST = []; // If certain dates are desired, they can be specified here

class MonitoreesByDateOfExposure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      graphData: {},
      lastExposureDateDate: [],
    };
  }

  componentDidMount() {
    this.setTimeResolution('Day');
  }

  parseOutFields = (masterList, categoryTypeName) =>
    masterList
      .map(ml =>
        WORKFLOWS.map(
          wf => this.props.stats.monitoree_counts.find(x => x.status === wf && x.category_type === categoryTypeName && x.category === ml)?.total || 0
        )
      )
      .map(x => x.concat(_.sum(x)));

  // This instance of mapToChartFormat is slightly different from its neighbor components due to this unique use case
  mapToChartFormat = (masterList, values, workflow) =>
    masterList.map((ml, index0) => {
      let retVal = {};
      retVal['name'] = ml;
      retVal[`${workflow}`] = values[Number(index0)][WORKFLOWS.findIndex(x => x === workflow)];
      return retVal;
    });

  setTimeResolution(timeRes) {
    let dateRangeInQuestion;
    if (timeRes === 'Day') {
      dateRangeInQuestion = 'Last Exposure Date';
    } else if (timeRes === 'Week') {
      dateRangeInQuestion = 'Last Exposure Week';
    } else if (timeRes === 'Month') {
      dateRangeInQuestion = 'Last Exposure Month';
    }
    DATES_OF_INTEREST = _.uniq(this.props.stats.monitoree_counts.filter(x => x.category_type === dateRangeInQuestion).map(x => x.category))
      .sort()
      .slice(0, 14);
    this.setState({
      graphData: WORKFLOWS.map(workflow => this.mapToChartFormat(DATES_OF_INTEREST, this.parseOutFields(DATES_OF_INTEREST, dateRangeInQuestion), workflow)),
      lastDateInQuestion: _.last(DATES_OF_INTEREST),
    });
  }

  render() {
    return (
      <React.Fragment>
        <Card className="card-square text-center mt-4">
          <div className="analytics-card-header font-weight-bold h5"> Monitorees by Date of Last Exposure ​</div>
          <Card.Body className="mt-4">
            <Form.Row className="justify-content-md-center">
              <Form.Group as={Col} md="8" onChange={val => this.setTimeResolution(val.target.value)}>
                <Form.Label>Time Resolution</Form.Label>
                <Form.Control as="select" size="md">
                  <option>Day</option>
                  <option>Week</option>
                  <option>Month</option>
                </Form.Control>
              </Form.Group>
            </Form.Row>
            <Row className="mx-2 mt-2 px-0">
              <Col xs="12">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    width={500}
                    height={300}
                    data={this.state.graphData[0]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Exposure" stackId="a" fill="#557385" />
                  </BarChart>
                </ResponsiveContainer>
              </Col>
              <Col xs="12">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    width={500}
                    height={300}
                    data={this.state.graphData[1]}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Isolation" stackId="a" fill="#cbcfd2" />
                  </BarChart>
                </ResponsiveContainer>
              </Col>
            </Row>
            <div className="text-secondary text-right">
              <i className="fas fa-exclamation-circle mr-1"></i>
              Illnesses that began {this.state.lastDateInQuestion} may not yet be reported
            </div>
          </Card.Body>
        </Card>
      </React.Fragment>
    );
  }
}

MonitoreesByDateOfExposure.propTypes = {
  stats: PropTypes.object,
};

export default MonitoreesByDateOfExposure;
