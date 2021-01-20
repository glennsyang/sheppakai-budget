export const FIELD_REQUIRED = "*This field is required.";
export const VALID_EMAIL = "*Please enter a valid e-mail address.";
export const VALID_PASSWORD = "*Password must be at least 12 characters long.";

/*
 * React-Select custom styles
 */
export const customStyles = {
    control: styles => ({
        ...styles,
        backgroundColor: 'white',
        boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        padding: '1px',
        borderColor: '#cbd5e0'
    }),
    option: (provided, state) => ({
        ...provided,
        borderBottom: '1px gray',
        borderRadius: '9999px',
        backgroundColor: state.isSelected ? 'white' : 'white',
        color: '#2d3748',
        ':hover': {
            backgroundColor: '#f7fafc',
            color: '#4299e1',
        },
        padding: 10,
        fontSize: '14px',
    }),
    singleValue: ((provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300m  s';

        return { ...provided, opacity, transition };
    }),
    placeholder: styles => ({ ...styles, color: '#cbd5e0' }),
};