import { useState } from 'react';

import {
  Form,
  FormError,
  Label,
  Submit,
  SubmitHandler,
  TextField
} from '@redwoodjs/forms';
import { useMutation } from '@redwoodjs/web';
import { toast } from '@redwoodjs/web/toast';

const CREATE = gql`
  mutation CreateCategoryMutation($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      createdAt
    }
  }
`;

interface FormValues {
  name: string;
  comment: string;
}

interface Props {
  transactionId: number;
}

const CategoryForm = ({ transactionId }: Props) => {
  const [hasPosted, setHasPosted] = useState(false);
  const [createCategory, { loading, error }] = useMutation(CREATE, {
    onCompleted: () => {
      setHasPosted(true);
      toast.success('Thank you for your category!');
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (input) => {
    createCategory({ variables: { input: { transactionId, ...input } } });
  };

  return (
    <div className={hasPosted ? 'hidden' : ''}>
      <h3 className="font-light text-lg text-gray-600">Create a Category</h3>
      <Form className="mt-4 w-full" onSubmit={onSubmit}>
        <FormError
          error={error}
          titleClassName="font-semibold"
          wrapperClassName="bg-red-100 text-red-900 text-sm p-3 rounded"
        />
        <Label name="name" className="block text-sm text-gray-600 uppercase">
          Name
        </Label>
        <TextField
          name="name"
          className="block w-full p-1 border rounded text-xs "
          validation={{ required: true }}
        />

        <Submit
          disabled={loading}
          className="block mt-4 bg-blue-500 text-white text-xs font-semibold uppercase tracking-wide rounded px-3 py-2 disabled:opacity-50"
        >
          Submit
        </Submit>
      </Form>
    </div>
  );
};

export default CategoryForm;
