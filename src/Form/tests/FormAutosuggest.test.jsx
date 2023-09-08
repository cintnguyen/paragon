import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IntlProvider } from 'react-intl';
import FormAutosuggest from '../FormAutosuggest';
import FormAutosuggestOption from '../FormAutosuggestOption';

function FormAutosuggestWrapper(props) {
  return (
    <IntlProvider locale="en" messages={{}}>
      <FormAutosuggest {...props} />
    </IntlProvider>
  );
}

function FormAutosuggestTestComponent(props) {
  const onSelected = props.onSelected ?? jest.fn();
  const onClick = props.onClick ?? jest.fn();
  return (
    <FormAutosuggestWrapper
      name="FormAutosuggest"
      floatingLabel="floatingLabel text"
      helpMessage="Example help message"
      errorMessageText="Example error message"
      onSelected={onSelected}
    >
      <FormAutosuggestOption>Option 1</FormAutosuggestOption>
      <FormAutosuggestOption onClick={onClick}>Option 2</FormAutosuggestOption>
      <FormAutosuggestOption>Learn from more than 160 member universities</FormAutosuggestOption>
    </FormAutosuggestWrapper>
  );
}

describe('render behavior', () => {
  it('renders component without error', () => {
    render(<FormAutosuggestWrapper />);
  });

  it('renders without loading state', () => {
    const { container } = render(<FormAutosuggestTestComponent />);
    expect(container.querySelector('.pgn__form-autosuggest__dropdown-loading')).toBeNull();
  });

  it('render with loading state', () => {
    const { container } = render(<FormAutosuggestWrapper isLoading />);
    expect(container.querySelector('.pgn__form-autosuggest__dropdown-loading')).toBeTruthy();
  });

  it('renders the auto-populated value if it exists', () => {
    render(<FormAutosuggestWrapper value="Test Value" />);
    expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
  });

  it('renders component with options', () => {
    const { getByTestId, container } = render(<FormAutosuggestTestComponent />);
    const input = getByTestId('autosuggest_textbox_input');
    fireEvent.click(input);
    const list = container.querySelectorAll('li');
    expect(list.length).toBe(3);
  });

  it('renders with error msg', () => {
    const { getByText, getByTestId } = render(<FormAutosuggestTestComponent />);
    const input = getByTestId('autosuggest_textbox_input');

    // if you click into the input and hit escape, you should see the error message
    fireEvent.click(input);
    fireEvent.keyDown(input, {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    const formControlFeedback = getByText('Example error message');

    expect(formControlFeedback).toBeInTheDocument();
  });
});

describe('controlled behavior', () => {
  it('sets input value based on clicked option', () => {
    const { getByText, getByTestId } = render(<FormAutosuggestTestComponent />);
    const input = getByTestId('autosuggest_textbox_input');

    fireEvent.click(input);
    const menuItem = getByText('Option 1');
    fireEvent.click(menuItem);

    expect(input.value).toEqual('Option 1');
  });

  it('calls onSelected based on clicked option', () => {
    const onSelected = jest.fn();
    const { getByText, getByTestId } = render(<FormAutosuggestTestComponent onSelected={onSelected} />);
    const input = getByTestId('autosuggest_textbox_input');

    fireEvent.click(input);
    const menuItem = getByText('Option 1');
    fireEvent.click(menuItem);

    expect(onSelected).toHaveBeenCalledWith('Option 1');
    expect(onSelected).toHaveBeenCalledTimes(1);
  });

  it('calls the function passed to onClick when an option with it is selected', () => {
    const onClick = jest.fn();
    const { getByText, getByTestId } = render(<FormAutosuggestTestComponent onClick={onClick} />);
    const input = getByTestId('autosuggest_textbox_input');

    fireEvent.click(input);
    const menuItem = getByText('Option 2');
    fireEvent.click(menuItem);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when an option without it is selected', () => {
    const onClick = jest.fn();
    const { getByText, getByTestId } = render(<FormAutosuggestTestComponent onClick={onClick} />);
    const input = getByTestId('autosuggest_textbox_input');

    fireEvent.click(input);
    const menuItem = getByText('Option 1');
    fireEvent.click(menuItem);

    expect(onClick).toHaveBeenCalledTimes(0);
  });

  it('filters dropdown based on typed field value with one match', () => {
    const { getByTestId, container } = render(<FormAutosuggestTestComponent />);
    const input = getByTestId('autosuggest_textbox_input');

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: 'Option 1' } });

    const list = container.querySelectorAll('li');
    expect(list.length).toBe(1);
  });

  it('toggles options list', () => {
    const { container } = render(<FormAutosuggestTestComponent />);
    const dropdownBtn = container.querySelector('button.pgn__form-autosuggest__icon-button');

    fireEvent.click(dropdownBtn);
    const list = container.querySelectorAll('li');
    expect(list.length).toBe(3);

    fireEvent.click(dropdownBtn);
    const updatedList = container.querySelectorAll('li');
    expect(updatedList.length).toBe(0);

    fireEvent.click(dropdownBtn);
    const reopenedList = container.querySelectorAll('li');
    expect(reopenedList.length).toBe(3);
  });

  it('filters dropdown based on typed field value with multiple matches', () => {
    const { getByTestId, container } = render(<FormAutosuggestTestComponent />);
    const input = getByTestId('autosuggest_textbox_input');

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: '1' } });

    const list = container.querySelectorAll('li');
    expect(list.length).toBe(2);
  });

  it('closes options list on click outside', () => {
    const { getByTestId, container } = render(<FormAutosuggestTestComponent />);
    const input = getByTestId('autosuggest_textbox_input');

    fireEvent.click(input);
    const list = container.querySelectorAll('li');
    expect(list.length).toBe(3);

    fireEvent.click(document.body);
    const updatedList = container.querySelectorAll('li');
    expect(updatedList.length).toBe(0);
  });
});
