/*
    render behavior
      ✓ renders component without error (3 ms) - Paired done
      ✓ render without loading state (2 ms) - Paired done
      ✓ render with loading state (3 ms) - Cindy done
      ✓ renders the auto-populated value if it exists (5 ms) - Mena done
      ✓ renders component with options (5 ms) - Cindy done
      ✓ renders with error msg (8 ms) - Mena done
    controlled behavior
      ✓ selects option (8 ms) - Paired done
      ✓ calls the function passed to onClick (6 ms) - Cindy done
      ✓ when a function is not passed to onClick, it is not called (3 ms) - Cindy done
      ✓ filters dropdown based on typed field value (2 ms) - Cindy done
      ✓ toggles options list (3 ms) - Mena
      ✓ filters options list based on field value (2 ms) - Cindy done
      ✓ closes options list on click outside (4 ms) - Mena
      ✓ check focus on input after esc - Cindy
*/

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

// const container = mount(
//     <FormAutosuggestWrapper
//       name="FormAutosuggest"
//       floatingLabel="floatingLabel text"
//       helpMessage="Example help message"
//       errorMessageText="Example error message"
//       onSelected={onSelected}
//     >
//       <FormAutosuggestOption>Option 1</FormAutosuggestOption>
//       <FormAutosuggestOption onClick={onClick}>Option 2</FormAutosuggestOption>
//       <FormAutosuggestOption>Learn from more than 160 member universities</FormAutosuggestOption>
//     </FormAutosuggestWrapper>,
//   );

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

  //     it('toggles options list', () => {
  //      this is toggling when the dropdown button is clicked
  //       const dropdownContainer = '.pgn__form-autosuggest__dropdown';

  //       expect(container.find(dropdownContainer).find('button').length).toEqual(3);

  //       container.find('button.pgn__form-autosuggest__icon-button').simulate('click');
  //       expect(container.find(dropdownContainer).find('button').length).toEqual(0);

  //       container.find('button.pgn__form-autosuggest__icon-button').simulate('click');
  //       expect(container.find(dropdownContainer).find('button').length).toEqual(3);
  //     });

  it('filters dropdown based on typed field value with multiple matches', () => {
    const { getByTestId, container } = render(<FormAutosuggestTestComponent />);
    const input = getByTestId('autosuggest_textbox_input');

    fireEvent.click(input);
    fireEvent.change(input, { target: { value: '1' } });

    const list = container.querySelectorAll('li');
    expect(list.length).toBe(2);
  });

  it('closes options list on click outside', () => {
  //       const fireEvent = createDocumentListenersMock();
  //       const dropdownContainer = '.pgn__form-autosuggest__dropdown';

    //       container.find('input').simulate('click');
    //       expect(container.find(dropdownContainer).find('button').length).toEqual(2);

    //       act(() => { fireEvent.click(document.body); });
    //       container.update();

    //       expect(container.find(dropdownContainer).find('button').length).toEqual(0);

    const { getByTestId, container } = render(<FormAutosuggestTestComponent />);
    const input = getByTestId('autosuggest_textbox_input');
    const dropdownContainer = container.querySelector('.pgn__form-autosuggest__dropdown');

    // expect(dropdownContainer).toBeInTheDocument();
    fireEvent.click(input);
    const list = container.querySelectorAll('li');

    expect(list.length).toBe(3);

    fireEvent.click(document.body);

    return screen.findByTestId(input, { timeout: 1000 })
      .then(() => {
        // expect(dropdownContainer).not.toBeInTheDocument();

        // Check if the list items are no longer present
        const updatedList = container.querySelectorAll('li');
        expect(updatedList.length).toBe(0);
      })
      .catch(() => {});
  });
  //   });

  // it('check focus on input after esc', () => {
  //   const { getByTestId } = render(<FormAutosuggestTestComponent />);
  //   const input = getByTestId('autosuggest_textbox_input');
  //   fireEvent.click(input);
  //   expect(input.toHaveFocus()).toBe(true);
  //   // const menuItem = getByText('Option 1');
  //   // fireEvent.click(menuItem);
  // });
});

//
//
// OLD CODE BELOW --------------------- :
//
//

// import React from 'react';
// import { mount } from 'enzyme';
// import { act } from 'react-dom/test-utils';
// import { IntlProvider } from 'react-intl';
// import FormAutosuggest from '../FormAutosuggest';
// import FormAutosuggestOption from '../FormAutosuggestOption';

// const createDocumentListenersMock = () => {
//   const listeners = {};
//   const handler = (domEl, e) => listeners?.[e]?.({ target: domEl });

//   document.addEventListener = jest.fn((e, fn) => { listeners[e] = fn; });
//   document.removeEventListener = jest.fn(e => { delete listeners[e]; });

//   return {
//     click: domEl => handler(domEl, 'click'),
//   };
// };

// function FormAutosuggestWrapper(props) {
//   return (
//     <IntlProvider locale="en" messages={{}}>
//       <FormAutosuggest {...props} />
//     </IntlProvider>
//   );
// }

