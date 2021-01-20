import React from "react";
import { Formik, Form } from "formik";
import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withApollo } from "../utils/withApollo";

const Login: React.FC<{}> = ({ }) => {
  const router = useRouter();
  const [login] = useLoginMutation();
  return (
    <Formik initialValues={{ usernameOrEmail: "", password: "" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await login({
          variables: values,
          update: (cache, { data }) => {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                __typename: "Query",
                me: data?.login.user,
              },
            });
            cache.evict({ fieldName: "posts:{}" });
          },
        });
        console.log("response:", response);
        if (response.data?.login.errors) {
          setErrors(toErrorMap(response.data.login.errors));
        } else if (response.data?.login.user) {
          if (typeof router.query.next === "string") {
            router.push(router.query.next);
          } else {
            // worked
            router.push("/");
          }
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form>

        </Form>
      )}
    </Formik>
  );
};

export default withApollo({ ssr: false })(Login);