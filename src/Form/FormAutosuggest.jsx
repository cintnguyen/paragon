import React, {
  useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { v4 as uuidv4 } from 'uuid';
import { useIntl } from 'react-intl';
import { KeyboardArrowUp, KeyboardArrowDown } from '../../icons';
import Icon from '../Icon';
import FormGroup from './FormGroup';
import FormControl from './FormControl';
import FormControlFeedback from './FormControlFeedback';
import IconButton from '../IconButton';
import Spinner from '../Spinner';
import useArrowKeyNavigation from '../hooks/useArrowKeyNavigation';
import messages from './messages';

//this is the function that is being called in the mdx file
function FormAutosuggest({
  children,
  arrowKeyNavigationSelector,
  ignoredArrowKeysNames,
  screenReaderText,
  value,
  freeformValue,
  isLoading,
  errorMessageText, //create more, more specific error no selected value
  errorNoMatchingText, // error no matching value
  onChange,
  onSelected,
  helpMessage,
  allowFreeFormInput,
  ...props
}) {
  const intl = useIntl();
  const parentRef = useArrowKeyNavigation({
    selectors: arrowKeyNavigationSelector,
    ignoredKeys: ignoredArrowKeysNames,
  });
  const [isMenuClosed, setIsMenuClosed] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [state, setState] = useState({
    displayValue: freeformValue || '',
    errorMessage: '',
    dropDownItems: [],
  });
  console.log("VALUE:", value)

  const handleItemClick = (e, onClick) => {
    const clickedDataValue = e.currentTarget.getAttribute('data-value');
    const clickedDisplayValue = e.currentTarget.innerText
   
    if (onSelected && clickedDataValue !== value) {
      onSelected({dataValue: clickedDataValue, displayValue: clickedDisplayValue, });
      // call on selected and passes the object as an argument
      // doc site example, selected will now be a data object
      //then passes that in and passes that in as the value of the autosuggest component
      // component believes its jsut eh display value, so whereever its value it should be displayvalue
    }

    setState(prevState => ({
      ...prevState,
      dropDownItems: [],
      displayValue: clickedDisplayValue,
    }));

    setIsMenuClosed(true);

    if (onClick) {
      onClick(e);
    } 
  }; 

  function getItems(strToFind = '') {
    let childrenOpt = React.Children.map(children, (child) => {
      // eslint-disable-next-line no-shadow
      const { children, onClick, value, ...rest } = child.props;

      return React.cloneElement(child, {
        ...rest,
        children,
        'data-value': value ?? children,
        onClick: (e) => handleItemClick(e, onClick),
      });
    });

    if (strToFind.length > 0) {
      childrenOpt = childrenOpt
        .filter((opt) => (opt.props.children.toLowerCase().includes(strToFind.toLowerCase())));
    }

    return childrenOpt;
  }

  const handleExpand = () => {
    setIsMenuClosed(!isMenuClosed);

    const newState = {
      dropDownItems: [],
    };

    if (isMenuClosed) {
      setIsActive(true);
      newState.dropDownItems = getItems(state.displayValue);
      newState.errorMessage = '';
    }

    setState(prevState => ({
      ...prevState,
      ...newState,
    }));
  };

  const iconToggle = (
    <IconButton
      className="pgn__form-autosuggest__icon-button"
      data-testid="autosuggest_iconbutton"
      src={isMenuClosed ? KeyboardArrowDown : KeyboardArrowUp}
      iconAs={Icon}
      size="sm"
      variant="secondary"
      alt={isMenuClosed
        ? intl.formatMessage(messages.iconButtonOpened)
        : intl.formatMessage(messages.iconButtonClosed)}
      onClick={(e) => handleExpand(e, isMenuClosed)}
    />
  );

  const handleDocumentClick = (e) => {
    if (parentRef.current && !parentRef.current.contains(e.target) && isActive) {
      setIsActive(false);
      
      let errorMessage = ""
    
      if (!state.displayValue){
        console.log("Nothing typed:", errorMessageText)
        
        // !state.displayValue errorMessage = errorMessageText ? errorMessageText : ''
      }
      else if(!allowFreeFormInput){ //not allowing for freeform, meaning must exactly match
        console.log("Freeform not allowed:", errorNoMatchingText)
        const dropDownItems = getItems(state.displayValue)
        let inputMatchesDropDown = false
        React.Children.forEach(children, (child) => {
          console.log("item", child.props.children)
          console.log(child.props)
          if (state.displayValue === child.props.children){
            onSelected(state.displayValue) // freeform input is not allowed, HAS to match option values
            //when we get real option values then pass in as onSelected argument
            //child.props gives me access to the option props, aka where we are setting the option value
            //when we pass it into onSelected, it now becomes the display value as well

            inputMatchesDropDown = true
          }
        })
        if (!inputMatchesDropDown){
          onSelected("") //setting components parent value back to default
          errorMessage = errorNoMatchingText
          console.log("Freeform not allowed and doesn't match:", state.displayValue, dropDownItems, errorMessage)
        }
      }else{
        onSelected(state.displayValue) // freeform IS allowed, give state.displayValue
      }

      setState(prevState => ({
        ...prevState,
        dropDownItems: [],
        errorMessage: errorMessage,
      }));
      
      setIsMenuClosed(true);
    }
  };

  const keyDownHandler = e => {
    if (e.key === 'Escape' && isActive) {
      e.preventDefault();

      setState(prevState => ({
        ...prevState,
        dropDownItems: [],
      }));

      setIsMenuClosed(true);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', keyDownHandler);
    document.addEventListener('click', handleDocumentClick, true);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      document.removeEventListener('keydown', keyDownHandler);
    };
  });

  useEffect(() => {
    if (value || value === '') {
      setState(prevState => ({
        ...prevState,
        displayValue: freeformValue,
      }));
    }
  }, [value]);

  const setDisplayValue = (itemValue) => {
    const optValue = [];

    children.forEach(opt => {
      optValue.push(opt.props.children);
    });

    const normalized = itemValue.toLowerCase();
    const opt = optValue.find((o) => o.toLowerCase() === normalized);

    setState(prevState => ({
      ...prevState,
      displayValue: opt || itemValue,
    }));
  };

  const handleClick = (e) => {
    setIsActive(true);
    const dropDownItems = getItems(e.target.value);

    if (dropDownItems.length > 1) {
      setState(prevState => ({
        ...prevState,
        dropDownItems,
        errorMessage: '',
      }));

      setIsMenuClosed(false);
    }
  };

  const handleOnChange = (e) => {
    const findStr = e.target.value;
    
    if (onChange) { onChange(findStr); }
    
    if (findStr.length) {
      const filteredItems = getItems(findStr);
      setState(prevState => ({
        ...prevState,
        dropDownItems: filteredItems,
        errorMessage: '',
      }));

      setIsMenuClosed(false);
    } else {
      setState(prevState => ({
        ...prevState,
        dropDownItems: [],
      }));

      setIsMenuClosed(true);
    }

    setDisplayValue(e.target.value);
  };

  return (
    <div className="pgn__form-autosuggest__wrapper" ref={parentRef}>
      <FormGroup isInvalid={!!state.errorMessage}>
        <FormControl
          aria-expanded={(state.dropDownItems.length > 0).toString()}
          aria-owns="pgn__form-autosuggest__dropdown-box"
          role="combobox"
          aria-autocomplete="list"
          autoComplete="off"
          value={state.displayValue}
          aria-invalid={state.errorMessage}
          onChange={handleOnChange}
          onClick={handleClick}
          trailingElement={iconToggle}
          data-testid="autosuggest_textbox_input"
          {...props}
        />

        {helpMessage && !state.errorMessage && (
          <FormControlFeedback type="default">
            {helpMessage}
          </FormControlFeedback>
        )}

        {state.errorMessage && (
          <FormControlFeedback type="invalid" feedback-for={props.name}>
            {errorMessageText}
          </FormControlFeedback>
        )}
      </FormGroup>

      <ul
        id="pgn__form-autosuggest__dropdown-box"
        className="pgn__form-autosuggest__dropdown"
        role="listbox"
      >
        {isLoading ? (
          <div className="pgn__form-autosuggest__dropdown-loading">
            <Spinner animation="border" variant="dark" screenReaderText={screenReaderText} data-testid="autosuggest_loading_spinner" />
          </div>
        ) : state.dropDownItems.length > 0 && state.dropDownItems}
      </ul>
    </div>
  );
}