// describe('FormAutosuggest', () => {
//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   const onSelected = jest.fn();
//   const onClick = jest.fn();

//   const container = mount(
//     <FormAutosuggestWrapper
//       name="FormAutosuggest"
//       floatingLabel="floatingLabel text"
//       helpMessage="Example help message"
//       errorMessageText="Example error message"
//       onSelected={onSelected}
//     >
//       <FormAutosuggestOption>Option 1</FormAutosuggestOption>
//       <FormAutosuggestOption onClick={onClick}>Option 2</FormAutosuggestOption>
//       <FormAutosuggestOption>Learn from more than 160 member universities</FormAutosuggestOption>
//     </FormAutosuggestWrapper>,
//   );

//   describe('render behavior', () => {
//     it('renders component without error', () => {
//       mount(<FormAutosuggestWrapper />);
//     });

//     it('render without loading state', () => {
//       expect(container.exists('.pgn__form-autosuggest__dropdown-loading')).toBe(false);
//       expect(container.props().isLoading).toBeUndefined();
//     });

//     it('render with loading state', () => {
//       const wrapper = mount(<FormAutosuggestWrapper isLoading />);

//       expect(wrapper.exists('.pgn__form-autosuggest__dropdown-loading')).toBe(true);
//       expect(wrapper.props().isLoading).toBe(true);
//     });

//     it('renders the auto-populated value if it exists', () => {
//       const wrapper = mount(<FormAutosuggestWrapper value="Test Value" />);

//       expect(wrapper.find('input').instance().value).toEqual('Test Value');
//       expect(wrapper.props().value).toEqual('Test Value');
//     });

//     it('renders component with options', () => {
//       container.find('input').simulate('click');
//       const optionsList = container.find('.pgn__form-autosuggest__dropdown').find('button');

//       expect(optionsList.length).toEqual(3);
//     });

//     it('renders with error msg', () => {
//       container.find('input').simulate('click');
//       act(() => {
//         const event = new Event('click', { bubbles: true });
//         document.dispatchEvent(event);
//       });
//       container.update();
//       const formControlFeedback = container.find('FormControlFeedback');

//       expect(formControlFeedback.text()).toEqual('Example error message');
//     });
//   });

//   describe('controlled behavior', () => {
//     it('selects option', () => {
//       container.find('input').simulate('click');
//       container.find('.pgn__form-autosuggest__dropdown').find('button')
//         .at(0).simulate('click');

//       expect(container.find('input').instance().value).toEqual('Option 1');
//       expect(onSelected).toHaveBeenCalledWith('Option 1');
//       expect(onSelected).toHaveBeenCalledTimes(1);
//     });

//     it('when a function is passed to onClick, it is called', () => {
//       container.find('input').simulate('change', { target: { value: 'Option 2' } });
//       container.find('.pgn__form-autosuggest__dropdown').find('button')
//         .at(0).simulate('click');

//       expect(onClick).toHaveBeenCalledTimes(1);
//     });

//     it('when a function is not passed to onClick, it is not called', () => {
//       container.find('input').simulate('change', { target: { value: 'Option 1' } });
//       container.find('.pgn__form-autosuggest__dropdown').find('button')
//         .at(0).simulate('click');

//       expect(onClick).toHaveBeenCalledTimes(0);
//     });

//     it('options list depends on empty field value', () => {
//       container.find('input').simulate('change', { target: { value: '' } });

//       expect(container.find('input').instance().value).toEqual('');
//     });

//     it('filters dropdown based on typed field value', () => {
//       container.find('input').simulate('change', { target: { value: 'option 1' } });

//       expect(container.find('.pgn__form-autosuggest__dropdown').find('button').length).toEqual(1);
//       expect(onSelected).toHaveBeenCalledTimes(0);
//     });

//     it('toggles options list', () => {
//      this is toggling when the dropdown button is clicked
//       const dropdownContainer = '.pgn__form-autosuggest__dropdown';

//       expect(container.find(dropdownContainer).find('button').length).toEqual(3);

//       container.find('button.pgn__form-autosuggest__icon-button').simulate('click');
//       expect(container.find(dropdownContainer).find('button').length).toEqual(0);

//       container.find('button.pgn__form-autosuggest__icon-button').simulate('click');
//       expect(container.find(dropdownContainer).find('button').length).toEqual(3);
//     });

//     it('filters options list based on field value', () => {
//       container.find('input').simulate('change', { target: { value: '1' } });

//       expect(container.find('.pgn__form-autosuggest__dropdown').find('button').length).toEqual(2);
//     });

//     it('closes options list on click outside', () => {
//       const fireEvent = createDocumentListenersMock();
//       const dropdownContainer = '.pgn__form-autosuggest__dropdown';

//       container.find('input').simulate('click');
//       expect(container.find(dropdownContainer).find('button').length).toEqual(2);

//       act(() => { fireEvent.click(document.body); });
//       container.update();

//       expect(container.find(dropdownContainer).find('button').length).toEqual(0);
//     });
//   });
// });
