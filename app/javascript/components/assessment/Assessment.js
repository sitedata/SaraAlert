import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import _ from 'lodash';
import { pickBy, identity } from 'lodash';
import { Carousel } from 'react-bootstrap';
import GeneralAssessment from './steps/GeneralAssessment';
import SymptomsAssessment from './steps/SymptomsAssessment';
import AssessmentCompleted from './steps/AssessmentCompleted';

class Assessment extends React.Component {
  constructor(props) {
    super(props);
    this.state = { index: 0, direction: null, assessmentState: pickBy(this.props.assessment, identity) };
    this.setAssessmentState = this.setAssessmentState.bind(this);
    this.next = this.next.bind(this);
    this.previous = this.previous.bind(this);
    this.goto = this.goto.bind(this);
    this.submit = this.submit.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.hasChanges = this.hasChanges.bind(this);
    this.fieldIsEmptyOrNew = this.fieldIsEmptyOrNew.bind(this);
  }

  setAssessmentState(assessmentState) {
    let currentAssessmentState = this.state.assessmentState;
    this.setState({ assessmentState: { ...currentAssessmentState, ...assessmentState } });
  }

  next() {
    let index = this.state.index;
    let lastIndex = this.state.lastIndex;
    if (lastIndex) {
      this.setState({ direction: 'next' }, () => {
        this.setState({ index: lastIndex, lastIndex: null });
      });
    } else {
      this.setState({ direction: 'next' }, () => {
        this.setState({ index: index + 1, lastIndex: null });
      });
    }
  }

  previous() {
    let index = this.state.index;
    this.setState({ direction: 'prev' }, () => {
      this.setState({ index: index - 1, lastIndex: null });
    });
  }

  goto(targetIndex) {
    let index = this.state.index;
    if (targetIndex > index) {
      this.setState({ direction: 'next' }, () => {
        this.setState({ index: targetIndex, lastIndex: index });
      });
    } else if (targetIndex < index) {
      this.setState({ direction: 'prev' }, () => {
        this.setState({ index: targetIndex, lastIndex: index });
      });
    }
  }

  hasChanges() {
    let currentAssessment = _.cloneDeep(this.props.assessment);
    let symptoms = ['cough', 'difficulty_breathing', 'symptomatic'];
    // Having falsey values on them causes the comparison to fail.
    symptoms.forEach(symptom => {
      if (currentAssessment[symptom] === false) {
        delete currentAssessment[symptom];
      }
    });
    return !_.isEqual(this.state.assessmentState, currentAssessment);
  }

  fieldIsEmptyOrNew(object) {
    const keysToIgnore = ['who_reported'];
    let allFieldsEmpty = true;
    _.map(object, (value, key) => {
      if (object[key] !== null && !keysToIgnore.includes(key)) {
        allFieldsEmpty = false;
      }
    });
    if (allFieldsEmpty || _.isEmpty(this.props.assessment)) {
      return true;
    } else {
      return false;
    }
  }

  submit() {
    var assessmentState = this.state.assessmentState;
    var self = this;
    axios.defaults.headers.common['X-CSRF-Token'] = this.props.authenticity_token;
    axios({
      method: 'post',
      url: `/patients/${this.props.patient_submission_token}/assessments${this.props.updateId ? '/' + this.props.updateId : ''}`,
      data: assessmentState,
    })
      .then(function() {
        if (self.props.reload) {
          location.href = '/patients/' + self.props.patient_id;
        }
      })
      .catch(function(response) {
        //handle error
        console.log(response);
      });
    if (!this.props.reload) {
      // No need to say thanks for reporting if we want to reload the page
      this.goto(2);
    }
  }

  handleSubmit() {
    if (this.fieldIsEmptyOrNew(this.props.assessment)) {
      this.submit();
    } else {
      if (this.hasChanges()) {
        if (confirm("Are you sure you'd like to modify this report?")) {
          this.submit();
        }
      } else {
        this.submit();
      }
    }
  }

  render() {
    return (
      <React.Fragment>
        <Carousel
          controls={false}
          indicators={false}
          interval={null}
          keyboard={false}
          activeIndex={this.state.index}
          direction={this.state.direction}
          onSelect={() => {}}>
          <Carousel.Item>
            <GeneralAssessment
              goto={this.goto}
              submit={this.handleSubmit}
              setAssessmentState={this.setAssessmentState}
              currentState={this.state.assessmentState}
              idPre={this.props.idPre}
            />
          </Carousel.Item>
          <Carousel.Item>
            <SymptomsAssessment
              goto={this.goto}
              submit={this.handleSubmit}
              setAssessmentState={this.setAssessmentState}
              currentState={this.state.assessmentState}
              idPre={this.props.idPre}
            />
          </Carousel.Item>
          <Carousel.Item>
            <AssessmentCompleted
              goto={this.goto}
              submit={this.handleSubmit}
              setAssessmentState={this.setAssessmentState}
              currentState={this.state.assessmentState}
            />
          </Carousel.Item>
        </Carousel>
      </React.Fragment>
    );
  }
}

Assessment.propTypes = {
  patient: PropTypes.object,
  authenticity_token: PropTypes.string,
  patient_submission_token: PropTypes.string,
  assessment: PropTypes.object,
  updateId: PropTypes.number,
  reload: PropTypes.bool,
  idPre: PropTypes.string,
};

export default Assessment;