FormAutosuggest.defaultProps = {
  arrowKeyNavigationSelector: 'a:not(:disabled),li:not(:disabled, .btn-icon),input:not(:disabled)',
  ignoredArrowKeysNames: ['ArrowRight', 'ArrowLeft'],
  isLoading: false,
  className: null,
  floatingLabel: null,
  onChange: null,
  onSelected: null,
  helpMessage: '',
  placeholder: '',
  value: null,
  errorMessageText: "Error, no selected value",
  errorNoMatchingText: "Error, no matching value",
  readOnly: false,
  children: null,
  name: 'form-autosuggest',
  screenReaderText: 'loading',
};

FormAutosuggest.propTypes = {
  /**
   * Specifies the CSS selector string that indicates to which elements
   * the user can navigate using the arrow keys
  */
  arrowKeyNavigationSelector: PropTypes.string,
  /** Specifies ignored hook keys. */
  ignoredArrowKeysNames: PropTypes.arrayOf(PropTypes.string),
  /** Specifies loading state. */
  isLoading: PropTypes.bool,
  /** Specifies class name to append to the base element. */
  className: PropTypes.string,
  /** Specifies floating label to display for the input component. */
  floatingLabel: PropTypes.string,
  /** Specifies onChange event handler. */
  onChange: PropTypes.func,
  /** Specifies help information for the user. */
  helpMessage: PropTypes.string,
  /** Specifies the placeholder text for the input. */
  placeholder: PropTypes.string,
  /** Specifies values for the input. */
  value: PropTypes.string,
  /** Informs user has errors. */
  errorMessageText: PropTypes.string,
  /** Specifies the name of the base input element. */
  name: PropTypes.string,
  /** Selected list item is read-only. */
  readOnly: PropTypes.bool,
  /** Specifies the content of the `FormAutosuggest`. */
  children: PropTypes.node,
  /** Specifies the screen reader text */
  screenReaderText: PropTypes.string,
  /** Function that receives the selected value. */
  onSelected: PropTypes.func,
};

export default FormAutosuggest;
