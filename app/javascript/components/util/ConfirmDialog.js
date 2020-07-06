import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, Form } from 'react-bootstrap';
import { confirmable, createConfirmation } from 'react-confirm';

class Confirmation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      extraOptionValue: false,
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.props.extraOptionChange(value);
  }

  render() {
    const {
      okLabel = 'OK',
      cancelLabel = 'Cancel',
      title,
      confirmation,
      additionalNote,
      show,
      proceed,
      enableEscape = true,
      extraOption = undefined,
    } = this.props;
    return (
      <Modal
        className="static-modal-container"
        size="lg"
        show={show}
        centered
        onHide={() => proceed(false)}
        backdrop={enableEscape ? true : 'static'}
        keyboard={enableEscape}>
        <Modal.Header>
          <Modal.Title>{title || 'Confirm'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-0">{confirmation}</p>
          {additionalNote && <p className="mb-0 mt-4">{additionalNote}</p>}
        </Modal.Body>
        {extraOption && <Form.Check type="checkbox" label={extraOption} className="mx-3" onChange={this.handleChange}></Form.Check>}
        <Modal.Footer>
          <Button onClick={() => proceed(false)}>{cancelLabel}</Button>
          <Button className="button-l" onClick={() => proceed(true)}>
            {okLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

Confirmation.propTypes = {
  okLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  title: PropTypes.string,
  confirmation: PropTypes.string,
  additionalNote: PropTypes.string,
  extraOptionChange: PropTypes.func,
  extraOption: PropTypes.string,
  show: PropTypes.bool,
  proceed: PropTypes.func, // called when ok button is clicked.
  enableEscape: PropTypes.bool,
};

const defaultConfirmation = createConfirmation(confirmable(Confirmation));

export default function confirm(confirmation, options = {}) {
  return defaultConfirmation({ confirmation, ...options });
}
