import React, {
  useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
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

function FormAutosuggest({
  children,
  arrowKeyNavigationSelector,
  ignoredArrowKeysNames,
  screenReaderText,
  value,
  isLoading,
  errorMessageText,
  onChange,
  onSelected,
  helpMessage,
  ...props
}) {
  const intl = useIntl();
  const parentRef = useArrowKeyNavigation({
    selectors: arrowKeyNavigationSelector,
    ignoredKeys: ignoredArrowKeysNames,
  });

  const input = parentRef.current?parentRef.current.querySelector("input"):null
  // console.log(input)

  // const [searchStr, setSearchStr] = useState(""); //the input string
  // console.log("searchStr", searchStr)

  const [isMenuClosed, setIsMenuClosed] = useState(true);
  console.log("Is Menu Closed", isMenuClosed)

  const [isActive, setIsActive] = useState(false);
  const [state, setState] = useState({
    displayValue: value || '',
    errorMessage: '',
    dropDownItems: [],
  });

  const handleItemClick = (e, onClick) => {
    const clickedValue = e.currentTarget.value;

    if (onSelected && clickedValue !== value) {
      onSelected(clickedValue);
    }

    setState(prevState => ({
      ...prevState,
      dropDownItems: [],
      displayValue: clickedValue,
    }));

    setIsMenuClosed(true);

    if (onClick) {
      onClick(e);
    }
  };

  function getItems(strToFind = '') {
    console.log("strToFind", strToFind)
    let childrenOpt = React.Children.map(children, (child,index) => {
      // eslint-disable-next-line no-shadow
      const { children, onClick, ...rest } = child.props;

      return React.cloneElement(child, {
        ...rest,
        children,
        value: children,
        onClick: (e) => handleItemClick(e, onClick),
        key: index,
      });
    });

    if (strToFind.length > 0) {
      childrenOpt = childrenOpt
        .filter((opt) => (opt.props.children.toLowerCase().includes(strToFind.toLowerCase())));
    }
    console.log("ChildrenOpt", childrenOpt)
    return childrenOpt;
  }

  const handleExpand = (e) => {

    const newState = {
      dropDownItems: [],
    };
    
    if (isMenuClosed) { //menu is currently closed, but going from closed to open
      newState.dropDownItems = getItems(state.displayValue); //originally e.target.value which is nothing, target was the icon (no value)
      //assumed you typed nothing, hence why it would repopulate with everything
      console.log("Is Menu Closed:True", newState.dropDownItems, e.target.value)
      newState.errorMessage = '';
    }

    setState(prevState => ({
      ...prevState,
      ...newState,
    }));
    console.log("Exapnd", isMenuClosed, newState)

    setIsMenuClosed(!isMenuClosed);
  };

  const iconToggle = (
    <IconButton
      className="pgn__form-autosuggest__icon-button"
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
    if (isActive && parentRef.current && !parentRef.current.contains(e.target)) {
      setIsActive(false);

      setState(prevState => ({
        ...prevState,
        dropDownItems: [],
        errorMessage: !state.displayValue ? errorMessageText : '',
      }));

      setIsMenuClosed(true);
    }
  };

  const keyDownHandler = e => {
    // console.log("TARGET:", e.target)
    // console.log("CURRENT TARGET:", e.currentTarget)
    console.log("Key down handler:", e.key, state.dropDownItems)

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
        displayValue: value,
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
  console.log("Before return", state.dropDownItems)
  return (
    <div className="pgn__form-autosuggest__wrapper" ref={parentRef}>
      <FormGroup isInvalid={!!state.errorMessage}>
        <FormControl
          aria-expanded={(state.dropDownItems.length > 0).toString()}
          aria-owns="pgn__form-autosuggest__dropdown-box"
          value={state.displayValue}
          aria-invalid={state.errorMessage}
          onChange={handleOnChange}
          onClick={handleClick}
          trailingElement={iconToggle}
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

      <div
        id="pgn__form-autosuggest__dropdown-box"
        className="pgn__form-autosuggest__dropdown"
      >
        {isLoading ? (
          <div className="pgn__form-autosuggest__dropdown-loading">
            <Spinner animation="border" variant="dark" screenReaderText={screenReaderText} />
          </div>
        ) : state.dropDownItems.length > 0 && state.dropDownItems}
      </div>
    </div>
  );
}

FormAutosuggest.defaultProps = {
  arrowKeyNavigationSelector: 'a:not(:disabled),button:not(:disabled, .btn-icon),input:not(:disabled)',
  ignoredArrowKeysNames: ['ArrowRight', 'ArrowLeft'],
  isLoading: false,
  role: 'list',
  className: null,
  floatingLabel: null,
  onChange: null,
  onSelected: null,
  helpMessage: '',
  placeholder: '',
  value: null,
  errorMessageText: null,
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
  /** An ARIA role describing the form autosuggest. */
  role: PropTypes.string,
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
