import React from 'react';
import { shallow } from 'enzyme';
import { Button, Col, Collapse, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Patient from '../../components/patient/Patient';
import FollowUpFlagPanel from '../../components/patient/follow_up_flag/FollowUpFlagPanel';
import InfoTooltip from '../../components/util/InfoTooltip';
import BadgeHoH from '../../components/patient/icons/BadgeHoH';
import { Heading } from '../../utils/Heading';
import { mockUser1 } from '../mocks/mockUsers';
import { mockPatient1, mockPatient2, mockPatient3, mockPatient4, mockPatient5, blankIsolationMockPatient, blankExposureMockPatient } from '../mocks/mockPatients';
import { mockJurisdictionPaths } from '../mocks/mockJurisdiction';
import { nameFormatter, formatDate } from '../util.js';

const goToMock = jest.fn();
const identificationFields = ['DOB', 'Age', 'Language', 'Sara Alert ID', 'State/Local ID', 'CDC ID', 'NNDSS ID', 'Birth Sex', 'Gender Identity', 'Sexual Orientation', 'Race', 'Ethnicity', 'Nationality'];
const contactFields = ['Phone', 'Preferred Contact Time', 'Primary Telephone Type', 'Email', 'Preferred Reporting Method'];
const domesticAddressFields = ['Address 1', 'Address 2', 'Town/City', 'State', 'Zip', 'County'];
const foreignAddressFields = ['Address 1', 'Address 2', 'Address 3', 'Town/City', 'State', 'Zip', 'Country'];
const additionalTravelFields = ['Type', 'Place', 'Port of Departure', 'Start Date', 'End Date'];
const riskFactors = [
  { key: 'Close Contact with a Known Case', val: mockPatient2.contact_of_known_case_id },
  { key: 'Member of a Common Exposure Cohort', val: mockPatient2.member_of_a_common_exposure_cohort_type },
  { key: 'Travel from Affected Country or Area', val: null },
  { key: 'Was in Healthcare Facility with Known Cases', val: mockPatient2.was_in_health_care_facility_with_known_cases_facility_name },
  { key: 'Laboratory Personnel', val: mockPatient2.laboratory_personnel_facility_name },
  { key: 'Healthcare Personnel', val: mockPatient2.healthcare_personnel_facility_name },
  { key: 'Crew on Passenger or Cargo Flight', val: null },
];

describe('Patient', () => {
  it('Properly renders all main components when not in edit mode', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find('#monitoree-details-header').exists()).toBeTruthy();
    expect(wrapper.find('#monitoree-details-header').find(Heading).find('span').text()).toEqual(nameFormatter(mockPatient1));
    expect(wrapper.find('#monitoree-details-header').find(Heading).find(BadgeHoH).exists()).toBeTruthy();
    expect(wrapper.find(FollowUpFlagPanel).exists()).toBeFalsy();
    expect(wrapper.find('#set-follow-up-flag-link').exists()).toBeTruthy();
    expect(wrapper.find('.jurisdiction-user-box').exists()).toBeTruthy();
    expect(wrapper.find('#jurisdiction-path').text()).toEqual('Assigned Jurisdiction: USA, State 1, County 2');
    expect(wrapper.find('#assigned-user').text()).toEqual('Assigned User: ' + mockPatient1.assigned_user);
    expect(wrapper.find('#identification').exists()).toBeTruthy();
    expect(wrapper.find('#contact-information').exists()).toBeTruthy();
    expect(wrapper.find('.details-expander').exists()).toBeTruthy();
    expect(wrapper.find('#address').exists()).toBeTruthy();
    expect(wrapper.find('#arrival-information').exists()).toBeTruthy();
    expect(wrapper.find('#planned-travel').exists()).toBeTruthy();
    expect(wrapper.find('#potential-exposure-information').exists()).toBeTruthy();
    expect(wrapper.find('#exposure-notes').exists()).toBeTruthy();
    expect(wrapper.find('#case-information').exists()).toBeTruthy();
  });

  it('Properly renders all main components when in edit mode', () => {
    const wrapper = shallow(<Patient details={mockPatient4} goto={goToMock} collapse={true} edit_mode={true} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find('#monitoree-details-header').exists()).toBeTruthy();
    expect(wrapper.find('#monitoree-details-header').find(Heading).find('span').text()).toEqual(nameFormatter(mockPatient4));
    expect(wrapper.find('#monitoree-details-header').find(Heading).find(BadgeHoH).exists()).toBeFalsy();
    expect(wrapper.find(FollowUpFlagPanel).exists()).toBeFalsy();
    expect(wrapper.find('#set-follow-up-flag-link').exists()).toBeFalsy();
    expect(wrapper.find('.jurisdiction-user-box').exists()).toBeTruthy();
    expect(wrapper.find('#jurisdiction-path').text()).toEqual('Assigned Jurisdiction: USA, State 1, County 2');
    expect(wrapper.find('#assigned-user').text()).toEqual('Assigned User: ' + mockPatient4.assigned_user);
    expect(wrapper.find('#identification').exists()).toBeTruthy();
    expect(wrapper.find('#contact-information').exists()).toBeTruthy();
    expect(wrapper.find('.details-expander').exists()).toBeFalsy();
    expect(wrapper.find('#address').exists()).toBeTruthy();
    expect(wrapper.find('#arrival-information').exists()).toBeTruthy();
    expect(wrapper.find('#planned-travel').exists()).toBeTruthy();
    expect(wrapper.find('#potential-exposure-information').exists()).toBeTruthy();
    expect(wrapper.find('#exposure-notes').exists()).toBeTruthy();
    expect(wrapper.find('#case-information').exists()).toBeTruthy();
  });

  it('Properly renders identification section', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#identification');
    expect(section.find(Heading).children().text()).toEqual('Identification');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient1.id + '/edit?step=0&nav=global');
    expect(section.find('.text-danger').exists()).toBeFalsy();
    identificationFields.forEach((field, index) => {
      expect(section.find('b').at(index).text()).toEqual(field + ':');
    });
  });

  it('Properly renders identification section when patient is a minor', () => {
    const wrapper = shallow(<Patient details={mockPatient5} hoh={mockPatient1} collapse={true} edit_mode={false} jurisdiction_paths={mockJurisdictionPaths} headingLevel={2} />);
    const section = wrapper.find('#identification');
    expect(section.find(Heading).children().text()).toEqual('Identification');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    identificationFields.forEach((field, index) => {
      expect(section.find('b').at(index).text()).toEqual(field + ':');
    });
    expect(section.find('.text-danger').exists()).toBeTruthy();
    expect(section.find('.text-danger').text()).toEqual(' (Minor)');
  });

  it('Properly renders contact information section', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#contact-information');
    expect(section.find(Heading).children().text()).toEqual('Contact Information');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient1.id + '/edit?step=2&nav=global');
    expect(wrapper.find('#contact-information').find('.text-danger').exists()).toBeFalsy();
    contactFields.forEach((field, index) => {
      expect(section.find('b').at(index).text()).toEqual(field + ':');
    });
  });

  it('Properly renders contact information section if SMS is blocked', () => {
    const wrapper = shallow(<Patient details={{ ...mockPatient2, blocked_sms: true }} collapse={true} edit_mode={false} jurisdiction_paths={mockJurisdictionPaths} headingLevel={2} />);
    const section = wrapper.find('#contact-information');
    const phone = section.find('.item-group').find('div').at(1);
    const preferredContactMethod = section.find('.item-group').find('div').at(5);
    expect(phone.find('b').text()).toEqual('Phone:');
    expect(phone.find('span').at(0).text()).toEqual(mockPatient2.primary_telephone);
    expect(phone.find('span').at(1).text().includes('SMS Blocked')).toBeTruthy();
    expect(phone.find(InfoTooltip).exists()).toBeTruthy();
    expect(phone.find(InfoTooltip).prop('tooltipTextKey')).toEqual('blockedSMS');
    expect(preferredContactMethod.find('b').text()).toEqual('Preferred Reporting Method:');
    expect(preferredContactMethod.find('span').text().includes('SMS Texted Weblink')).toBeTruthy();
    expect(preferredContactMethod.find(InfoTooltip).exists()).toBeTruthy();
    expect(preferredContactMethod.find(InfoTooltip).prop('tooltipTextKey')).toEqual('blockedSMSContactMethod');
  });

  it('Properly renders contact information section when patient is a minor', () => {
    const wrapper = shallow(<Patient details={mockPatient5} hoh={mockPatient1} collapse={true} edit_mode={false} jurisdiction_paths={mockJurisdictionPaths} headingLevel={2} />);
    const section = wrapper.find('#contact-information');
    expect(wrapper.find('#contact-information').find('.text-danger').exists()).toBeTruthy();
    expect(wrapper.find('#contact-information').find('.text-danger').text()).toEqual('Monitoree is a minor');
    expect(section.find('.item-group').find('a').exists()).toBeTruthy();
    expect(section.find('.item-group').children().at(1).text()).toEqual(`View contact info for Head of Household:${mockPatient1.first_name} ${mockPatient1.middle_name} ${mockPatient1.last_name}`);
    expect(section.find('.item-group').find('a').props().href).toContain('patients/' + mockPatient1.id);
    expect(section.find('.item-group').find('a').text()).toEqual(mockPatient1.first_name + ' ' + mockPatient1.middle_name + ' ' + mockPatient1.last_name);
  });

  it('Properly renders show/hide divider when props.collapse is true', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find('.details-expander').exists()).toBeTruthy();
    expect(wrapper.find('#details-expander-link').exists()).toBeTruthy();
    expect(wrapper.find('.details-expander').find(FontAwesomeIcon).exists()).toBeTruthy();
    expect(wrapper.find('.details-expander').find(FontAwesomeIcon).hasClass('chevron-closed')).toBeTruthy();
    expect(wrapper.find('#details-expander-link').find('span').text()).toEqual('Show address, travel, exposure, and case information');
    expect(wrapper.find('.details-expander').find('span').at(1).hasClass('dashed-line')).toBeTruthy();
  });

  it('Properly renders show/hide divider when props.collapse is false', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={false} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find('.details-expander').exists()).toBeTruthy();
    expect(wrapper.find('#details-expander-link').exists()).toBeTruthy();
    expect(wrapper.find('.details-expander').find(FontAwesomeIcon).exists()).toBeTruthy();
    expect(wrapper.find('.details-expander').find(FontAwesomeIcon).hasClass('chevron-opened')).toBeTruthy();
    expect(wrapper.find('#details-expander-link').find('span').text()).toEqual('Hide address, travel, exposure, and case information');
    expect(wrapper.find('.details-expander').find('span').at(1).hasClass('dashed-line')).toBeTruthy();
  });

  it('Clicking show/hide divider updates label and expands or collapses details', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find(Collapse).prop('in')).toBeFalsy();
    expect(wrapper.state('expanded')).toBeFalsy();
    wrapper.find('#details-expander-link').simulate('click');
    expect(wrapper.find(Collapse).prop('in')).toBeTruthy();
    expect(wrapper.state('expanded')).toBeTruthy();
    wrapper.find('#details-expander-link').simulate('click');
    expect(wrapper.find(Collapse).prop('in')).toBeFalsy();
    expect(wrapper.state('expanded')).toBeFalsy();
  });

  it('Properly renders address section for domestic address with no monitoring address', () => {
    const wrapper = shallow(<Patient details={mockPatient2} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#address');
    expect(section.find(Heading).children().text()).toEqual('Address');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient2.id + '/edit?step=1&nav=global');
    expect(section.find(Row).find(Col).length).toEqual(1);
    const domesticAddressColumn = section.find(Row).find(Col);
    expect(domesticAddressColumn.prop('sm')).toEqual(24);
    expect(domesticAddressColumn.find('p').text()).toEqual('Home Address (USA)');
    domesticAddressFields.forEach((field, index) => {
      expect(domesticAddressColumn.find('b').at(index).text()).toEqual(field + ':');
    });
  });

  it('Properly renders address section for domestic address and monitoring address', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#address');
    expect(section.find(Heading).children().text()).toEqual('Address');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient1.id + '/edit?step=1&nav=global');
    expect(section.find(Row).find(Col).length).toEqual(2);
    const domesticAddressColumn = section.find(Row).find(Col).at(0);
    const monitoringAddressColumn = section.find(Row).find(Col).at(1);
    expect(domesticAddressColumn.prop('sm')).toEqual(12);
    expect(domesticAddressColumn.find('p').text()).toEqual('Home Address (USA)');
    domesticAddressFields.forEach((field, index) => {
      expect(domesticAddressColumn.find('b').at(index).text()).toEqual(field + ':');
    });
    expect(monitoringAddressColumn.prop('sm')).toEqual(12);
    expect(monitoringAddressColumn.find('p').text()).toEqual('Monitoring Address');
    domesticAddressFields.forEach((field, index) => {
      expect(monitoringAddressColumn.find('b').at(index).text()).toEqual(field + ':');
    });
  });

  it('Properly renders address section for foreign address with no monitoring address', () => {
    const wrapper = shallow(<Patient details={mockPatient5} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#address');
    expect(section.find(Heading).children().text()).toEqual('Address');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient5.id + '/edit?step=1&nav=global');
    expect(section.find(Row).find(Col).length).toEqual(1);
    const foreignAddressColumn = section.find(Row).find(Col);
    expect(foreignAddressColumn.prop('sm')).toEqual(24);
    expect(foreignAddressColumn.find('p').text()).toEqual('Home Address (Foreign)');
    foreignAddressFields.forEach((field, index) => {
      expect(foreignAddressColumn.find('b').at(index).text()).toEqual(field + ':');
    });
  });

  it('Properly renders address section for foreign address and monitoring address', () => {
    const wrapper = shallow(<Patient details={mockPatient4} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#address');
    expect(section.find(Heading).children().text()).toEqual('Address');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient4.id + '/edit?step=1&nav=global');
    expect(section.find(Row).find(Col).length).toEqual(2);
    const foreignAddressColumn = section.find(Row).find(Col).at(0);
    const monitoringAddressColumn = section.find(Row).find(Col).at(1);
    expect(foreignAddressColumn.prop('sm')).toEqual(12);
    expect(foreignAddressColumn.find('p').text()).toEqual('Home Address (Foreign)');
    foreignAddressFields.forEach((field, index) => {
      expect(foreignAddressColumn.find('b').at(index).text()).toEqual(field + ':');
    });
    expect(monitoringAddressColumn.prop('sm')).toEqual(12);
    expect(monitoringAddressColumn.find('p').text()).toEqual('Monitoring Address');
    domesticAddressFields.forEach((field, index) => {
      expect(monitoringAddressColumn.find('b').at(index).text()).toEqual(field + ':');
    });
  });

  it('Properly renders arrival information section', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#arrival-information');
    expect(section.find(Heading).children().text()).toEqual('Arrival Information');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient1.id + '/edit?step=3&nav=global');
    expect(section.find('.none-text').exists()).toBeFalsy();
    const departedColumn = section.find(Row).find(Col).at(0);
    const arrivalColumn = section.find(Row).find(Col).at(1);
    const transportationColumn = section.find(Row).find(Col).at(2);
    expect(departedColumn.find('p').text()).toEqual('Departed');
    expect(departedColumn.find('b').at(0).text()).toEqual('Port of Origin:');
    expect(departedColumn.find('span').at(0).text()).toEqual(mockPatient1.port_of_origin);
    expect(departedColumn.find('b').at(1).text()).toEqual('Date of Departure:');
    expect(departedColumn.find('span').at(1).text()).toEqual(formatDate(mockPatient1.date_of_departure));
    expect(arrivalColumn.find('p').text()).toEqual('Arrival');
    expect(arrivalColumn.find('b').at(0).text()).toEqual('Port of Entry:');
    expect(arrivalColumn.find('span').at(0).text()).toEqual(mockPatient1.port_of_entry_into_usa);
    expect(arrivalColumn.find('b').at(1).text()).toEqual('Date of Arrival:');
    expect(arrivalColumn.find('span').at(1).text()).toEqual(formatDate(mockPatient1.date_of_arrival));
    expect(transportationColumn.find('b').at(0).text()).toEqual('Carrier:');
    expect(transportationColumn.find('span').at(0).text()).toEqual(mockPatient1.flight_or_vessel_carrier);
    expect(transportationColumn.find('b').at(1).text()).toEqual('Flight or Vessel #:');
    expect(transportationColumn.find('span').at(1).text()).toEqual(mockPatient1.flight_or_vessel_number);
    expect(section.find('.notes-section').exists()).toBeTruthy();
    expect(wrapper.find('.notes-section').find(Button).exists()).toBeFalsy();
    expect(section.find('.notes-section').find('p').text()).toEqual('Notes');
    expect(section.find('.notes-text').text()).toEqual(mockPatient1.travel_related_notes);
  });

  it('Collapses/expands travel related notes if longer than 400 characters', () => {
    const wrapper = shallow(<Patient details={mockPatient3} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find('#arrival-information').find('.notes-section').find(Button).exists()).toBeTruthy();
    expect(wrapper.state('expandArrivalNotes')).toBeFalsy();
    expect(wrapper.find('#arrival-information').find('.notes-section').find(Button).text()).toEqual('(View all)');
    expect(wrapper.find('#arrival-information').find('.notes-section').find('.notes-text').find('div').text()).toEqual(mockPatient3.travel_related_notes.slice(0, 400) + ' ...');
    wrapper.find('#arrival-information').find('.notes-section').find(Button).simulate('click');
    expect(wrapper.state('expandArrivalNotes')).toBeTruthy();
    expect(wrapper.find('#arrival-information').find('.notes-section').find(Button).text()).toEqual('(Collapse)');
    expect(wrapper.find('#arrival-information').find('.notes-section').find('.notes-text').find('div').text()).toEqual(mockPatient3.travel_related_notes);
    wrapper.find('#arrival-information').find('.notes-section').find(Button).simulate('click');
    expect(wrapper.state('expandArrivalNotes')).toBeFalsy();
    expect(wrapper.find('#arrival-information').find('.notes-section').find(Button).text()).toEqual('(View all)');
    expect(wrapper.find('#arrival-information').find('.notes-section').find('.notes-text').find('div').text()).toEqual(mockPatient3.travel_related_notes.slice(0, 400) + ' ...');
  });

  it('Displays "None" if arrival information has no information', () => {
    const wrapper = shallow(<Patient details={blankIsolationMockPatient} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#arrival-information');
    expect(section.exists()).toBeTruthy();
    expect(section.find('.none-text').exists()).toBeTruthy();
    expect(section.find('.none-text').text()).toEqual('None');
  });

  it('Properly renders planned travel section', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#planned-travel');
    expect(section.find(Heading).children().find('span').text()).toEqual('Additional ');
    expect(section.find(Heading).children().at(1).text()).toEqual('Planned Travel');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient1.id + '/edit?step=4&nav=global');
    expect(section.find('.none-text').exists()).toBeFalsy();
    additionalTravelFields.forEach((field, index) => {
      expect(section.find('b').at(index).text()).toEqual(field + ':');
    });
    expect(section.find('.notes-section').exists()).toBeTruthy();
    expect(wrapper.find('.notes-section').find(Button).exists()).toBeFalsy();
    expect(section.find('.notes-section').find('p').text()).toEqual('Notes');
    expect(section.find('.notes-text').text()).toEqual(mockPatient1.additional_planned_travel_related_notes);
  });

  it('Collapses/expands additional planned travel notes if longer than 400 characters', () => {
    const wrapper = shallow(<Patient details={mockPatient3} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find('#planned-travel').find('.notes-section').find(Button).exists()).toBeTruthy();
    expect(wrapper.state('expandPlannedTravelNotes')).toBeFalsy();
    expect(wrapper.find('#planned-travel').find('.notes-section').find(Button).text()).toEqual('(View all)');
    expect(wrapper.find('#planned-travel').find('.notes-section').find('.notes-text').find('div').text()).toEqual(mockPatient3.additional_planned_travel_related_notes.slice(0, 400) + ' ...');
    wrapper.find('#planned-travel').find('.notes-section').find(Button).simulate('click');
    expect(wrapper.state('expandPlannedTravelNotes')).toBeTruthy();
    expect(wrapper.find('#planned-travel').find('.notes-section').find(Button).text()).toEqual('(Collapse)');
    expect(wrapper.find('#planned-travel').find('.notes-section').find('.notes-text').find('div').text()).toEqual(mockPatient3.additional_planned_travel_related_notes);
    wrapper.find('#planned-travel').find('.notes-section').find(Button).simulate('click');
    expect(wrapper.state('expandPlannedTravelNotes')).toBeFalsy();
    expect(wrapper.find('#planned-travel').find('.notes-section').find(Button).text()).toEqual('(View all)');
    expect(wrapper.find('#planned-travel').find('.notes-section').find('.notes-text').find('div').text()).toEqual(mockPatient3.additional_planned_travel_related_notes.slice(0, 400) + ' ...');
  });

  it('Displays "None" if planned travel has no information', () => {
    const wrapper = shallow(<Patient details={blankIsolationMockPatient} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#planned-travel');
    expect(section.exists()).toBeTruthy();
    expect(section.find('.none-text').exists()).toBeTruthy();
    expect(section.find('.none-text').text()).toEqual('None');
  });

  it('Properly renders potential exposure information section', () => {
    const wrapper = shallow(<Patient details={mockPatient2} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#potential-exposure-information');
    expect(section.find(Heading).children().at(0).text()).toEqual('Potential Exposure');
    expect(section.find(Heading).children().find('span').text()).toEqual(' Information');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient2.id + '/edit?step=5&nav=global');
    expect(section.find('.item-group').exists()).toBeTruthy();
    expect(section.find('.item-group').find('b').at(0).text()).toEqual('Last Date of Exposure:');
    expect(section.find('.item-group').find('span').at(0).text()).toEqual(formatDate(mockPatient2.last_date_of_exposure));
    expect(section.find('.item-group').find('b').at(1).text()).toEqual('Exposure Location:');
    expect(section.find('.item-group').find('span').at(1).text()).toEqual(mockPatient2.potential_exposure_location);
    expect(section.find('.item-group').find('b').at(2).text()).toEqual('Exposure Country:');
    expect(section.find('.item-group').find('span').at(2).text()).toEqual(mockPatient2.potential_exposure_country);
    expect(section.find('.risk-factors').exists()).toBeTruthy();
    riskFactors.forEach((field, index) => {
      expect(section.find('li').at(index).find('.risk-factor').text()).toEqual(field.key);
      if (field.val) {
        expect(section.find('li').at(index).find('.risk-val').text()).toEqual(field.val);
      } else {
        expect(section.find('li').at(index).find('.risk-val').exists()).toBeFalsy();
      }
    });
  });

  it('Displays "None specified" if there are no risk factors', () => {
    const wrapper = shallow(<Patient details={blankExposureMockPatient} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#potential-exposure-information');
    expect(section.exists()).toBeTruthy();
    expect(section.find('.item-group').exists()).toBeTruthy();
    expect(section.find('.risk-factors').exists()).toBeFalsy();
    expect(section.find('.none-text').exists()).toBeTruthy();
    expect(section.find('.none-text').text()).toEqual('None specified');
  });

  it('Properly renders case information section', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#case-information');
    expect(section.find(Heading).children().text()).toEqual('Case Information');
    expect(section.find('.edit-link').exists()).toBeTruthy();
    expect(section.find('a').prop('href')).toEqual(window.BASE_PATH + '/patients/' + mockPatient1.id + '/edit?step=6&nav=global');
    expect(section.find('b').at(0).text()).toEqual('Case Status: ');
    expect(section.find('span').at(0).text()).toEqual(mockPatient1.case_status);
    expect(section.find('b').at(1).text()).toEqual('First Positive Lab Collected: ');
    expect(section.find('span').at(1).text()).toEqual(formatDate(mockPatient1.first_positive_lab_at));
    expect(section.find('b').at(2).text()).toEqual('Symptom Onset: ');
    expect(section.find('span').at(2).text()).toEqual(formatDate(mockPatient1.symptom_onset));
  });

  it('Hides case information section when monitoree is in the exposure workflow', () => {
    const wrapper = shallow(<Patient details={mockPatient2} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find('#case-information').exists()).toBeFalsy();
  });

  it('Properly renders notes section', () => {
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#exposure-notes');
    expect(section.find(Heading).children().text()).toEqual('Notes');
    expect(section.find('.none-text').exists()).toBeFalsy();
    expect(section.find('.notes-text').exists()).toBeTruthy();
    expect(section.find('.notes-text').text()).toEqual(mockPatient1.exposure_notes);
    expect(section.find(Button).exists()).toBeFalsy();
  });

  it('Collapses/expands exposure notes if longer than 400 characters', () => {
    const wrapper = shallow(<Patient details={mockPatient3} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find('#exposure-notes').find(Button).exists()).toBeTruthy();
    expect(wrapper.find('#exposure-notes').find(Button).text()).toEqual('(View all)');
    expect(wrapper.find('#exposure-notes').find('.notes-text').text()).toEqual(mockPatient3.exposure_notes.slice(0, 400) + ' ...');
    wrapper.find('#exposure-notes').find(Button).simulate('click');
    expect(wrapper.find('#exposure-notes').find(Button).text()).toEqual('(Collapse)');
    expect(wrapper.find('#exposure-notes').find('.notes-text').text()).toEqual(mockPatient3.exposure_notes);
    wrapper.find('#exposure-notes').find(Button).simulate('click');
    expect(wrapper.find('#exposure-notes').find(Button).text()).toEqual('(View all)');
    expect(wrapper.find('#exposure-notes').find('.notes-text').text()).toEqual(mockPatient3.exposure_notes.slice(0, 400) + ' ...');
  });

  it('Displays "None" if exposure notes is null', () => {
    const wrapper = shallow(<Patient details={mockPatient4} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    const section = wrapper.find('#exposure-notes');
    expect(section.exists()).toBeTruthy();
    expect(section.find('.none-text').exists()).toBeTruthy();
    expect(section.find('.none-text').text()).toEqual('None');
    expect(section.find('.notes-text').exists()).toBeFalsy();
    expect(section.find(Button).exists()).toBeFalsy();
  });

  it('Properly renders no details message', () => {
    const blankWrapper = shallow(<Patient details={null} workflow="global" headingLevel={2} />);
    expect(blankWrapper.text()).toEqual('No monitoree details to show.');
  });

  it('Renders edit buttons if props.goto is defined in exposure', () => {
    const wrapper = shallow(<Patient details={mockPatient2} goto={goToMock} collapse={true} edit_mode={true} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="exposure" headingLevel={2} />);
    expect(wrapper.find('.edit-link').find(Button).length).toEqual(7);
    expect(wrapper.find('.edit-link').find('a').exists()).toBeFalsy();
    wrapper
      .find('.edit-link')
      .find(Button)
      .forEach(btn => {
        expect(btn.text()).toEqual('Edit');
      });
  });

  it('Renders edit buttons if props.goto is defined in isolation', () => {
    const wrapper = shallow(<Patient details={mockPatient1} goto={goToMock} collapse={true} edit_mode={true} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="isolation" headingLevel={2} />);
    expect(wrapper.find('.edit-link').find(Button).length).toEqual(8);
    expect(wrapper.find('.edit-link').find('a').exists()).toBeFalsy();
    wrapper
      .find('.edit-link')
      .find(Button)
      .forEach(btn => {
        expect(btn.text()).toEqual('Edit');
      });
  });

  it('Renders edit hrefs if props.goto is not defined in exposure', () => {
    const stepIds = [0, 2, 1, 3, 4, 5, 5];
    const wrapper = shallow(<Patient details={mockPatient2} collapse={true} edit_mode={true} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="exposure" headingLevel={2} />);
    expect(wrapper.find('.edit-link').find(Button).exists()).toBeFalsy();
    expect(wrapper.find('.edit-link').find('a').length).toEqual(7);
    wrapper
      .find('.edit-link')
      .find('a')
      .forEach((link, index) => {
        expect(link.text()).toEqual('Edit');
        expect(link.prop('href')).toEqual(`${window.BASE_PATH}/patients/${mockPatient2.id}/edit?step=${stepIds[Number(index)]}&nav=exposure`);
      });
  });

  it('Renders edit hrefs if props.goto is not defined in isolation', () => {
    const stepIds = [0, 2, 1, 3, 4, 5, 6, 6];
    const wrapper = shallow(<Patient details={mockPatient1} collapse={true} edit_mode={true} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="isolation" headingLevel={2} />);
    expect(wrapper.find('.edit-link').find(Button).exists()).toBeFalsy();
    expect(wrapper.find('.edit-link').find('a').length).toEqual(8);
    wrapper
      .find('.edit-link')
      .find('a')
      .forEach((link, index) => {
        expect(link.text()).toEqual('Edit');
        expect(link.prop('href')).toEqual(`${window.BASE_PATH}/patients/${mockPatient1.id}/edit?step=${stepIds[Number(index)]}&nav=isolation`);
      });
  });

  it('Calls props goto method when the edit buttons are clicked', () => {
    const wrapper = shallow(<Patient details={mockPatient1} goto={goToMock} collapse={true} edit_mode={true} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(goToMock).toHaveBeenCalledTimes(0);
    wrapper
      .find('.edit-link')
      .find(Button)
      .forEach((btn, index) => {
        btn.simulate('click');
        expect(goToMock).toHaveBeenCalledTimes(index + 1);
      });
  });

  it('Displays the Follow up Flag panel when a monitoree has a follow up flag set', () => {
    const wrapper = shallow(<Patient details={mockPatient3} goto={goToMock} collapse={true} edit_mode={false} current_user={mockUser1} jurisdiction_paths={mockJurisdictionPaths} other_household_members={[]} can_modify_subject_status={true} workflow="global" headingLevel={2} />);
    expect(wrapper.find(FollowUpFlagPanel).exists()).toBeTruthy();
    expect(wrapper.find('#set-follow-up-flag-link').exists()).toBeFalsy();
  });
});
