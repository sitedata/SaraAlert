# frozen_string_literal: true

# Helper methods for the import controller
module ImportExportHelper # rubocop:todo Metrics/ModuleLength
  LINELIST_HEADERS = ['Monitoree', 'Jurisdiction', 'Assigned User', 'State/Local ID', 'Sex', 'Date of Birth', 'End of Monitoring', 'Risk Level',
                      'Monitoring Plan', 'Latest Report', 'Transferred At', 'Reason For Closure', 'Latest Public Health Action', 'Status', 'Closed At',
                      'Transferred From', 'Transferred To', 'Expected Purge Date'].freeze

  COMPREHENSIVE_HEADERS = ['First Name', 'Middle Name', 'Last Name', 'Date of Birth', 'Sex at Birth', 'White', 'Black or African American',
                           'American Indian or Alaska Native', 'Asian', 'Native Hawaiian or Other Pacific Islander', 'Ethnicity', 'Primary Language',
                           'Secondary Language', 'Interpretation Required?', 'Nationality', 'Identifier (STATE/LOCAL)', 'Identifier (CDC)',
                           'Identifier (NNDSS)', 'Address Line 1', 'Address City', 'Address State', 'Address Line 2', 'Address Zip', 'Address County',
                           'Foreign Address Line 1', 'Foreign Address City', 'Foreign Address Country', 'Foreign Address Line 2', 'Foreign Address Zip',
                           'Foreign Address Line 3', 'Foreign Address State', 'Monitored Address Line 1', 'Monitored Address City', 'Monitored Address State',
                           'Monitored Address Line 2', 'Monitored Address Zip', 'Monitored Address County', 'Foreign Monitored Address Line 1',
                           'Foreign Monitored Address City', 'Foreign Monitored Address State', 'Foreign Monitored Address Line 2',
                           'Foreign Monitored Address Zip', 'Foreign Monitored Address County', 'Preferred Contact Method', 'Primary Telephone',
                           'Primary Telephone Type', 'Secondary Telephone', 'Secondary Telephone Type', 'Preferred Contact Time', 'Email', 'Port of Origin',
                           'Date of Departure', 'Source of Report', 'Flight or Vessel Number', 'Flight or Vessel Carrier', 'Port of Entry Into USA',
                           'Date of Arrival', 'Travel Related Notes', 'Additional Planned Travel Type', 'Additional Planned Travel Destination',
                           'Additional Planned Travel Destination State', 'Additional Planned Travel Destination Country',
                           'Additional Planned Travel Port of Departure', 'Additional Planned Travel Start Date', 'Additional Planned Travel End Date',
                           'Additional Planned Travel Related Notes', 'Last Date of Exposure', 'Potential Exposure Location', 'Potential Exposure Country',
                           'Contact of Known Case?', 'Contact of Known Case ID', 'Travel from Affected Country or Area?',
                           'Was in Health Care Facility With Known Cases?', 'Health Care Facility with Known Cases Name', 'Laboratory Personnel?',
                           'Laboratory Personnel Facility Name', 'Health Care Personnel?', 'Health Care Personnel Facility Name',
                           'Crew on Passenger or Cargo Flight?', 'Member of a Common Exposure Cohort?', 'Common Exposure Cohort Name',
                           'Exposure Risk Assessment', 'Monitoring Plan', 'Exposure Notes', 'Status', 'Symptom Onset Date', 'Case Status', 'Lab 1 Test Type',
                           'Lab 1 Specimen Collection Date', 'Lab 1 Report Date', 'Lab 1 Result', 'Lab 2 Test Type', 'Lab 2 Specimen Collection Date',
                           'Lab 2 Report Date', 'Lab 2 Result', 'Full Assigned Jurisdiction Path', 'Assigned User'].freeze

  MONITOREES_LIST_HEADERS = ['Patient ID'] + COMPREHENSIVE_HEADERS.freeze

  EPI_X_HEADERS = ['Local-ID', 'Flight No', 'Date of notice', 'MDH Assignee', 'DGMQ ID', 'CARE ID', 'CARE Cell Number', 'Language', 'Arrival Date and Time',
                   'Arrival City', 'Last Name', 'First Name', 'Date of Birth', 'Gender', 'Passport Country', 'Passport Number', 'Permanent Street Address',
                   'Permanent City', 'Permanent State or Country', 'Postal Code', 'Temporary Street Address 1', 'Temporary City 1', 'Temporary State 1',
                   'Temporary Postal Code 1', 'Temporary Street Address 2', 'Temporary City 2', 'Temporary State 2', 'Temporary Postal Code 2',
                   'Phone Number 1', 'Phone Number 2', 'Email 1', 'Email 2', 'Emergency Contact Name', 'Emergency Contact Telephone Number',
                   'Emergency Contact Email', 'Countries Visited with Widespread Transmission in Past 14 Days', 'Departure Date',
                   'DHS Observed Vomiting, Diarrhea or Bleeding', 'Temperature taken by DHS', 'Fever/Chills in the past 48 hours',
                   'Vomiting/Diarrhea in the past 48 hours', 'Lived in Same Household or Had Other Contact with a Person Sick with disease in Past 14 Days',
                   'Worked in Health Care Facility or Laboratory in Country with Widespread Transmission in Past 14 Days',
                   'Touched Body of Someone who Died in Country with Widespread Transmission in Past 14 Days',
                   'DHS Traveler Health Declaration Outcome: Released', 'DHS Traveler Health Declaration Outcome: Referred to Tertiary for Add\'l Assessment',
                   'Disposition of Travelers Referred for CDC Assessment: Released to Continue Travel',
                   'Disposition of Travelers Referred for CDC Assessment: Coordinated Disposition with State Health Dept.',
                   'Disposition of Travelers Referred for CDC Assessment: Referred for Additional Medical Evaluation',
                   'Disposition of Travelers Referred for CDC Assessment: Other', 'Final Disposition of Traveler\'s Medical Evaluation (If applicable)',
                   'Exposure Assessment', 'Contact Made?', 'Monitoring needed?', 'Notes'].freeze

  COMPREHENSIVE_FIELDS = [:first_name, :middle_name, :last_name, :date_of_birth, :sex, :white, :black_or_african_american, :american_indian_or_alaska_native,
                          :asian, :native_hawaiian_or_other_pacific_islander, :ethnicity, :primary_language, :secondary_language, :interpretation_required,
                          :nationality, :user_defined_id_statelocal, :user_defined_id_cdc, :user_defined_id_nndss, :address_line_1, :address_city,
                          :address_state, :address_line_2, :address_zip, :address_county, :foreign_address_line_1, :foreign_address_city,
                          :foreign_address_country, :foreign_address_line_2, :foreign_address_zip, :foreign_address_line_3, :foreign_address_state,
                          :monitored_address_line_1, :monitored_address_city, :monitored_address_state, :monitored_address_line_2, :monitored_address_zip,
                          :monitored_address_county, :foreign_monitored_address_line_1, :foreign_monitored_address_city, :foreign_monitored_address_state,
                          :foreign_monitored_address_line_2, :foreign_monitored_address_zip, :foreign_monitored_address_county, :preferred_contact_method,
                          :primary_telephone, :primary_telephone_type, :secondary_telephone, :secondary_telephone_type, :preferred_contact_time, :email,
                          :port_of_origin, :date_of_departure, :source_of_report, :flight_or_vessel_number, :flight_or_vessel_carrier, :port_of_entry_into_usa,
                          :date_of_arrival, :travel_related_notes, :additional_planned_travel_type, :additional_planned_travel_destination,
                          :additional_planned_travel_destination_state, :additional_planned_travel_destination_country,
                          :additional_planned_travel_port_of_departure, :additional_planned_travel_start_date, :additional_planned_travel_end_date,
                          :additional_planned_travel_related_notes, :last_date_of_exposure, :potential_exposure_location, :potential_exposure_country,
                          :contact_of_known_case, :contact_of_known_case_id, :travel_to_affected_country_or_area, :was_in_health_care_facility_with_known_cases,
                          :was_in_health_care_facility_with_known_cases_facility_name, :laboratory_personnel, :laboratory_personnel_facility_name,
                          :healthcare_personnel, :healthcare_personnel_facility_name, :crew_on_passenger_or_cargo_flight, :member_of_a_common_exposure_cohort,
                          :member_of_a_common_exposure_cohort_type, :exposure_risk_assessment, :monitoring_plan, :exposure_notes, nil, :symptom_onset,
                          :case_status, nil, nil, nil, nil, nil, nil, nil, nil, :jurisdiction_path, :assigned_user].freeze

  EPI_X_FIELDS = [:user_defined_id_statelocal, :flight_or_vessel_number, nil, nil, :user_defined_id_cdc, nil, nil, :primary_language, :date_of_arrival,
                  :port_of_entry_into_usa, :last_name, :first_name, :date_of_birth, :sex, nil, nil, :address_line_1, :address_city, :address_state,
                  :address_zip, :monitored_address_line_1, :monitored_address_city, :monitored_address_state, :monitored_address_zip, nil, nil, nil, nil,
                  :primary_telephone, :secondary_telephone, :email, nil, nil, nil, :potential_exposure_location, :potential_exposure_country,
                  :date_of_departure, nil, nil, nil, nil, :contact_of_known_case, :was_in_health_care_facility_with_known_cases].freeze

  SEX_ABBREVIATIONS = {
    M: 'Male',
    F: 'Female',
    U: 'Unknown'
  }.freeze

  STATE_ABBREVIATIONS = {
    AL: 'Alabama',
    AK: 'Alaska',
    AS: 'American Samoa',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    DC: 'District of Columbia',
    FM: 'Federated States of Micronesia',
    FL: 'Florida',
    GA: 'Georgia',
    GU: 'Guam',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MH: 'Marshall Islands',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    MP: 'Northern Mariana Islands',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PW: 'Palau',
    PA: 'Pennsylvania',
    PR: 'Puerto Rico',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VI: 'Virgin Islands',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming'
  }.freeze

  VALID_STATES = STATE_ABBREVIATIONS.values

  VALID_ENUMS = {
    ethnicity: ['Not Hispanic or Latino', 'Hispanic or Latino'],
    preferred_contact_method: ['E-mailed Web Link', 'SMS Texted Weblink', 'Telephone call', 'SMS Text-message'],
    primary_telephone_type: ['Smartphone', 'Plain Cell', 'Landline'],
    secondary_telephone_type: ['Smartphone', 'Plain Cell', 'Landline'],
    preferred_contact_time: %w[Morning Afternoon Evening],
    additional_planned_travel_type: %w[Domestic International],
    exposure_risk_assessment: ['High', 'Medium', 'Low', 'No Identified Risk'],
    monitoring_plan: ['None',
                      'Daily active monitoring',
                      'Self-monitoring with public health supervision',
                      'Self-monitoring with delegated supervision',
                      'Self-observation'],
    case_status: ['Confirmed', 'Probable', 'Suspect', 'Unknown', 'Not a Case']
  }.freeze

  VALIDATION = {
    first_name: { label: 'First Name', checks: [:required] },
    last_name: { label: 'Last Name', checks: [:required] },
    date_of_birth: { label: 'Date of Birth', checks: %i[required date] },
    sex: { label: 'Sex', checks: [:sex] },
    white: { label: 'White', checks: [:bool] },
    black_or_african_american: { label: 'Black or African American', checks: [:bool] },
    american_indian_or_alaska_native: { label: 'American Indian or Alaska Native', checks: [:bool] },
    asian: { label: 'Asian', checks: [:bool] },
    native_hawaiian_or_other_pacific_islander: { label: 'Native Hawaiian or Other Pacific Islander', checks: [:bool] },
    ethnicity: { label: 'Ethnicity', checks: [:enum] },
    interpretation_required: { label: 'Interpretation Required?', checks: [:bool] },
    address_state: { label: 'State', checks: [:state] },
    monitored_address_state: { label: 'Monitored Address State', checks: [:state] },
    foreign_monitored_address_state: { label: 'Foreign Monitored Address State', checks: [:state] },
    preferred_contact_method: { label: 'Preferred Contact Method', checks: [:enum] },
    primary_telephone: { label: 'Primary Telephone', checks: [:phone] },
    primary_telephone_type: { label: 'Primary Telephone Type', checks: [:enum] },
    secondary_telephone: { label: 'Secondary Telephone', checks: [:phone] },
    secondary_telephone_type: { label: 'Secondary Telephone Type', checks: [:enum] },
    preferred_contact_time: { label: 'Preferred Contact Time', checks: [:enum] },
    email: { label: 'Email', checks: [:email] },
    date_of_departure: { label: 'Date of Departure', checks: [:date] },
    date_of_arrival: { label: 'Date of Arrival', checks: [:date] },
    additional_planned_travel_type: { label: 'Additional Planned Travel Type', checks: [:enum] },
    additional_planned_travel_destination_state: { label: 'Additional Planned Travel Destination State', checks: [:state] },
    additional_planned_travel_start_date: { label: 'Additional Planned Travel Start Date', checks: [:date] },
    additional_planned_travel_end_date: { label: 'Additional Planned Travel End Date', checks: [:date] },
    last_date_of_exposure: { label: 'Last Date of Exposure', checks: %i[required date] },
    contact_of_known_case: { label: 'Contact of Known Case?', checks: [:bool] },
    travel_to_affected_country_or_area: { label: 'Travel from Affected Country or Area?', checks: [:bool] },
    was_in_health_care_facility_with_known_cases: { label: 'Was in Health Care Facility With Known Cases?', checks: [:bool] },
    laboratory_personnel: { label: 'Laboratory Personnel?', checks: [:bool] },
    healthcare_personnel: { label: 'Healthcare Personnel?', checks: [:bool] },
    crew_on_passenger_or_cargo_flight: { label: 'Crew on Passenger or Cargo Flight?', checks: [:bool] },
    member_of_a_common_exposure_cohort: { label: 'Member of a Common Exposure Cohort?', checks: [:bool] },
    exposure_risk_assessment: { label: 'Exposure Risk Assessment', checks: [:enum] },
    monitoring_plan: { label: 'Monitoring Plan', checks: [:enum] },
    symptom_onset: { label: 'Symptom Onset', checks: [:date] },
    case_status: { label: 'Case Status', checks: [:enum] },
    specimen_collection: { label: 'Lab Specimen Collection Date', checks: [:date] },
    report: { label: 'Lab Report Date', checks: [:date] }
  }.freeze

  def csv_line_list(patients)
    package = CSV.generate(headers: true) do |csv|
      csv << LINELIST_HEADERS
      patient_statuses = get_patient_statuses(patients)
      latest_assessments = get_latest_assessments(patients)
      latest_transfers = get_latest_transfers(patients)
      patients.find_each(batch_size: 500) do |patient|
        patient_details = patient.linelist_export
        patient_details[:name] = patient_details[:name][:name]
        patient_details[:latest_report] = latest_assessments[patient.id]&.rfc2822 || ''
        if latest_transfers[patient.id]
          patient_details[:transferred] = latest_transfers[patient.id][:transferred]
          patient_details[:transferred_from] = latest_transfers[patient.id][:transferred_from]
          patient_details[:transferred_to] = latest_transfers[patient.id][:transferred_to]
        end
        patient_details[:status] = patient_statuses[patient.id] || ''
        csv << patient_details.values
      end
    end
    Base64.encode64(package)
  end

  def sara_alert_format(patients)
    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(name: 'Monitorees') do |sheet|
        sheet.add_row COMPREHENSIVE_HEADERS
        patient_statuses = get_patient_statuses(patients)
        patients.find_each(batch_size: 500) do |patient|
          patient_details = patient.comprehensive_details
          patient_details[:status] = patient_statuses[patient.id] || ''
          sheet.add_row patient_details.values, { types: Array.new(COMPREHENSIVE_HEADERS.length, :string) }
        end
      end
      return Base64.encode64(p.to_stream.read)
    end
  end

  def build_excel_export_for_patients(patients)
    Axlsx::Package.new do |p|
      p.workbook.add_worksheet(name: 'Monitorees List') do |sheet|
        headers = MONITOREES_LIST_HEADERS
        sheet.add_row headers
        patient_statuses = get_patient_statuses(patients)
        patients.find_each(batch_size: 500) do |patient|
          patient_details = patient.comprehensive_details
          patient_details[:status] = patient_statuses[patient.id] || ''
          sheet.add_row [patient.id] + patient_details.values, { types: Array.new(headers.length, :string) }
        end
      end
      p.workbook.add_worksheet(name: 'Assessments') do |sheet|
        assessment_ids = Assessment.where(patient_id: patients.last&.id).pluck(:id)
        condition_ids = ReportedCondition.where(assessment_id: assessment_ids).pluck(:id)
        # Need to get ALL symptom names and labels (human readable and computer-queryable) since
        # Symptoms may differ over time and bettween sub-jurisdictions but each monitoree columns still need to line up
        symptom_label_and_names = Symptom.where(condition_id: condition_ids).pluck(:label, :name).uniq
        symptom_labels = symptom_label_and_names.collect { |s| s[0] }
        # The full list of symptom names will be used to build the assessment summary where a row can be constructed
        # even for an assessment lacking all possible symptoms
        symptom_names = symptom_label_and_names.collect { |s| s[1] }
        patient_info_headers = %w[patient_id symptomatic who_reported created_at updated_at]
        human_readable_headers = ['Patient ID', 'Symptomatic', 'Who Reported', 'Created At', 'Updated At'] + symptom_labels
        sheet.add_row human_readable_headers
        patients.find_each(batch_size: 500) do |patient|
          patient_assessments = patient.assessmenmts_summary_array(patient_info_headers, symptom_names)
          patient_assessments.each do |assessment|
            sheet.add_row assessment, { types: Array.new(human_readable_headers.length, :string) }
          end
        end
      end
      p.workbook.add_worksheet(name: 'Lab Results') do |sheet|
        labs = Laboratory.where(patient_id: patients.pluck(:id))
        lab_headers = ['Patient ID', 'Lab Type', 'Specimen Collection Date', 'Report Date', 'Result Date', 'Created At', 'Updated At']
        sheet.add_row lab_headers
        labs.find_each(batch_size: 500) do |lab|
          sheet.add_row lab.details.values, { types: Array.new(lab_headers.length, :string) }
        end
      end
      p.workbook.add_worksheet(name: 'Edit Histories') do |sheet|
        histories = History.where(patient_id: patients.pluck(:id))
        history_headers = ['Patient ID', 'Comment', 'Created By', 'History Type', 'Created At', 'Updated At']
        sheet.add_row history_headers
        histories.find_each(batch_size: 500) do |history|
          sheet.add_row history.details.values, { types: Array.new(history_headers.length, :string) }
        end
      end
      return Base64.encode64(p.to_stream.read)
    end
  end

  def get_patient_statuses(patients)
    statuses = {
      closed: patients.monitoring_closed.pluck(:id),
      purged: patients.purged.pluck(:id),
      pui: patients.under_investigation.pluck(:id),
      symptomatic: patients.symptomatic.pluck(:id),
      asymptomatic: patients.asymptomatic.pluck(:id),
      non_reporting: patients.non_reporting.pluck(:id),
      isolation_asymp_non_test_based: patients.asymp_non_test_based.pluck(:id),
      isolation_symp_non_test_based: patients.symp_non_test_based.pluck(:id),
      isolation_test_based: patients.test_based.pluck(:id),
      isolation_reporting: patients.isolation_reporting.pluck(:id),
      isolation_non_reporting: patients.isolation_non_reporting.pluck(:id)
    }
    patient_statuses = {}
    statuses.each do |status, patient_ids|
      patient_ids.each do |patient_id|
        patient_statuses[patient_id] = status&.to_s&.humanize&.downcase
      end
    end
    patient_statuses
  end

  def get_latest_assessments(patients)
    latest_assessments = Assessment.where(patient_id: patients.pluck(:id)).group(:patient_id).maximum(:created_at)
    assessments = Assessment.where(patient_id: latest_assessments.keys, created_at: latest_assessments.values)
    Hash[assessments.pluck(:patient_id, :created_at).map { |patient_id, created_at| [patient_id, created_at] }]
  end

  def get_latest_transfers(patients)
    latest_transfers = Transfer.where(patient_id: patients.pluck(:id)).group(:patient_id).maximum(:created_at)
    transfers = Transfer.where(patient_id: latest_transfers.keys, created_at: latest_transfers.values)
    jurisdictions = Jurisdiction.find(transfers.pluck(:from_jurisdiction_id, :to_jurisdiction_id).flatten.uniq)
    jurisdiction_paths = Hash[jurisdictions.pluck(:id, :path).map { |id, path| [id, path] }]
    Hash[transfers.pluck(:patient_id, :created_at, :from_jurisdiction_id, :to_jurisdiction_id)
                  .map do |patient_id, created_at, from_jurisdiction_id, to_jurisdiction_id|
                    [patient_id, {
                      transferred: created_at.rfc2822,
                      transferred_from: jurisdiction_paths[from_jurisdiction_id],
                      transferred_to: jurisdiction_paths[to_jurisdiction_id]
                    }]
                  end
        ]
  end
end
