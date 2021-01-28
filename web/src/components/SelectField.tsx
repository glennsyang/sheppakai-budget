import { useField, FieldProps } from "formik";
import Select, { Option, ReactSelectProps } from "react-select";
import { customStyles } from "../utils/constants";

interface PropsType {
  [x: string]: any;
  name: string;
}

const SelectField: React.FC<ReactSelectProps & FieldProps> = ({
  label,
  ...props
}: PropsType) => {

  const [field, meta, helpers] = useField(props);

  const { options } = props;
  const { touched, error, value } = meta;
  const { setValue } = helpers;

  return (
    <>
      <div className="block text-gray-400 font-bold mt-2">{label}</div>
      <Select
        options={options}
        name={field.name}
        placeholder={`Select ${label}...`}
        onChange={(option: Option) => setValue(option.value)}
        instanceId={props.iid}
        styles={customStyles}
        isSearchable
      />
      {error && touched ? (<div className="text-red-400 text-md">{error}</div>) : null}
    </>
  );
};

export default SelectField;
